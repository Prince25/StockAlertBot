import { fileURLToPath } from "url";
import { ALARM, OPEN_URL } from "../main.js";
import threeBeeps from "../utils/notification/beep.js";
import sendAlerts from "../utils/notification/alerts.js";
import writeErrorToFile from "../utils/log-error.js";
import axios from "axios";
import moment from "moment";
import DomParser from "dom-parser"; // https://www.npmjs.com/package/dom-parser
import open from "open";
import console from "console";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	let interval = {
		unit: "seconds", // seconds, m: minutes, h: hours
		value: 5,
	};
	let url =
		"https://www.bestbuy.com/site/sony-playstation-5-dualsense-wireless-controller/6430163.p?skuId=6430163";
	bestbuy(url, interval);
}

const store = "Best Buy";
const runtimeData = {};
export default async function bestbuy(url, interval) {
	// First run
	if (!{}.hasOwnProperty.call(url))
		runtimeData[url] = {
			firstRun: true,
			urlOpened: false,
		};

	try {
		let response = await axios.get(url).catch(async function (error) {
			if (error.response.status == 503)
				console.error(
					moment().format("LTS") +
						": " +
						store +
						" 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate."
				);
			else writeErrorToFile(store.replace(" ", ""), error);
		});

		let document, title, inventory, open_box, image;
		if (response && response.status === 200) {
			let parser = new DomParser();

			// Check package products
			if (url.includes("combo")) {
				document = parser.parseFromString(response.data, "text/html");
				inventory = document.getElementsByClassName("add-to-cart-button");
				try {
					title = document.getElementsByClassName("sku-title")[0].textContent;
				} catch {
					/* continue regardless of error */
				}
				try {
					image = document
						.getElementsByClassName("picture-wrapper")[0]
						.getElementsByTagName("img")[0]
						.getAttribute("src");
				} catch {
					/* continue regardless of error */
				}
			} else {
				// Check normal products
				document = parser.parseFromString(response.data, "text/html");
				try {
					title = document
						.getElementsByClassName("sku-title")[0]
						.childNodes[0].textContent.trim()
						.slice(0, 150);
				} catch {
					/* continue regardless of error */
				}
				inventory = document.getElementsByClassName("add-to-cart-button");
				open_box = document.getElementsByClassName("open-box-option__label");
				try {
					image = document.getElementsByClassName("primary-image")[0].getAttribute("src");
				} catch {
					/* continue regardless of error */
				}
			}

			if (inventory.length > 0) inventory = inventory[0].textContent;
			if (open_box && open_box.length > 0) {
				if (ALARM) threeBeeps();
				if (!runtimeData[url]["urlOpened"]) {
					if (OPEN_URL) open(url);
					runtimeData[url]["urlOpened"] = true;
					setTimeout(() => (runtimeData[url]["urlOpened"] = false), 1000 * 295); // Open URL and send alerts every 5 minutes
				}
				console.info(
					moment().format("LTS") + ": ***** Open Box at " + store + " *****: ",
					title
				);
				console.info(url);
			}
			if (inventory == "Add to Cart") {
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
			} else if (inventory == "Sold Out" && runtimeData[url]["firstRun"]) {
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
		} else {
			console.info(
				moment().format("LTS") + ": Error occured checking " + title + ". Retrying in",
				interval.value,
				interval.unit
			);
		}
	} catch (error) {
		writeErrorToFile(store.replace(" ", ""), error);
	}
}
