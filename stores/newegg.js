import { fileURLToPath } from "url";
import { ALARM, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from "../main.js";
import threeBeeps from "../src/utils/notifications/beep.js.js.js";
import sendAlerts from "../src/utils/notifications/alerts.js.js.js";
import { writeErrorToFile } from "../src/utils/log.js";
import open from "open";
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser"; // https://www.npmjs.com/package/dom-parser
import HttpsProxyAgent from "https-proxy-agent";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	let interval = {
		unit: "seconds", // seconds, m: minutes, h: hours
		value: 5,
	};
	let url = "https://www.newegg.com/p/N82E16868110292";
	newegg(url, interval);
}

const store = "Newegg";
const runtimeData = {};
let badProxies = new Set();
export default async function newegg(url, interval) {
	let response = undefined,
		html = undefined,
		proxy = undefined;

	// First run
	if (!{}.hasOwnProperty.call(url))
		runtimeData[url] = {
			firstRun: true,
			urlOpened: false,
		};

	try {
		let options = undefined;

		// Setup proxies
		if (PROXIES && PROXY_LIST.length > 0) {
			if (badProxies.size == PROXY_LIST.length)
				// If all proxies are used, start over
				badProxies = new Set();

			do {
				proxy = "http://" + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
			} while (badProxies.has(proxy));

			let agent = new HttpsProxyAgent(proxy);
			options = {
				httpsAgent: agent,
				headers: {
					"User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
				},
			};
		} else
			options = {
				headers: {
					"User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
				},
			};

		// Get Page
		response = await axios.get(url, options).catch(async function (error) {
			writeErrorToFile(store, error);
		});

		// Extract Information
		if (response && response.status == 200) {
			html = response.data;

			// If bot Detected
			if (html.includes("Are you a human?")) {
				let message = moment().format("LTS") + ": " + store + " bot detected. ";
				if (PROXIES) message += "NEWEGG RATE LIMIT ON: " + url + ". PROXY: " + proxy;
				else message += "Consider using proxies or lowering interval.";
				console.error(message);
				badProxies.add(proxy);
				return;
			}

			let parser = new DomParser();
			let document, title, inventory, image;

			// Check combo product
			if (url.includes("ComboDealDetails")) {
				document = parser.parseFromString(html, "text/html");
				title = document.getElementsByTagName("title")[0].textContent;
				inventory = document.getElementsByClassName("atnPrimary");
				image = "https:" + document.getElementById("mainSlide_0").getAttribute("src");
			} else {
				// Check normal product
				document = parser.parseFromString(html, "text/html");
				title = document
					.getElementsByClassName("product-title")[0]
					.innerHTML.trim()
					.slice(0, 150);
				inventory = document.getElementsByClassName("btn btn-primary btn-wide");
				image = document.getElementsByClassName("product-view-img-original");
				if (image.length > 0) image = image[0].getAttribute("src");
			}

			if (inventory.length > 0) {
				inventory = inventory[0].firstChild.textContent;
				inventory = inventory.toLowerCase();
			}

			if ((!inventory || inventory != "add to cart ") && runtimeData[url]["firstRun"]) {
				console.info(
					moment().format("LTS") +
						': "' +
						title +
						'" not in stock at ' +
						store +
						"." +
						" Will keep retrying in background every",
					interval.value,
					interval.unit
				);
				runtimeData[url]["firstRun"] = false;
			} else if (inventory && inventory == "add to cart ") {
				if (ALARM) threeBeeps();
				if (!runtimeData[url]["urlOpened"]) {
					if (OPEN_URL) open(url);
					sendAlerts(url, title, image, store);
					runtimeData[url]["urlOpened"] = true;
					setTimeout(() => (runtimeData[url]["urlOpened"] = false), 1000 * 295); // Open URL and send alerts every 5 minutes
				}
				console.info(
					moment().format("LTS") + ": ***** In Stock at " + store + " *****: ",
					title
				);
				console.info(url);
			}
		}
    } catch (e) {
        writeErrorToFile(store, e, html, res ? res.status : undefined)
    }
};
