import {create, Client, QRFormat, QRQuality } from "@open-wa/wa-automate";
import { readFile } from 'fs/promises';

const loc = JSON.parse(await readFile(new URL('./localization/es_AR.json', import.meta.url)));
const ST_MAIN_MENU = "main";
const STATUS_B = "";
import users from "./user_management.js";
let client;

/*
    Warning: Potential memory leak; should clean every now and then or restart the bot instance.
*/
var chatStatus = {}


function setup() {
    client = create({
        sessionId: "HumedalesBot",
        sessionDataPath: "./",
        authTimeout: 0,
        cacheEnabled: false,
        cachedPatch: true,
        /*
            These flags help maintain stability,
            and also prevent reconnection issues.
        */
        chromiumArgs: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--aggressive-cache-discard",
          "--disable-cache",
          "--disable-application-cache",
          "--disable-offline-load-stale-cache",
          "--disk-cache-size=0",
        ],
        deleteSessionDataOnLogout: false,
        disableSpins: true,
        headless: true,
        killProcessOnBrowserClose: true,
        qrFormat: QRFormat.PNG,
        qrLogSkip: false,
        qrQuality: QRQuality.EIGHT,
        qrTimeout: 0,
        restartOnCrash: true,
        throwErrorOnTosBlock: false,
        useChrome: true,
    }).then(async client => await start(client));
}

async function start(whatsappClient) {
    client = whatsappClient;
    console.log("Whatsapp client started!");
    var chats = await client.getAllChats();
    for(var i=0;i<chats.length;i++) {
        console.log(`Chat ${i}: ${chats[i].id}`)
    }
    await client.sendText("120363044984461166@g.us", "hello!");

    client.onMessage(async (message)=>{
        console.log(message.body);
        if(message.body==".alert") {
            await sendAlert({
                distance: 20,
                nodes: 5,
                imageUrl: "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor,MODIS_Terra_Thermal_Anomalies_Day,Reference_Features_15m&CRS=EPSG:4326&TIME=2022-09-13&WRAP=DAY,DAY,X&BBOX=-33.5,-61,-32,-59&FORMAT=image/jpeg&WIDTH=910&HEIGHT=683&AUTOSCALE=FALSE&ts=1664476732816"
            });
            return;
        }
        console.log(chatStatus[message.chatId] ?? "none");
        if(!chatStatus[message.chatId]) {
            chatStatus[message.chatId] = ST_MAIN_MENU;
            client.sendText(message.chatId, loc.welcomeScreen);
            client.sendText(message.chatId, loc.initialMenuChoices);
        } else {
            switch(chatStatus[message.chatId]) {
                case ST_MAIN_MENU:
                    var opt = parseInt(message.body);
                    var simpleMessages = ["","", loc.getInformation, loc.getInvolved, loc.donate, loc.submitSympthoms]
                    switch(opt) {
                        case 1:
                            //TODO verify if the user is NOT signed up
                            var isSubscribed = await users.checkIfUserIsSubscribed(message.chatId);
                            console.log(isSubscribed);
                            if(!isSubscribed) {
                                await users.modifyUserSubscription(message.chatId, true);
                                client.sendText(message.chatId, loc.successfullySubscribed);
                            } else {
                                client.sendText(message.chatId, loc.alreadySubscribed);
                            }
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                            client.sendText(message.chatId, simpleMessages[opt]);
                            break;
                        case 6:
                            //TODO verify if the user is actually signed up
                            if(2+2==4) {
                                client.sendText(message.chatId, loc.successfullyUnsubscribed);
                            } else {
                                client.sendText(message.chatId, loc.notSubscribed);
                            }
                            break;
                        default:
                            client.sendText(message.chatId, loc.invalidChoice);
                            client.sendText(message.chatId, loc.initialMenuChoices);
                            break;
                    }
                    break;
            }
        }
    });
}


async function sendAlert(alertData) {
    var ids = await users.getSubscribedIDs();
    console.log(ids);
    for(var i=0;i<ids.length;i++) {
        console.log(`Id: ${ids[i]}`);
        try {
            var chat = await client.getChatById(ids[i]);
            console.log(`Chat is ${chat}`);
            console.log(chat);
            if(chat!=null) {
                await client.sendImage(chat.id, alertData.imageUrl, 'filename.jpeg', 
                loc.alert.replace("%DISTANCE%", alertData.distance).replace("%NODES%", alertData.nodes))
            }
        } catch(err) {

        }
    }
}


setup();