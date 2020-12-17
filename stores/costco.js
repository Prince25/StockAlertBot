import { fileURLToPath } from "url";
import { OPEN_URL } from '../main.js'
import { USER_AGENTS } from '../main.js'
import threeBeeps from "../beep.js"
import sendAlertToWebhooks from "../webhook.js"
import writeErrorToFile from "../writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html'
    costco(url, interval);
}


let firstRun = new Set();
let urlOpened = false;
export default async function costco(url, interval) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error('Costco 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile('Costco', error);
        });

        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByTagName('title')[0].innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-btn').getAttribute('value')

            if (inventory == 'Out of Stock' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at Costco. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory != 'Out of Stock') {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(moment().format('LTS') + ': ***** In Stock at Costco *****: ' + title + "\n" + url)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 115) // Open URL every 2 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at Costco *****: ', title);
                console.info(url);
            }
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile('Costco', e)
    }
};
