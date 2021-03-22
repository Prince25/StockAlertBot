import { fileURLToPath } from "url";
import { ALARM, PROXIES, PROXY_LIST, OPEN_URL, USER_AGENTS } from "../main.js";
import threeBeeps from "../src/utils/notification/beep.js.js";
import sendAlerts from "../src/utils/notification/alerts.js.js";
import writeErrorToFile from "../src/utils/log-error.js";
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
	let url =
		"https://www.gamestop.com/video-games/playstation-5/accessories/products/sony-dualsense-wireless-controller/11106262.html";
	gamestop(url, interval);
}

const store = "Gamestop";
const runtimeData = {};
export default async function gamestop(url, interval) {
	let response = undefined,
		html = undefined,
		proxy = undefined;

	// First run
	if (!{}.hasOwnProperty.call(url))
		runtimeData[url] = {
			firstRun: true, // Used to show initial message, once for each product, that product isn't available but will keep checking in the background
			urlOpened: false,
		};

	try {
		let options = undefined;

		// Setup proxies
		if (PROXIES && PROXY_LIST.length > 0) {
			proxy = "http://" + PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
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

			let parser = new DomParser();
			let document = parser.parseFromString(html, "text/html");
			let productInfo = document.getElementsByTagName("script");
			let title = document.getElementsByClassName("product-name");
			let inventory = undefined,
				productId = undefined;
			let image = document.getElementsByClassName("product-main-image-gallery");

			if (productInfo.length > 0) {
				productInfo = productInfo.filter((script) =>
					script.textContent.includes("dataLayer = window.dataLayer || [];")
				);
				productInfo = productInfo[1].textContent;
				productInfo = productInfo.slice(
					productInfo.indexOf("dataLayer.concat(") + 17,
					productInfo.indexOf(");")
				);
				productInfo = productInfo.replace(/undefined/g, "null");
				productInfo = JSON.parse(productInfo);
				productInfo = productInfo[1].product[0].productInfo;
				inventory = productInfo.availability;
				productId = productInfo.productID;
			}

			if (title.length > 0) title = title[0].textContent.trim().slice(0, 150);
			else title = productInfo.name;

			if (image.length > 0) {
				image = image[0].getElementsByTagName("img");
				if (image.length > 0) image = image[0].getAttribute("src");
			} else if (productId) image = "https://media.gamestop.com/i/gamestop/" + productId;
			else
				image =
					"https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg";

			if (inventory == "Available") {
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
			} else if (inventory != "Available" && runtimeData[url]["firstRun"]) {
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
			}
		}
	} catch (error) {
		writeErrorToFile(store, error, html, response.status);
	}
}
