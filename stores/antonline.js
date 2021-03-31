import { fileURLToPath } from "url";
import { ALARM, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlerts from "../utils/notification/alerts.js"
import writeErrorToFile from "../utils/writeToFile.js"
import open from "open"
import axios from "axios";
import moment from "moment"
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import HttpsProxyAgent from 'https-proxy-agent'


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 30
    }
    let url = 'https://www.antonline.com/Sony/Electronics/Audio_Electronics/Headsets+Earsets/1398728'
    antonline(url, interval);
}


const store = 'Ant Online'
const runtimeData = {}
export default async function antonline(url, interval) {
    let res = null, html = null, proxy = null

    // First run
    if (!runtimeData.hasOwnProperty(url)) 
        runtimeData[url] = {
            firstRun: true,
            urlOpened: false,
        }

    try {
        let options = null

        // Setup proxies
        if(PROXIES && PROXY_LIST.length > 0) {
            proxy = 'http://' + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
            let agent = new HttpsProxyAgent(proxy);
            options = { 
                httpsAgent: agent, 
                headers: {
                    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
                }
            }
        } 
        else options = { headers: { 'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] } }


        // Get Page
        res = await axios.get(url, options)
            .catch(async function (error) {
                writeErrorToFile(store.replace(' ', ''), error);
            });


        // Extract Information
        if (res && res.status === 200) {
            html = res.data

            let parser = new DomParser();
            let doc = parser.parseFromString(html, 'text/html');
            let title = doc.getElementsByClassName('title')
            let inventory = doc.getElementsByClassName('uk-button uk-button-primary add_to_cart')
            let image = doc.getElementsByClassName('uk-slideshow')

            if(title.length > 0) title = title[0].innerHTML.slice(0, 150)
            if(image.length > 0) {
                image = parser.parseFromString(image[0].innerHTML, 'text/html')
                image = image.getElementsByTagName('img')
                image = image[0].getAttribute('src')
            }
            else {
                image = doc.getElementsByClassName('main_img')
                image = image.length > 0 ? image[0].getAttribute('src').replace("45", "500") : null
            }
            if (inventory && inventory.length > 0) inventory = inventory[0].textContent
            
            if (inventory && inventory.length == 0 && runtimeData[url]['firstRun']) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                runtimeData[url]['firstRun'] = false;
            }
            else if (inventory && inventory == 'Add to Cart') {
                if (ALARM) threeBeeps();
                if (!runtimeData[url]['urlOpened']) { 
                    if (OPEN_URL) open(url)
                    sendAlerts(url, title, image, store)
                    runtimeData[url]['urlOpened'] = true; 
                    setTimeout(() => runtimeData[url]['urlOpened'] = false, 1000 * 295) // Open URL and send alerts every 5 minutes
                }  
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                console.info(url);
            }
        }

    } catch (e) {
        writeErrorToFile(store.replace(' ', ''), e, html, res ? res.status : undefined)
    }
};
