import fs from "fs";
import chalk from "chalk";
import Item from "./item.js";
import Store from "./store.js";
import * as dotenv from "dotenv";
import * as log from "./utils/log.js";

log.toConsole("info", chalk.yellow.bold("Thank you for using Stock Alert Bot!"));
log.toConsole("info", chalk.red("https://github.com/Prince25/StockAlertBot\n"));
log.toConsole("setup", "Starting setup...");

log.toConsole("setup", "Importing necessary files...");
/*
	Import store functions and assign them
	* Important: Edit this when adding new stores
*/
import amazonFunction from "./stores/amazon.js";
import antonlineFunction from "./stores/antonline.js";
import argosFunction from "./stores/argos.js";
import bestbuyFunction from "./stores/bestbuy.js";
import costcoFunction from "./stores/costco.js";
import currysFunction from "./stores/currys.js";
import ebuyerFunction from "./stores/ebuyer.js";
import gamestopFunction from "./stores/gamestop.js";
import microcenterFunction from "./stores/microcenter.js";
import neweggFunction from "./stores/newegg.js";
import targetFunction from "./stores/target.js";
import tescoFunction from "./stores/tesco.js";
import walmartFunction from "./stores/walmart.js";

const storeFunctionMap = {
	amazon: amazonFunction,
	antonline: antonlineFunction,
	argos: argosFunction,
	bestbuy: bestbuyFunction,
	costco: costcoFunction,
	currys: currysFunction,
	ebuyer: ebuyerFunction,
	gamestop: gamestopFunction,
	microcenter: microcenterFunction,
	newegg: neweggFunction,
	target: targetFunction,
	tesco: tescoFunction,
	walmart: walmartFunction,
};

// Read config.json
export const {
	URLS,
	SUPPORTED_STORES_DOMAINS,
	INTERVAL,
	TIME_BETWEEN_CHECKS,
	STORE_INTERVALS,
	OPEN_URL,
	DESKTOP,
	AMAZON_MERCHANT_ID,
	TARGET_ZIP_CODE,
	TARGET_KEY,
	WEBHOOK_URLS,
	SUPPORTED_WEBHOOK_DOMAINS,
	PROXIES,
	SUPPORTED_PROXY_DOMAINS,
	EMAIL,
	SMS_METHOD, // "None", "Amazon Web Services", "Email", "Twilio"
} = JSON.parse(fs.readFileSync("config/config.json", "UTF-8"));

// Check for URLs
if (URLS.length == 0) {
	log.toConsole("error", "No URLs provided. Exiting.");
}

// Read proxies.txt
export const PROXY_LIST = (() =>
	PROXIES
		? fs
				.readFileSync("config/proxies.txt", "UTF-8")
				.split(/\r?\n/)
				.filter((proxy) => proxy != "")
		: [])();

let shouldTerminate = false;
// Check if webhooks are supported
if (WEBHOOK_URLS.length > 0) {
	log.toConsole("setup", "Checking webhooks...");
	for (const url of WEBHOOK_URLS) {
		if (!SUPPORTED_WEBHOOK_DOMAINS.some((webhookDomain) => url.includes(webhookDomain))) {
			shouldTerminate = true;
			log.toConsole("error", "Webhook not supported: " + chalk.blue.bold(url));
		}
	}
}

