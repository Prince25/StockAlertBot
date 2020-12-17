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
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.bestbuy.com/site/sony-playstation-5-dualsense-wireless-controller/6430163.p?skuId=6430163' 
    bestbuy(url, interval);
}


let firstRun = new Set();
let urlOpened = false;
export default async function bestbuy(url, interval) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error('Best Buy 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile('BestBuy', error);
        });

        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('sku-title')[0].childNodes[0].textContent.trim().slice(0, 150)
            let inventory = doc.getElementsByClassName('add-to-cart-button')
            let open_box = doc.getElementsByClassName('open-box-option__label')

            if (inventory.length > 0) inventory = inventory[0].textContent
            if (open_box && open_box.length > 0) {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { open(url); urlOpened = true; setTimeout(() => urlOpened = false, 1000 * 115) }  // Open URL every 2 minutes
                console.info(moment().format('LTS') + ': ***** Open Box at Best Buy *****: ', title);
                console.info(url);
            }
            if (inventory == 'Add to Cart') {
                threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(moment().format('LTS') + ': ***** In Stock at Best Buy *****: ' + title + "\n" + url)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 115) // Open URL every 2 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at Best Buy *****: ', title);
                console.info(url);
            }
            else if (inventory == 'Sold Out' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at Best Buy. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }    
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile('BestBuy', e)
    }
};
