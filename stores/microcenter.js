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


function writeErrorToFile(error) {
    fs.writeFile('logMicrocenter.log', error, function(e, result) {
        if(e) console.error('File write error: ', e);
    });
    console.error('Unhandled error. Written to logMicrocenter.log')
}


let firstRun = new Set();
export default async function microcenter(url, interval) {
    let productID = url.match(/(?<=product\/).*(?=\/)/i)[0]
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.info(moment().format('LTS') + ': ' +'Microcenter 503 (service unavailable) Error. Changing interval rate for', url)
            else writeErrorToFile(error);
        });
        
        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
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
        }
    } catch (e) {
        writeErrorToFile(e);
    }
};
