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
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://www.argos.co.uk/product/7618323'
    argos(url, interval);
}


const store = 'Argos'
let firstRun = new Set();
let urlOpened = false;
export default async function argos(url, interval) {
    let res = null, html = null, proxy = null

    try {
        let options = null

        // Setup proxies
        if(PROXIES && PROXY_LIST.length > 0) {
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
                if(error.errno == "ECONNRESET") console.log('Connection error to Argos. Argos probably ended connection.')
                else writeErrorToFile(store, error);
            });

        
        // Extract Information
        if (res && res.status == 200) {
            html = await res.text()

            let parser = new DomParser();
            let doc = parser.parseFromString(html, 'text/html');
            let title = doc.getElementsByClassName('Namestyles__Main-sc-269llv-1')
            let inventory = doc.getElementsByClassName('Buttonstyles__Button-q93iwm-2 dUQXJf')
            let image = doc.getElementsByClassName('MediaGallerystyles__ImageWrapper-sc-1jwueuh-2 bhjltf')
            
            if (title.length > 0) title = title[0].firstChild.textContent.trim().slice(0, 150)
            else {
                title = doc.getElementById('h1title').textContent
                title = title.replace("Sorry, ", "")
                title = title.replace(" is currently unavailable.", "")
            }

            if (inventory.length > 0) inventory = inventory[0].firstChild.textContent
            
            if (image.length > 0) { 
                image = image[0].getElementsByTagName('img')
                if (image.length > 0) image = 'https:' + image[0].getAttribute('src')
            }

            if ((!inventory || inventory != 'Add to Trolley') && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory && inventory == 'Add to Trolley') {
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