// Check if .env file is valid
export let environment_config;
if (EMAIL || SMS_METHOD !== "None") {
	log.toConsole("setup", "Checking .env file...");
	if (!fs.existsSync("config/.env")) {
		log.toConsole(
			"error",
			chalk.yellow("config/.env") +
				" file not found. Make sure to rename example.env file to .env and edit it, or use browser to change settings."
		);
		shouldTerminate = true;
	} else {
		dotenv.config({
			path: "config/.env",
		});
	}

	environment_config = {
		email: {
			service: process.env.EMAIL_SERVICE,
			from: process.env.EMAIL_FROM,
			pass: process.env.EMAIL_PASS,
			to: process.env.EMAIL_TO,
		},

		sms_aws: {
			region: process.env.SMS_AWS_REGION,
			key: process.env.SMS_AWS_ACCESS_KEY,
			secret: process.env.SMS_AWS_SECRET_ACCESS,
			phone: process.env.SMS_AWS_PHONE_NUMBER,
		},

		sms_email: {
			service: process.env.SMS_EMAIL_SERVICE,
			from: process.env.SMS_EMAIL_FROM,
			pass: process.env.SMS_EMAIL_PASS,
			carrier: process.env.SMS_EMAIL_PHONE_CARRIER,
			number: process.env.SMS_EMAIL_PHONE_NUMBER,
		},

		sms_twilio: {
			sid: process.env.SMS_TWILIO_ACCOUNT_SID,
			auth: process.env.SMS_TWILIO_AUTH_TOKEN,
			from: process.env.SMS_TWILIO_FROM_NUMBER,
			to: process.env.SMS_TWILIO_TO_NUMBER,
		},
	};

	if (
		EMAIL &&
		(environment_config.email.service == "" ||
			environment_config.email.from == "" ||
			environment_config.email.pass == "" ||
			environment_config.email.to == "")
	) {
		log.toConsole("error", "Email information not provided in " + chalk.yellow("config/.env"));
		shouldTerminate = true;
	}

	if (SMS_METHOD !== "None") {
		switch (SMS_METHOD) {
			case "Amazon Web Services":
				if (
					environment_config.sms_aws.region == "" ||
					environment_config.sms_aws.key == "" ||
					environment_config.sms_aws.secret == "" ||
					environment_config.sms_aws.phone == ""
				) {
					log.toConsole(
						"error",
						"Amazon Web Services is chosen as SMS method but information is not provided in " +
							chalk.yellow("config/.env")
					);
					shouldTerminate = true;
				}
				break;

			case "Email":
				if (
					environment_config.sms_email.number.length == 0 ||
					!environment_config.sms_email.service ||
					!environment_config.sms_email.from ||
					!environment_config.sms_email.pass ||
					!environment_config.sms_email.carrier
				) {
					log.toConsole(
						"error",
						"Email is chosen as SMS method but information is not provided in " +
							chalk.yellow("config/.env")
					);
					shouldTerminate = true;
				}
				break;

			case "Twilio":
				if (
					environment_config.sms_twilio.sid == "" ||
					environment_config.sms_twilio.auth == "" ||
					environment_config.sms_twilio.from == "" ||
					environment_config.sms_twilio.to == ""
				) {
					log.toConsole(
						"error",
						"Twilio is chosen as SMS method but information is not provided in " +
							chalk.yellow("config/.env")
					);
					shouldTerminate = true;
				}
				break;
		}
	}
}

/*
	Get Domain name from an URL
	https://www.FOO.BAR.com/... -> FOO
*/
function getDomainName(url) {
	let hostName = new URL(url).hostname;
	let host = hostName.split(".");
	return host[1];
}

/*
	Return a map of stores to their item URLs
*/
function getStoreURLMap() {
	const storeUrlMap = {};
	for (const url of URLS) {
		const storeName = getDomainName(url);
		if ({}.propertyIsEnumerable.call(storeUrlMap, storeName)) {
			// If store already in map
			storeUrlMap[storeName].push(url); // ... add url to array
		} else {
			storeUrlMap[storeName] = [url]; // Otherwise, create new array
		}
	}
	return storeUrlMap;
}

/*
	Main Function
	Creates instances of Store
*/
function main() {
	if (shouldTerminate) return;

	// Create instances of stores and add items
	const storeUrlMap = getStoreURLMap();
	const storeFunctions = [];
	for (const store of Object.keys(storeUrlMap)) {
		if (SUPPORTED_STORES_DOMAINS.includes(store)) {
			const storeFunction = new Store(store, storeFunctionMap[store]);
			for (const url of storeUrlMap[store]) storeFunction.addItem(new Item(url));
			storeFunctions.push(storeFunction);
		} else {
			// If store is not supported
			log.toConsole("error", chalk.cyan.bold(store) + " is currently unsupported!");
		}
	}

	for (const store of storeFunctions) {
		store.startMonitor();
	}
}

main();
