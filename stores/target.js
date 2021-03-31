import { fileURLToPath } from "url";
import { ALARM, PROXIES, PROXY_LIST, OPEN_URL, TARGET_KEY, TARGET_ZIP_CODE, USER_AGENTS } from '../main.js'
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
        value: 5
    }
    let url = 'https://www.target.com/p/dualsense-wireless-controller-for-playstation-5/-/A-81114477'
    let key = 'ff457966e64d5e877fdbad070f276d18ecec4a01'
    let zip_code = '90024'
    target(url, interval, key, zip_code);
}


const store = 'Target'
const runtimeData = {}
export default async function target(url, interval, key, zip_code) {
    let res = null, html = null, proxy = null
    key = key || TARGET_KEY
    zip_code = zip_code || TARGET_ZIP_CODE

    // First run
    if (!runtimeData.hasOwnProperty(url)) 
        runtimeData[url] = {
            firstRun: true,
            urlOpened: false,
        }

    try {
        let options = null

        // Setup proxies
        if (PROXIES && PROXY_LIST.length > 0) {
            proxy = 'http://' + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
            let agent = new HttpsProxyAgent(proxy);
            options = {
                httpsAgent: agent,
                headers: {
                    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
                }
            }
        }
        else options = { headers: { 'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] } }


        // Get Page
        res = await axios.get(url, options)
            .catch(async function (error) {
                writeErrorToFile(store, error);
            });


        // Extract Information
        if (res && res.status == 200) {
            html = res.data

            let parser = new DomParser();
            let doc = parser.parseFromString(html, 'text/html');
            let productInfo = doc.getElementsByTagName('script').filter(script => script.getAttribute('type') == 'application/ld+json')
            if (productInfo) productInfo = JSON.parse(productInfo[0].textContent)
            else {
                writeErrorToFile(store, 'Unable to get product info for url: ' + url)
                return
            }

            let title = productInfo['@graph'][0]['name']
            let tcin = productInfo['@graph'][0]['sku']
            let image = productInfo['@graph'][0]['image']
            
            let location_id = await axios.get('https://api.target.com/shipt_deliveries/v1/stores?zip=' + zip_code + '&key=' + key, options)
                .then(res => res.data)
                .then(data => data.closest_eligible_store.location_id)
                .catch(e => console.error(moment().format('LTS') + ': Error while fetching data for ' + title))

            let stock_options = await axios.get('https://redsky.target.com/redsky_aggregations/v1/web/pdp_fulfillment_v1?' + 
                'key=' + key + 
                '&tcin=' + tcin +
                '&has_store_positions_store_id=false' + 
                '&store_id=' + location_id +
                '&store_positions_store_id=' + location_id +
                '&scheduled_delivery_store_id=' + location_id +
                '&pricing_store_id=' + location_id, options)
                .then(res => res.data)
                .then(data => data.data.product.fulfillment)
                .catch(e => console.error(moment().format('LTS') + ': Error while fetching data for ' + title))

            let in_store = false;
            if (stock_options && stock_options.store_options && stock_options.store_options.length > 0)
                in_store = stock_options.store_options.some(
                    store => {
                        if (store.order_pickup || store.in_store_only)
                            return store.order_pickup.availability_status == 'IN_STOCK' || store.in_store_only.availability_status == 'IN_STOCK'
                    }
                )
            
            let shipping = false;
            if (stock_options && stock_options.shipping_options)
                shipping = stock_options.shipping_options.availability_status == 'IN_STOCK'
                    
            let delivery = false;
            if (stock_options && stock_options.scheduled_delivery)
                delivery = stock_options.scheduled_delivery.availability_status == 'IN_STOCK'
            
            let inventory = in_store || shipping || delivery
                        

            if (inventory) {
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
            else if (runtimeData[url]['firstRun']) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                runtimeData[url]['firstRun'] = false;
            }
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile(store, e, html, res ? res.status : undefined)
    }
};
