import { fileURLToPath } from "url";
import fs from "fs";
import threeBeeps from "../beep.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://www.microcenter.com/product/512484/intel-core-i7-9700k-coffee-lake-36ghz-eight-core-lga-1151-boxed-processor'
    microcenter(url, interval);
}


let firstRun = new Set();
export default async function microcenter(url, interval) {
    let productID = url.match(/(?<=product\/).*(?=\/)/i)[0]
    try {
        const { data } = await axios.get(url).catch(function (error) {
            console.log(error);
        });
        
        let parser = new DomParser();
        let doc = parser.parseFromString(data, 'text/html');
        let title = doc.getElementsByClassName('ProductLink_' + productID)[0].textContent.trim().slice(0, 150)
        let inventory = doc.getElementsByClassName('inventoryCnt')[0].textContent
        
        if (inventory == 'Sold Out' && !firstRun.has(url)) {
            console.info(moment().format('LTS') + ': "' + title + '" not in stock at Microcenter. Will keep retrying every', interval.value, interval.unit)
            firstRun.add(url)
        }
        else if (inventory != 'Sold Out') {
            threeBeeps();
            console.info(moment().format('LTS') + ': ***** In Stock at Microcenter *****: ', title);
            console.info(url);
        }
    } catch (e) {
        console.log('Unhandled error. Written to logMicrocenter.log')
        fs.writeFile('logMicrocenter.log', e, function(err, result) {
            if(err) console.log('File write error: ', err);
        });
    }
};
