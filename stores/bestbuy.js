import { fileURLToPath } from "url";
import { OPEN_URL } from '../main.js'
import fs from 'fs';
import threeBeeps from "../beep.js"
import sendAlertToWebhooks from "../webhook.js"
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
        var res = await axios.get(url);
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
                console.info(moment().format('LTS') + ': ***** Open Box at BestBuy *****: ', title);
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
                console.info(moment().format('LTS') + ': ***** In Stock at BestBuy *****: ', title);
                console.info(url);
            }
            else if (inventory == 'Sold Out' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at BestBuy. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }    
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        console.info('Unhandled error. Written to logBestbuy.log')
        fs.writeFile('logBestbuy.log', e, function(err, result) {
            if(err) console.info('File write error: ', err);
        });
    }
};
