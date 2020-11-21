import { fileURLToPath } from "url";
import fs from "fs";
import threeBeeps from "../beep.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html'
    costco(url, interval);
}


let firstRun = new Set();
export default async function costco(url, interval) {
    try {
        var res = await axios.get(url);
        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByTagName('title')[0].innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-btn').getAttribute('value')

            if (inventory == 'Out of Stock' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at Costco. Will keep retrying every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory != 'Out of Stock') {
                threeBeeps();
                console.info(moment().format('LTS') + ': ***** In Stock at Costco *****: ', title);
                console.info(url);
            }
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        console.error('Unhandled error. Written to logCostco.log')
        fs.writeFile('logCostco.log', e, function(err, result) {
            if(err) console.error('File write error: ', err);
        });
    }
};
