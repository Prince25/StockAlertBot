import { fileURLToPath } from "url";
import { OPEN_URL } from '../main.js'
import threeBeeps from "../beep.js"
import sendAlertToWebhooks from "../webhook.js"
import writeErrorToFile from "../writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://www.newegg.com/p/N82E16868110292'
    newegg(url, interval);
}


let firstRun = new Set();
let urlOpened = false;
export default async function newegg(url, interval) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error('Newegg 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile('Newegg', error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('product-title')[0].innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementsByClassName('btn btn-primary btn-wide')
            
            if (inventory.length > 0) inventory = inventory[0].firstChild.textContent
            if ((!inventory || inventory != 'Add to cart ') && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at Newegg. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory && inventory == 'Add to cart ') {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(moment().format('LTS') + ': ***** In Stock at Newegg *****: ' + title + "\n" + url)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 115) // Open URL every 2 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at Newegg *****: ', title);
                console.info(url);
            }
        }

    } catch (e) {
        writeErrorToFile('Newegg', e)
    }
};
