import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import fetch from "node-fetch"

export async function checkIfUserIsSubscribed(waId) {
    const response = await fetch(process.env.API_ENDPOINT+"/wa/subscriber", {body: { whatsapp_id: waId }});
    if(response.status!=200) return false;
    var parsed = await response.json();
    return parsed.length > 0;
}