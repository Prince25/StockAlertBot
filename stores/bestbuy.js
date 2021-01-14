import { fileURLToPath } from "url";
import { ALARM, OPEN_URL } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlert from "../utils/notification/alert.js"
import writeErrorToFile from "../utils/writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"
import console from "console";


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.bestbuy.com/site/sony-playstation-5-dualsense-wireless-controller/6430163.p?skuId=6430163' 
    bestbuy(url, interval);
}


const store = 'Best Buy'
let firstRun = new Set();
let urlOpened = false;
export default async function bestbuy(url, interval) {
    try {
        let res = await axios.get(url)
        .catch(async function (error) {
            if (error.response.status == 503) console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile(store.replace(' ', ''), error);
        });
        
        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('sku-title')[0].childNodes[0].textContent.trim().slice(0, 150)
            let inventory = doc.getElementsByClassName('add-to-cart-button')
            let open_box = doc.getElementsByClassName('open-box-option__label')
            let image = doc.getElementsByTagName('meta').filter(meta => meta.getAttribute('property') == 'og:image')[0].getAttribute('content')
            
            if (inventory.length > 0) inventory = inventory[0].textContent
            if (open_box && open_box.length > 0) {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 295) // Open URL and post to webhook every 5 minutes
                }
                console.info(moment().format('LTS') + ': ***** Open Box at ' + store + ' *****: ', title);
                console.info(url);
            }
            if (inventory == 'Add to Cart') {
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
            else if (inventory == 'Sold Out' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }    
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile(store.replace(' ', ''), e)
    }
};
