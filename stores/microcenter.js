import { fileURLToPath } from "url";
import { ALARM, OPEN_URL, USER_AGENTS } from '../main.js'
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
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://www.microcenter.com/product/613412/pny-quadro-rtx-4000-single-fan-8gb-gddr6-pcie-30-graphics-card'
    microcenter(url, interval);
}


const store = 'Microcenter'
let firstRun = new Set();
let urlOpened = false;
export default async function microcenter(url, interval) {
    let productID = url.match(/(?<=product\/).*(?=\/)/i)[0]
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        })
        .catch(async function (error) {
            if (error.response && error.response.status == 503) console.error(moment().format('LTS') + ': ' +'Microcenter 503 (service unavailable) Error. Changing interval rate for', url)
            else writeErrorToFile(store, error);
        });
        
        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('ProductLink_' + productID)
            let image = doc.getElementsByTagName('meta').filter(meta => meta.getAttribute('property') == 'og:image')[0].getAttribute('content')
            
            if (title.length > 0) title = title[0].textContent.trim().slice(0, 150)
            
            if (!res.data.includes('in stock') && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (res.data.includes('in stock')) {
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
        writeErrorToFile(store, e);
    }
};
