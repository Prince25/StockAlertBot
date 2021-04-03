import fs from "fs";
import chalk from 'chalk'
import Item from './item.js'
import Store from './store.js'
import * as log from './utils/log.js'


log.toConsole('info', chalk.yellow.bold("Thank you for using Stock Alert Bot!"))
log.toConsole('info', chalk.red("https://github.com/Prince25/StockAlertBot\n"))
log.toConsole('setup', 'Starting setup...')



log.toConsole('setup', 'Importing necessary files...')
/*
	Import store functions and assign them
	* Important: Edit this when adding new stores
*/
import currysFunction from './stores/currys.js'
const storeFunctionMap = {
	"currys": currysFunction
}



// Read config.json
export const {
	URLS,
	SUPPORTED_STORES_DOMAINS,
	INTERVAL,
	TIME_BETWEEN_CHECKS,
	STORE_INTERVALS,
	OPEN_URL,
	ALARM,
	AMAZON_MERCHANT_ID,
	TARGET_ZIP_CODE,
	TARGET_KEY,
	WEBHOOK_URLS,
	SUPPORTED_WEBHOOK_DOMAINS,
	PROXIES,
	EMAIL,
	SMS_METHOD, // "None", "Amazon Web Services", "Email", "Twilio"
} = JSON.parse(fs.readFileSync("config/config.json", "UTF-8"))


// Read proxies.txt
export const PROXY_LIST = (() =>
	PROXIES ? fs.readFileSync("config/proxies.txt", "UTF-8").split(/\r?\n/).filter((proxy) => proxy != "") : []
)()

// Check if webhooks are supported
if (WEBHOOK_URLS.length > 0) {
	log.toConsole('setup', 'Checking webhooks...')
	WEBHOOK_URLS.forEach(url => {
		if (!SUPPORTED_WEBHOOK_DOMAINS.some((webhookDomain) => url.includes(webhookDomain))) {
			log.toConsole('error', 'Webhook not supported: ' + chalk.blue.bold(url))
		}
	})
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
	const storeUrlMap = {}
	URLS.forEach(url => {
		const storeName = getDomainName(url)
		if ({}.propertyIsEnumerable.call(storeUrlMap, storeName)) {	// If store already in map
			storeUrlMap[storeName].push(url)						// ... add url to array
		} else {
			storeUrlMap[storeName] = [url]							// Otherwise, create new array
		}
	})
	return storeUrlMap;
}

/*
	Main Function
	Creates instances of Store
*/
function main() {
	// Create instances of stores and add items
	const storeUrlMap = getStoreURLMap()
	const storeFunctions = []
	Object.keys(storeUrlMap).forEach(store => {
		if (SUPPORTED_STORES_DOMAINS.includes(store)) {
			const storeFunction = new Store(store, storeFunctionMap[store])
			storeUrlMap[store].forEach(url => storeFunction.addItem(new Item(url)))
			storeFunctions.push(storeFunction)
		} else {	// If store is not supported 
			log.toConsole('error', chalk.cyan.bold(store) + ' is currently unsupported!')
		}
	})

	storeFunctions.forEach(store => {
		store.startMonitor()
	})
}

main()
