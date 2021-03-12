import { fileURLToPath } from "url";
import { ALARM, OPEN_URL } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlerts from "../utils/notification/alerts.js"
import writeErrorToFile from "../utils/writeToFile.js"
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser";     // https://www.npmjs.com/package/dom-parser
import open from "open"


if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let interval = {
        unit: 'seconds',  // seconds, m: minutes, h: hours
        value: 5
    }
    let url = 'https://www.costco.com/sony-playstation-5-gaming-console-bundle.product.100691489.html'
    costco(url, interval);
}


const store = 'Costco'
const runtimeData = {}
export default async function costco(url, interval) {

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

        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let title = doc.getElementsByTagName('title')[0].innerHTML.trim().slice(0, 150)
            let inventory = doc.getElementById('add-to-cart-btn').getAttribute('value')
            let image = 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg'

            if (inventory == 'Out of Stock' && runtimeData[url]['firstRun']) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                runtimeData[url]['firstRun'] = false;
            }
            else if (inventory != 'Out of Stock') {
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
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile(store, e)
    }
};
