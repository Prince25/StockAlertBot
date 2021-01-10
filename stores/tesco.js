import { fileURLToPath } from "url";
import { ALARM, OPEN_URL, USER_AGENTS } from '../main.js'
import fs from "fs";
import threeBeeps from "../beep.js"
import sendTwilioMessage from "../twilio.js"
import sendAlertToWebhooks from "../webhook.js"
import writeErrorToFile from "../writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


var ps5PreorderPagePath;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://www.tesco.com/groceries/en-GB/products/306276176'
    ps5PreorderPagePath = './html/tescoPreorderPage.html'
    tesco(url, interval);
} else {
    ps5PreorderPagePath = './stores/html/tescoPreorderPage.html'
}


let firstRun = new Set();
let urlOpened = false;
let store = 'Tesco'
export default async function tesco(url, interval) {
    if (url.includes('tescopreorders')) tescoPS5Preorder(url, interval)
    else {
        try {
            let res = await axios.get(url)
            .catch(async function (error) {
                if (error.response.status == 503) console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
                else writeErrorToFile(store, error);
            });

            if (res && res.status == 200) {
                let parser = new DomParser();
                let doc = parser.parseFromString(res.data, 'text/html');
                let title = doc.getElementsByClassName('product-details-tile__title')[0].innerHTML.trim().slice(0, 150)
                let inventory = doc.getElementsByClassName('button small add-control button-secondary')[0].innerHTML
                let image = doc.getElementsByClassName('product-image product-image-visible')[0].getAttribute('src')
                    
                if ((!inventory || !inventory.includes('Add')) && !firstRun.has(url)) {
                    console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                    firstRun.add(url)
                }
                else if (inventory && inventory.includes('Add')) {
                    if (ALARM) threeBeeps();
                    if (OPEN_URL && !urlOpened) { 
                        open(url);
                        sendTwilioMessage(url, title, store)  
                        sendAlertToWebhooks(url, title, image, store)
                        urlOpened = true; 
                        setTimeout(() => urlOpened = false, 1000 * 295) // Open URL and post to webhook every 5 minutes
                    }
                    console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                    console.info(url);
                }
            }
    
        } catch (e) {
            writeErrorToFile(store, e)
        }
    }
};


async function tescoPS5Preorder(url, interval) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';  // Avoid the certification error

    url = url.replace('www.', '')
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            writeErrorToFile(store, error)
        });
        
        if (res && res.status == 200) {
            let ps5PreorderPage = fs.readFileSync(ps5PreorderPagePath, 'utf-8');   
            if (res.data.includes(ps5PreorderPage) && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "PlayStation 5" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (!res.data.includes(ps5PreorderPage)) {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 295) // Open URL and post to webhook every 5 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: PlayStation 5');
                console.info(url);
            }
        }
    } catch (e) {
        writeErrorToFile(store, e)
    }
}
