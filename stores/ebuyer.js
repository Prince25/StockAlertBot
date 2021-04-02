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
		unit: 'seconds',    // seconds, m: minutes, h: hours
		value: 5
	}
	let url = 'https://www.ebuyer.com/1140018-asus-geforce-rtx-3080-10gb-gddr6x-rog-strix-oc-white-ampere-graphics-rog-strix-rtx3080-o10g-white'
	ebuyer(url, interval);
}


const store = 'Ebuyer'
const runtimeData = {}
export default async function ebuyer(url, interval) {
	let res = null, html = null, proxy = null

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
				if (error.response && error.response.status == 503) {
					console.error(moment().format('LTS') + ': ' + store + ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.')
					if (PROXIES) {
						console.error('Proxy', proxy, 'might be banned from ' + store + '. Adding it to the bad list.')
						badProxies.add(proxy)
					}
				}
				else writeErrorToFile(store, error);
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
			
			let title = productInfo.name
			let image = productInfo.image
			let inventory = doc.getElementsByClassName('js-add-to-mini-basket')
			
			if (inventory.length > 0) inventory = inventory[0].textContent
			
			if (inventory != 'Add to Basket' && runtimeData[url]['firstRun']) {
				console.info(moment().format('LTS') + ': "' + title + '" not in stock at ' + store + '.' + ' Will keep retrying in background every', interval.value, interval.unit)
				runtimeData[url]['firstRun'] = false;
			}
			else if (inventory == 'Add to Basket') {
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
		writeErrorToFile(store, e, html)
	}
};
