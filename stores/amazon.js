import { fileURLToPath } from "url";
import { ALARM, AMAZON_MERCHANT_ID, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from "../main.js";
import threeBeeps from "../utils/notification/beep.js";
import sendAlerts from "../utils/notification/alerts.js";
import writeErrorToFile from "../utils/log-error.js";
import open from "open";
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser"; // https://www.npmjs.com/package/dom-parser
import HttpsProxyAgent from "https-proxy-agent";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	let interval = {
		unit: "seconds", // seconds, m: minutes, h: hours
		value: 25, // Amazon detects bots if too low, do > 10 seconds
	};
	let url =
		"https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S";
	amazon(url, interval, interval.value, true, false, () => undefined);
}

const store = "Amazon";
let badProxies = new Set();
export default async function amazon(
	url,
	interval,
	originalIntervalValue,
	firstRun,
	urlOpened,
	resolve
) {
	let response = undefined,
		html = undefined,
		proxy = undefined;

	try {
		let options = undefined;

		// Setup proxies
		if (PROXIES && PROXY_LIST.length > 0) {
			if (badProxies.size == PROXY_LIST.length) {
				// If all proxies are used, start over
				console.info(
					moment().format("LTS") +
						": Tried all proxies in proxies.txt. Will try them again. Consider getting more proxies."
				);
				badProxies = new Set();
			}
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
		let newUrl;
		if (AMAZON_MERCHANT_ID !== "None") {
			newUrl = url + "?m=" + AMAZON_MERCHANT_ID; // Add Amazon's seller ID
		} else newUrl = url;

		response = await axios.get(newUrl, options).catch(async function (error) {
			if (error.response.status == 503) {
				console.error(
					moment().format("LTS") +
						": " +
						store +
						" 503 (service unavailable) Error for " +
						url +
						". Consider increasing invterval."
				);
				if (PROXIES) {
					console.error(
						"Proxy",
						proxy,
						"might be banned from " + store + ". Adding it to the bad list"
					);
					badProxies.add(proxy);
				}
			} else writeErrorToFile(store, error);
		});

		// Extract Information
		if (response && response.status == 200) {
			html = response.data;

			// If bot Detected
			if (html.includes("we just need to make sure you're not a robot")) {
				let message = moment().format("LTS") + ": " + store + " bot detected. ";
				if (PROXIES) {
					message += "For proxy: " + proxy + ". Consider lowering interval.";
					badProxies.add(proxy);
				} else message += "Consider using proxies or lowering interval.";
				console.error(message);
				resolve({
					interval: Math.floor(interval.value + Math.random() * originalIntervalValue),
					urlOpened: urlOpened,
				});
				return;
			}

			let parser = new DomParser();
			let document = parser.parseFromString(html, "text/html");
			let title = document.getElementById("productTitle").innerHTML.trim().slice(0, 150);
			let inventory = document.getElementById("add-to-cart-button");
			let image = document.getElementById("landingImage").getAttribute("data-old-hires");

			if (inventory != undefined) inventory = inventory.getAttribute("value");
			if (inventory == undefined && firstRun) {
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
			} else if (inventory != undefined) {
				if (ALARM) threeBeeps();
				if (!urlOpened) {
					if (OPEN_URL) open(url);
					sendAlerts(url, title, image, store);
					urlOpened = true;
				}
				console.info(
					moment().format("LTS") + ": ***** In Stock at " + store + " *****: ",
					title
				);
				console.info(url);
			}
			resolve({ interval: interval.value, urlOpened: urlOpened });
		} else
			resolve({
				interval: Math.floor(interval.value + Math.random() * originalIntervalValue),
				urlOpened: urlOpened,
			});
	} catch (error) {
		writeErrorToFile(store, error, html, response.status);
	}
}
