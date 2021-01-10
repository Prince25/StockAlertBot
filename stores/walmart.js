import { fileURLToPath } from "url";
import { ALARM, OPEN_URL, USER_AGENTS } from '../main.js'
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
        value: 25           // walmart detects bots if too low, do > 10 seconds
    }
    let url = 'https://www.walmart.com/ip/Cyberpunk-2077-Warner-Bros-PlayStation-4/786104378'
    walmart(url, interval, interval.value, true, false, () => null);
}

const store = 'Walmart'
export default async function walmart(url, interval, originalIntervalValue, firstRun, urlOpened, resolve) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            if (error.response.status == 412) console.error(moment().format('LTS') + ': ' + store + ' 412 (service unavailable) Error. Changing interval rate for', url)
            else writeErrorToFile(store, error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('prod-ProductTitle')[0].textContent
            let inventory = doc.getElementById('add-on-atc-container')
            let image = doc.getElementsByTagName('meta').filter(meta => meta.getAttribute('property') == 'og:image')[0].getAttribute('content')
            
            if (inventory != null) inventory = inventory.getElementsByClassName('button-wrapper')[0].textContent
            if (inventory != 'Add to cart' && firstRun) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
            }
            else if (inventory != null && inventory == 'Add to cart') {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(url, title, image, store)
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
