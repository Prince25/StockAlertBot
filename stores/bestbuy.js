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
    let url = 'https://www.bestbuy.com/site/sony-playstation-5-dualsense-wireless-controller/6430163.p?skuId=6430163' 
    bestbuy(url, interval);
}


const store = 'Best Buy'
const runtimeData = {}
export default async function bestbuy(url, interval) {

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
            else writeErrorToFile(store.replace(' ', ''), error);
        });

        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc, title, inventory, open_box, image
           
            doc = parser.parseFromString(res.data, 'text/html');
            if (url.includes('bestbuy.ca')) {   // Check Best buy Canada
                let scripts = doc.getElementsByTagName('script')
                if (scripts.length > 0) {
                    let json  = scripts.filter(script => script.textContent.includes("window.__INITIAL_STATE__ "))
                    json = json[0].textContent;
                    if (json && json.length > 0) {
                        json = json.slice(json.indexOf("window.__INITIAL_STATE__ = {") + 27, json.indexOf('};') + 1)
                        try { 
                            json = JSON.parse(json)
                            let productInfo = json.product
                            title = productInfo.product.name
                            image = productInfo.product.productImage
                            if (productInfo.availability.shipping.purchasable) inventory = "Add to Cart"
                            else inventory = 'Sold Out'
                        } catch {}
                    }
                } else {
                    inventory = doc.getElementsByClassName('addToCartButton')
                    if (inventory.length > 0) inventory = inventory[0].getAttribute('disabled')
                    if (inventory === null) inventory = "Add to Cart"
                    else inventory = 'Sold Out'
                    try { title = doc.getElementsByTagName('title')[0].textContent.replace(" | Best Buy Canada", "") } catch {}
                    try { image = doc.getElementsByTagName('link').filter(
                        link => link.getAttribute('rel') && link.getAttribute('rel') == "preload" &&
                        link.getAttribute('as') && link.getAttribute('as') == "image")[0].getAttribute("href")} catch {}
                }
            }
            else if (url.includes('combo')) {    // Check package products
                inventory = doc.getElementsByClassName('add-to-cart-button')
                try { title = doc.getElementsByClassName('sku-title')[0].textContent } catch {}
                try { image = doc.getElementsByClassName('picture-wrapper')[0].getElementsByTagName('img')[0].getAttribute('src') } catch {}
            } else { // Check normal products
                try { title = doc.getElementsByClassName('sku-title')[0].childNodes[0].textContent.trim().slice(0, 150) } catch {}
                inventory = doc.getElementsByClassName('add-to-cart-button')
                open_box = doc.getElementsByClassName('open-box-option__label')
                try { image = doc.getElementsByClassName('primary-image')[0].getAttribute('src') } catch {}
            } 

            if (inventory && typeof(inventory) == "object" && inventory.length > 0) inventory = inventory[0].textContent
            if (open_box && open_box.length > 0) {
                if (ALARM) threeBeeps();
                if (!runtimeData[url]['urlOpened']) { 
                    if (OPEN_URL) open(url) 
                    runtimeData[url]['urlOpened'] = true; 
                    setTimeout(() => runtimeData[url]['urlOpened'] = false, 1000 * 295) // Open URL and send alerts every 5 minutes
                }
                console.info(moment().format('LTS') + ': ***** Open Box at ' + store + ' *****: ', title);
                console.info(url);
            }
            if (inventory == 'Add to Cart') {
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
            else if (inventory == 'Sold Out' && runtimeData[url]['firstRun']) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                runtimeData[url]['firstRun'] = false;
            }    
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile(store.replace(' ', ''), e)
    }
};
