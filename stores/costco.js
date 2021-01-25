import { fileURLToPath } from "url";
import { ALARM, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlerts from "../utils/notification/alerts.js"
import writeErrorToFile from "../utils/writeToFile.js"
import open from "open"
import moment from "moment"
import fetch from 'node-fetch'
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import HttpsProxyAgent from 'https-proxy-agent'


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html'
    costco(url, interval);
}


const store = 'Costco'
let firstRun = new Set();
let urlOpened = false;
export default async function costco(url, interval) {
    let res = null, html = null, proxy = null

    try {
        let options = null

        // Setup proxies
        if (PROXIES && PROXY_LIST.length > 0) {
            proxy = 'http://' + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
            let agent = new HttpsProxyAgent(proxy);
            options = {
                agent: agent,
                headers: {
                    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
                }
            }
        }
        else options = { headers: { 'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] } }


        // Fetch Page
        res = await fetch(url, options)
            .catch(async function (error) {
                writeErrorToFile(store, error);
            });


        // Extract Information
        if (res && res.status == 200) {
            html = await res.text()
            
            let parser = new DomParser();
            let doc = parser.parseFromString(html, 'text/html');
            let title = doc.getElementsByTagName('title')[0].innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-btn').getAttribute('value')
            let image = 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg'

            if (inventory == 'Out of Stock' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory != 'Out of Stock') {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlerts(url, title, image, store)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 295) // Open URL and post to webhook every 5 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                console.info(url);
            }
        } 

    } catch (e) {
        writeErrorToFile(store, e, html, res.status)
    }
};
