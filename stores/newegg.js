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
        value: 5
    }
    let url = 'https://www.newegg.com/p/N82E16868110292'
    newegg(url, interval);
}


const store = 'Newegg'
let firstRun = new Set();
let urlOpened = false;
export default async function newegg(url, interval) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile(store, error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc, title, inventory, image

            // Check combo product
            if (url.includes('ComboDealDetails')) {
                doc = parser.parseFromString(res.data, 'text/html');
                title = doc.getElementsByTagName('title')[0].textContent
                inventory = doc.getElementsByClassName('atnPrimary')
                image = 'https:' + doc.getElementById('mainSlide_0').getAttribute('src')
            } else { // Check normal product
                doc = parser.parseFromString(res.data, 'text/html');
                title = doc.getElementsByClassName('product-title')[0].innerHTML.trim().slice(0, 150)
                inventory = doc.getElementsByClassName('btn btn-primary btn-wide')
                image = doc.getElementsByClassName('image_url')
                if (image.length > 0) image = image[0].textContent
            }
            
            if (inventory.length > 0) {
                inventory = inventory[0].firstChild.textContent
                inventory = inventory.toLowerCase()
            }
            
            if ((!inventory || inventory != 'add to cart ') && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory && inventory == 'add to cart ') {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) {
                    open(url);
                    sendAlert(url, title, image, store)
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
};
