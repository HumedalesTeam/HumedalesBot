import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import fetch from "node-fetch"

export async function checkIfUserIsSubscribed(waId) {
    const response = await fetch(process.env.API_ENDPOINT+"/wa/subscriber/"+waId, {headers: { "x-api-key": process.env.X_API_KEY}});
    if(response.status!=200) return false;
    var parsed = await response.json();
    if(parsed=="") return false;
    return parsed.length > 0;
}

export async function modifyUserSubscription(waId, subscribe) {
    var body = { whatsapp_id: waId, area: 'rosario'};
    const response = await fetch(process.env.API_ENDPOINT+"/wa/subscriber/", {method: (subscribe ? "PUT" : "DELETE"), body: JSON.stringify(body), headers: { "x-api-key": process.env.X_API_KEY, 'Content-Type': 'application/json'}})
    var text = await response.text();
}

export default {
    checkIfUserIsSubscribed: checkIfUserIsSubscribed,
    modifyUserSubscription: modifyUserSubscription
}