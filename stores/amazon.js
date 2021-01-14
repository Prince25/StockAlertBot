import { fileURLToPath } from "url";
import { ALARM, OPEN_URL, USER_AGENTS } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlert from "../utils/notification/alert.js"
import writeErrorToFile from "../utils/writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 25           // Amazon detects bots if too low, do > 10 seconds
    }
    let url = 'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S'
    amazon(url, interval, interval.value, true, false, () => null);
}

const store = 'Amazon'
export default async function amazon(url, interval, originalIntervalValue, firstRun, urlOpened, resolve) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Changing interval rate for', url)
            else writeErrorToFile(store, error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementById('productTitle').innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-button')
            let image = doc.getElementById('landingImage').getAttribute('data-old-hires')
            
            if (inventory != null) inventory = inventory.getAttribute('value')
            if (inventory != 'Add to Cart' && firstRun) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
            }
            else if (inventory != null && inventory == 'Add to Cart') {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlert(url, title, image, store)
                    urlOpened = true; 
                }
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                console.info(url);
            }
            resolve({interval: interval.value, urlOpened: urlOpened});
        }
        else resolve({interval: Math.floor(interval.value + Math.random() * originalIntervalValue), urlOpened: urlOpened})

    } catch (e) {
        writeErrorToFile(store, e)
    }
};
