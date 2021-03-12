import { fileURLToPath } from "url";
import { ALARM, OPEN_URL} from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlerts from "../utils/notification/alerts.js"
import writeErrorToFile from "../utils/writeToFile.js"
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


const store = 'Argos'
const runtimeData = {}
export default async function argos(url, interval) {

    // First run
    if (!runtimeData.hasOwnProperty(url)) 
        runtimeData[url] = {
            firstRun: true,
            urlOpened: false,
        }

    try {
        let res = await axios.get(url)
        .catch(async function (error) {
            if (error.response.status == 503) console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile(store, error);
        });

        if (res && res.status == 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByClassName('Namestyles__Main-sc-269llv-1')
            let inventory = doc.getElementsByClassName('xs-8--none')
            let image = doc.getElementsByClassName('MediaGallerystyles__ImageWrapper-sc-1jwueuh-2')
            
            if (title.length > 0) title = title[0].firstChild.textContent.trim().slice(0, 150)
            else {
                title = doc.getElementById('h1title').textContent
                title = title.replace("Sorry, ", "")
                title = title.replace(" is currently unavailable.", "")
            }
            if (inventory.length > 0) inventory = inventory[0].textContent.replace(/<!-- -->/g, '')
            if (image.length > 0) { 
                image = image[0].getElementsByTagName('img')
                if (image.length > 0) image = 'https:' + image[0].getAttribute('src')
            }

            if ((!inventory || inventory != 'Add to trolley') && runtimeData[url]['firstRun']) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                runtimeData[url]['firstRun'] = false;
            }
            else if (inventory && inventory == 'Add to trolley') {
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
        writeErrorToFile(store, e)
    }
};
