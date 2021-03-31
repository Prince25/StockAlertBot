import { fileURLToPath } from "url";
import { ALARM, AMAZON_MERCHANT_ID, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from '../main.js'
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
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 25           // Amazon detects bots if too low, do > 10 seconds
    }
    let url = 'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S'
    amazon(url, interval, interval.value, true, false, () => null);
}


const store = 'Amazon'
let badProxies = new Set()
export default async function amazon(url, interval, originalIntervalValue, firstRun, urlOpened, resolve) {
    let res = null, html = null, proxy = null

    try {
        let options = null

        // Setup proxies
        if(PROXIES && PROXY_LIST.length > 0) {
            if (badProxies.size == PROXY_LIST.length) {   // If all proxies are used, start over
                console.info(moment().format('LTS') + ': Tried all proxies in proxies.txt. Will try them again. Consider getting more proxies.')
                badProxies = new Set()
            }
            do {
                proxy = 'http://' + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
            } while(badProxies.has(proxy))

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
        let newUrl;
        if (AMAZON_MERCHANT_ID !== "None") {
            newUrl = url + '?m=' + AMAZON_MERCHANT_ID  // Add Amazon's seller ID
        } else newUrl = url;

        res = await axios.get(newUrl, options)
            .catch(async function (error) {
                if (error.response.status == 503) {
                    console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error for ' + url + '. Nothing to worry about unless you get this all the time!')
                    if(PROXIES) { 
                        console.error('Proxy', proxy, 'might be banned from ' + store + '. Adding it to the bad list.')
                        badProxies.add(proxy)
                    }
                }
                else writeErrorToFile(store, error);
            });

        
        // Extract Information
        if (res && res.status == 200) {
            html = res.data

            // If bot Detected
            if (html.includes("we just need to make sure you're not a robot")) {
                let message = moment().format('LTS') + ': ' + store + ' bot detected. '
                if(PROXIES) {
                    message += 'For proxy: ' + proxy + '. Consider lowering interval.'
                    badProxies.add(proxy)
                }
                else message += 'Consider using proxies or lowering interval.'
                console.error(message)
                resolve({interval: Math.floor(interval.value + Math.random() * originalIntervalValue), urlOpened: urlOpened})
                return
            }

            let parser = new DomParser();
            let doc = parser.parseFromString(html, 'text/html');
            let title = doc.getElementById('productTitle').innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-button')
            let image = doc.getElementById('landingImage').getAttribute('data-old-hires')
            
            if (inventory != null) inventory = inventory.getAttribute('value')
            if (inventory == null && firstRun) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
            }
            else if (inventory != null) {
                if (ALARM) threeBeeps();
                if (!urlOpened) { 
                    if (OPEN_URL) open(url) 
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
        writeErrorToFile(store, e, html, res ? res.status : undefined)
    }
};
