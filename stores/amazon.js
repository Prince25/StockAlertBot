import { fileURLToPath } from "url";
import { ALARM, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlerts from "../utils/notification/alerts.js"
import writeErrorToFile from "../utils/writeToFile.js"
import open from "open"
import moment from "moment";
import fetch from 'node-fetch'
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import HttpsProxyAgent from 'https-proxy-agent'


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 25           // Amazon detects bots if too low, do > 10 seconds
    }
    let url = 'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S'
    amazon(url, interval, interval.value, true, false, () => null);
}

const store = 'Amazon'
export default async function amazon(url, interval, originalIntervalValue, firstRun, urlOpened, resolve) {
    let res = null, html = null, proxy = null

    try {
        let options = null

        // Setup proxies
        if(PROXIES) {
            proxy = 'http://' + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
            let agent = new HttpsProxyAgent(proxy);
            options = { 
                agent: agent, 
                headers: {
                    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
                }
            }
        } 
        else options = { headers: { 'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] } }
        
        res = await fetch(url, options)
            .catch(async function (error) {
                writeErrorToFile(store, error);
            });

        if (res && res.status == 200) {
            html = await res.text()

            // If bot Detected
            if (html.includes("we just need to make sure you're not a robot")) {
                let message = moment().format('LTS') + ': ' + store + ' bot detected. '
                if(PROXIES) message += 'For proxy: ' + proxy + '. Consider lowering interval.'
                else message += 'Consider using proxies or lowering interval.'
                console.error(message)
                writeErrorToFile(store, 'asd')
                resolve({interval: Math.floor(interval.value + Math.random() * originalIntervalValue), urlOpened: urlOpened})
                return
            }

            let parser = new DomParser();
            let doc = parser.parseFromString(html, 'text/html');
            let title = doc.getElementById('productTitle').innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-button')
            let image = doc.getElementById('landingImage').getAttribute('data-old-hires')
            
            if (inventory != null) inventory = inventory.getAttribute('value')
            if (inventory != 'Add to Cart' && firstRun) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
            }
            else if (inventory != null && inventory == 'Add to Cart') {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlerts(url, title, image, store)
                    urlOpened = true; 
                }
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                console.info(url);
            }
            resolve({interval: interval.value, urlOpened: urlOpened});
        }
        else resolve({interval: Math.floor(interval.value + Math.random() * originalIntervalValue), urlOpened: urlOpened})

    } catch (e) {
        writeErrorToFile(store, e, html, res.status)
    }
};
