import { fileURLToPath } from "url";
import { OPEN_URL } from '../main.js'
import fs from "fs";
import threeBeeps from "../beep.js"
import sendAlertToWebhooks from "../webhook.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 30
    }
    let url = 'https://www.antonline.com/Sony/Electronics/Audio_Electronics/Headsets+Earsets/1398728'
    antonline(url, interval);
}


let firstRun = new Set();
let urlOpened = false;
export default async function antonline(url, interval) {
    try {
        var res = await axios.get(url);
        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('title')[0].innerHTML.slice(0, 150)
            let inventory = doc.getElementsByClassName('uk-button uk-button-primary add_to_cart')

            if (inventory && inventory.length > 0) inventory = inventory[0].textContent
            if (inventory && inventory.length == 0 && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at AntOnline. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory && inventory == 'Add to Cart') {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(moment().format('LTS') + ': ***** In Stock at AntOnline *****: ' + title + "\n" + url)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 115) // Open URL every 2 minutes
                }  
                console.info(moment().format('LTS') + ': ***** In Stock at AntOnline *****: ', title);
                console.info(url);
            }
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        console.error('Unhandled error. Written to logAntOnline.log')
        fs.writeFile('logAntOnline.log', e, function(err, result) {
            if(err) console.error('File write error: ', err);
        });
    }
};
