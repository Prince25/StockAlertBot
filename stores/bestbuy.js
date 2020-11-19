import { fileURLToPath } from "url";
import fs from 'fs';
import threeBeeps from "../beep.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.bestbuy.com/site/amd-ryzen-9-5900x-4th-gen-12-core-24-threads-unlocked-desktop-processor-without-cooler/6438942.p?skuId=6438942' 
    bestbuy(url, interval);
}


let firstRun = true;
export default async function bestbuy(url, interval) {
    try {
        var res = await axios.get(url);
        if (res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('sku-title')[0].childNodes[0].textContent
            let inventory = doc.getElementsByClassName('btn btn-disabled btn-lg btn-block add-to-cart-button')[0].textContent
            if (inventory == 'Sold Out' && firstRun) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at BestBuy. Will keep retrying every', interval.value, interval.unit)
                firstRun = false;
            }
            else if (inventory == 'Add to Cart') {
                threeBeeps();
                console.info(moment().format('LTS') + ': ***** In Stock at BestBuy *****: ', title);
                console.info(url);
            }
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        console.log('Unhandled error. Written to logBestbuy.log')
        fs.writeFile('logBestbuy.log', e, function(err, result) {
            if(err) console.log('File write error: ', err);
        });
    }
};
