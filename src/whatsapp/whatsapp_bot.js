import {create, Client, QRFormat, QRQuality } from "@open-wa/wa-automate";

let client;


function setup() {
    client = create({
        sessionId: "HumedalesBot",
        sessionDataPath: "./",
        authTimeout: 0,
        cacheEnabled: false,
        cachedPatch: true,
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
}


setup();