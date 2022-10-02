import {create, Client, QRFormat, QRQuality } from "@open-wa/wa-automate";
import loc from "./localization/es_AR.json" assert { type: 'json' }; // this assertion is required
const ST_MAIN_MENU = "main";
const STATUS_B = "";
import users from "./user_management";
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
                            if(await users.checkIfUserIsSubscribed(message.chatId)) {
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


setup();