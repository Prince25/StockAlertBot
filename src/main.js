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
	PROXIES,
	EMAIL,
	SMS_METHOD, // "None", "Amazon Web Services", "Email", "Twilio"
} = JSON.parse(fs.readFileSync("config/config.json", "UTF-8"))


// Read proxies.txt
export const PROXY_LIST = (() =>
	PROXIES ? fs.readFileSync("config/proxies.txt", "UTF-8").split(/\r?\n/).filter((proxy) => proxy != "") : []
)()






// const currys = new Store('currys', currysFunction)
// currys.addItem(new Item('https://www.currys.co.uk/gbuk/gaming/pc-gaming/gaming-laptops/asus-rog-zephyrus-duo-15-se-15-6-gaming-laptop-amd-ryzen-9-rtx-3080-2-tb-ssd-10220360-pdt.html'))
// currys.addItem(new Item('https://www.currys.co.uk/gbuk/household-appliances/cooking/cookers/essentials-cfsewh18-50-cm-electric-solid-plate-cooker-white-10179280-pdt.html'))
// currys.addItem(new Item('https://www.currys.co.uk/gbuk/computing-accessories/printers-scanners-and-ink/printers/epson-expression-home-xp-4105-all-in-one-wireless-inkjet-printer-10195552-pdt.html'))
// currys.startMonitor()



// Check if webhooks are supported
if (WEBHOOK_URLS.length > 0) {
	log.toConsole('setup', 'Checking webhooks...')
	WEBHOOK_URLS.forEach(url => {
	
	})
}
(() => {
})()



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

	

	// for (const url of URLS) {
	// 	store.addItem(new Item(url))
	// 	stores.add(storeName)

	// 	switch (storeName) {
	// 		case "antonline":
	// 			break;

	// 		case "amazon":
	// 			break;

	// 		case "argos":
	// 			break;

	// 		case "bestbuy":
	// 			break;

	// 		case "costco":
	// 			break;

	// 		case "currys":
	// 			break;

	// 		case "gamestop":
	// 			break;

	// 		case "microcenter":
	// 			break;

	// 		case "newegg":
	// 			break;

	// 		case "target":
	// 			break;

	// 		case "tesco":
	// 			break;

	// 		case "walmart":
	// 			break;

	// 		default:
	// 			console.error("This store is not supported:", storeName);
	// 	}
	// }



	// if (amazonItems.length > 0)
	// 	for (const [index, item] of amazonItems.entries()) {
	// 		switch (INTERVAL.unit) {
	// 			case "seconds":
	// 				setTimeout(checkStoreWithDelay, AMAZON_DELAY * 1000 * index, item);
	// 				break;

	// 			case "minutes":
	// 				setTimeout(checkStoreWithDelay, AMAZON_DELAY * 1000 * 60 * index, item);
	// 				break;

	// 			case "hours":
	// 				setTimeout(checkStoreWithDelay, AMAZON_DELAY * 1000 * 60 * 60 * index, item);
	// 				break;
	// 		}
	// 	}
}


console.log(getDomainName('https://discord.com/api/webhooks/819409247414255635/sdGaXOU_TJtHPeHWjtD_j3rBqK_cMJFGJAnlseJS1o-XTyXpFIUZE9oFHJfpGaUSbfO4'))
main()


/*

// Calls the given store function with the set interval
async function checkStore(storeFunction, url) {
	switch (INTERVAL.unit) {
		case "seconds":
			setInterval(storeFunction, INTERVAL.value * 1000, url, INTERVAL);
			break;

		case "minutes":
			setInterval(storeFunction, INTERVAL.value * 1000 * 60, url, INTERVAL);
			break;

		case "hours":
			setInterval(storeFunction, INTERVAL.value * 1000 * 60 * 60, url, INTERVAL);
			break;
	}
}

// Same as checkStore() but adds dynamic delay to interval to help avoid 503 error
// Takes an item with url, interval, firstRun, and storeFunc properties (see amazonItem() below for an example)
async function checkStoreWithDelay(item) {
	let timer = (firstRun) => {
		return new Promise(function (resolve) {
			item.storeFunc(
				item.url,
				item.interval,
				INTERVAL.value,
				firstRun,
				item.urlOpened,
				resolve
			);
		});
	};

	timer(item.firstRun).then(async function ({ interval, urlOpened }) {
		if (item.interval.value != interval) {
			item.firstRun = true;
			item.interval.value = interval;
		} else item.firstRun = false;

		if (OPEN_URL && urlOpened && urlOpened != item.urlOpened) {
			item.urlOpened = true;
			setTimeout(() => (item.urlOpened = false), 1000 * 295); // Open URL and send alerts every 5 minutes
		}

		switch (item.interval.unit) {
			case "seconds":
				setTimeout(checkStoreWithDelay, item.interval.value * 1000, item);
				break;

			case "minutes":
				setTimeout(checkStoreWithDelay, item.interval.value * 1000 * 60, item);
				break;

			case "hours":
				setTimeout(checkStoreWithDelay, item.interval.value * 1000 * 60 * 60, item);
				break;
		}
	});
}



*/