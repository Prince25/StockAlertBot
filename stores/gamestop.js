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
        value: 5
    }
    let url = 'https://www.gamestop.com/video-games/playstation-5/accessories/products/sony-dualsense-wireless-controller/11106262.html'
    gamestop(url, interval);
}


const store = 'Gamestop'
let firstRun = new Set();   // Used to show initial message, once for each product, that product isn't available but will keep checking in the background
let urlOpened = false;
export default async function gamestop(url, interval) {
    let res = null, html = null, proxy = null

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
            let productInfo = doc.getElementsByTagName('script')
            let title = doc.getElementsByClassName('product-name')
            let inventory = null, productId = null
            let image = doc.getElementsByClassName('product-main-image-gallery')

            if (productInfo.length > 0) {
                productInfo = productInfo.filter(script => script.textContent.includes('dataLayer = window.dataLayer || [];'))
                productInfo = productInfo[1].textContent
                productInfo = productInfo.substring(
                    productInfo.indexOf("dataLayer.concat(") + 17,
                    productInfo.indexOf(");")
                );
                productInfo = productInfo.replace(/undefined/g, 'null')
                productInfo = JSON.parse(productInfo)
                productInfo = productInfo[1].product[0].productInfo
                inventory = productInfo.availability
                productId = productInfo.productID
            }

            if (title.length > 0) title = title[0].textContent.trim().slice(0, 150)
            else title = productInfo.name

            if (image.length > 0) {
                image = image[0].getElementsByTagName('img')
                if (image.length > 0) image = image[0].getAttribute('src')
            } else if (productId) image = "https://media.gamestop.com/i/gamestop/" + productId
            else image = 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg'

            if (inventory == 'Available') {
                if (ALARM) threeBeeps();
                if (!urlOpened) {
                    if (OPEN_URL) open(url)
                    sendAlerts(url, title, image, store)
                    urlOpened = true;
                    setTimeout(() => urlOpened = false, 1000 * 295) // Open URL and send alerts every 5 minutes
                }
                console.info(moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ', title);
                console.info(url);
            }
            else if (inventory != 'Available' && !firstRun.has(url)) {
                console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
                firstRun.add(url)
            }
        }

    } catch (e) {
        writeErrorToFile(store, e, html, res.status)
    }
};
