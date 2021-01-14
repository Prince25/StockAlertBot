import { fileURLToPath } from "url";
import { ALARM, OPEN_URL, TARGET_KEY, TARGET_ZIP_CODE, USER_AGENTS } from '../main.js'
import threeBeeps from "../utils/notification/beep.js"
import sendAlert from "../utils/notification/alert.js"
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
    let url = 'https://www.target.com/p/dualsense-wireless-controller-for-playstation-5/-/A-81114477'
    let key = 'ff457966e64d5e877fdbad070f276d18ecec4a01'
    let zip_code = '90024'
    target(url, interval, key, zip_code);
}


const store = 'Target'
let firstRun = new Set();
let urlOpened = false;
export default async function target(url, interval, key, zip_code) {
    key = key || TARGET_KEY
    zip_code = zip_code || TARGET_ZIP_CODE
    try {
        let res = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
            }
        }).catch(async function (error) {
            if (error.response.status == 503) console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
            else writeErrorToFile(store, error);
        });

        if (res && res.status === 200) {
            let parser = new DomParser();
            let doc = parser.parseFromString(res.data, 'text/html');
            let productInfo = JSON.parse(doc.getElementsByTagName('script').filter(script => script.getAttribute('type') == 'application/ld+json')[0].textContent)
            let title = productInfo['@graph'][0]['name']
            let tcin = productInfo['@graph'][0]['sku']
            let image = productInfo['@graph'][0]['image']
            
            let location_id = await axios.get('https://api.target.com/shipt_deliveries/v1/stores?zip=' + zip_code + '&key=' + key)
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
                '&pricing_store_id=' + location_id)
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
                if (OPEN_URL && !urlOpened) { 
                    open(url); 
                    sendAlert(url, title, image, store)
                    urlOpened = true; 
                    setTimeout(() => urlOpened = false, 1000 * 295) // Open URL and post to webhook every 5 minutes
                } 
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                console.info(url);
            }
            else if (!firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
        } else {
            console.info(moment().format('LTS') + ': Error occured checking ' + title + '. Retrying in', interval.value, interval.unit)
        }

    } catch (e) {
        writeErrorToFile(store, e)
    }
};
