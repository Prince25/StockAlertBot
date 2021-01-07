import { fileURLToPath } from "url";
import { ALARM, OPEN_URL, USER_AGENTS } from '../main.js'
import threeBeeps from "../beep.js"
import sendAlertToWebhooks from "../webhook.js"
import writeErrorToFile from "../writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',    // seconds, m: minutes, h: hours
        value: 5           
    }
    let url = 'https://www.argos.co.uk/product/7618323'
    argos(url, interval);
}


let firstRun = new Set();
let urlOpened = false;
export default async function argos(url, interval) {
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error('Argos 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile('Argos', error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('Namestyles__Main-sc-269llv-1 bojEI')
            let inventory = doc.getElementsByClassName('Buttonstyles__Button-q93iwm-2 dUQXJf')
            let image = 'https:' + doc.getElementsByClassName('MediaGallerystyles__ImageWrapper-sc-1jwueuh-2 bhjltf')[0].getElementsByTagName('img')[0].getAttribute('src')
            let store = 'Argos'

            if (title.length > 0) title = title[0].firstChild.textContent.trim().slice(0, 150)
            else {
                title = doc.getElementById('h1title').textContent
                title = title.replace("Sorry, ", "")
                title = title.replace(" is currently unavailable.", "")
            }
            if (inventory.length > 0) inventory = inventory[0].firstChild.textContent

            if ((!inventory || inventory != 'Add to Trolley') && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at Argos. Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
            else if (inventory && inventory == 'Add to Trolley') {
                if (ALARM) threeBeeps();
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlertToWebhooks(url, title, image, store)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 115) // Open URL every 2 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at Argos *****: ', title);
                console.info(url);
            }
        }

    } catch (e) {
        writeErrorToFile('Argos', e)
    }
};
