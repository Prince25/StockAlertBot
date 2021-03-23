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
	let url = "https://www.walmart.com/ip/PlayStation-5-Console/363472942";
	walmart(url, interval);
}

const store = "Walmart";
const runtimeData = {};
let badProxies = new Set();
export default async function walmart(url, interval) {
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
			if (html.includes("Help us keep your account safe by clicking on the checkbox below")) {
				let message = moment().format("LTS") + ": " + store + " bot detected. ";
				if (PROXIES) message += "Bot detected: " + url + ". PROXY: " + proxy;
				else message += "Consider using proxies or lowering interval.";
				console.error(message);
				badProxies.add(proxy);
				return;
			}

			let parser = new DomParser();
			let document = parser.parseFromString(html, "text/html");
			let title = document.getElementsByTagName("title");
			let inventory = document.getElementsByClassName("prod-ProductCTA--primary");
			let image = document.getElementsByClassName("prod-hero-image");

			if (title.length > 0) title = title[0].textContent.split(" - Walmart.com ")[0];
			if (inventory.length > 0) inventory = inventory[0].textContent;
			if (image.length > 0) {
				image = image[0].getElementsByTagName("img");
				image = image[0].getAttribute("src");
				image = "https:" + image;
			}

			if (inventory != "Add to cart" && runtimeData[url]["firstRun"]) {
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
			} else if (inventory == "Add to cart") {
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
	} catch (error) {
		writeErrorToFile(store, error, html, response.status);
	}
}
