import { fileURLToPath } from "url";
import fs from "fs";
import threeBeeps from "../beep.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 30           // Amazon detects bots if too low, do > 10 seconds
    }
    let url = 'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S'
    amazon(url, interval);
}


let firstRun = new Set();
export default async function amazon(url, interval) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
            }
        }).catch(function (error) {
            console.log(error);
        });
        
        let parser = new DomParser();
        let doc = parser.parseFromString(data, 'text/html');
        let title = doc.getElementById('productTitle').innerHTML.trim().slice(0, 150)
        let inventory = doc.getElementById('add-to-cart-button')

        if (inventory != null) inventory = inventory.getAttribute('value')
        if (inventory != 'Add to Cart' && !firstRun.has(url)) {
            console.info(moment().format('LTS') + ': "' + title + '" not in stock at Amazon. Will keep retrying every', interval.value, interval.unit)
            firstRun.add(url)
        }
        else if (inventory != null && inventory == 'Add to Cart') {
            threeBeeps();
            console.info(moment().format('LTS') + ': ***** In Stock at Amazon *****: ', title);
            console.info(url);
        }
    } catch (e) {
        console.log('Unhandled error. Written to logAmazon.log')
        fs.writeFile('logAmazon.log', e, function(err, result) {
            if(err) console.log('File write error: ', err);
        });
    }
};
