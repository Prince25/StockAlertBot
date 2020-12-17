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
        value: 25           // Amazon detects bots if too low, do > 10 seconds
    }
    let url = 'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S'
    amazon(url, interval, interval.value, true, false, () => null);
}


export default async function amazon(url, interval, originalIntervalValue, firstRun, urlOpened, resolve) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error(moment().format('LTS') + ': ' +'Amazon 503 (service unavailable) Error. Changing interval rate for', url)
            else writeErrorToFile('Amazon', error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementById('productTitle').innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-button')

            if (inventory != null) inventory = inventory.getAttribute('value')
            if (inventory != 'Add to Cart' && firstRun) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at Amazon. Will keep retrying every', interval.value, interval.unit)
            }
            else if (inventory != null && inventory == 'Add to Cart') {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(moment().format('LTS') + ': ***** In Stock at Amazon *****: ' + title + "\n" + url)
                    urlOpened = true; 
                }
                console.info(moment().format('LTS') + ': ***** In Stock at Amazon *****: ', title);
                console.info(url);
            }
            resolve({interval: interval.value, urlOpened: urlOpened});
        }
        else resolve({interval: Math.floor(interval.value + Math.random() * originalIntervalValue), urlOpened: urlOpened})

    } catch (e) {
        writeErrorToFile('Amazon', e)
    }
};
