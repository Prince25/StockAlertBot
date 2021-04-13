import chalk from 'chalk'
import moment from "moment";	// TODO : Need this?
import * as log from './utils/log.js'	// TODO : Need toFile?
import getMs from './utils/interval-value.js'
import sendAlerts from './utils/notification/alerts.js';
import { INTERVAL, STORE_INTERVALS, SUPPORTED_PROXY_DOMAINS, TIME_BETWEEN_CHECKS } from "./main.js";


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)) 

export default class Store {
	constructor(name, storeFunction) {
		this.name = name;
		this.items = [];
		this.bad_proxies = new Set();
		this.supports_proxies = SUPPORTED_PROXY_DOMAINS.includes(name);
		this.store_function = storeFunction,
		this.interval = getMs(STORE_INTERVALS[name] ? STORE_INTERVALS[name] : INTERVAL)
		this.delay = getMs(TIME_BETWEEN_CHECKS)
		this.check_in_progress = false		// TODO : Need this?
		this.last_checked = moment().unix()	// TODO : Need this?
	}



	/*
		Adds an Item to the array
	*/
	addItem(item) {
		this.items.push(item);
	}



	/*
		Starts checking status of items
	*/
	startMonitor() {
		if (this.items.length == 0) {
			log.toConsole('error', 'Cannot start montior: no items added!')
			return
		}
		
		log.toConsole('setup', 'Starting monitor for: ' + chalk.cyan.bold(this.name.toUpperCase()))
		this.monitorItems()
	}

	/*
		Recursively checks all items 
	*/
	async monitorItems() {
		const length = this.items.length
		for (const [index, item] of this.items.entries()) {
			if (item.info.title)
				log.toConsole('info', 'Checking ' + chalk.magenta.bold(item.info.title) + ' at ' + chalk.cyan.bold(this.name.toUpperCase()))
			else
				log.toConsole('info', 'Checking url: ' + chalk.magenta(item.url))
			
			// Gets Item Page
			const response = await item.getPage(this.name, this.supports_proxies, this.bad_proxies)
			if (response.status == "retry") {
				this.bad_proxies = response.bad_proxies
			}
			else if (response.status == "error") {
				if (index != length - 1) await sleep(this.delay)
				continue
			}

			// Extract item information from the page
			if (!await item.extractInformation(this.name, this.store_function)) {
				if (index != length - 1) await sleep(this.delay)
				continue
			}

			// Sends notifications about the item
			if (item.info.inventory && item.notificationSent) {
				log.toConsole('info', chalk.magenta.bold(item.info.title) + ' is still in stock at ' + chalk.cyan.bold(this.name.toUpperCase()))
			}
			if (item.shouldSendNotification && !item.notificationSent) {
				sendAlerts(item.url, item.info.title, item.info.image, this.name)
				log.toConsole('stock', chalk.magenta.bold(item.info.title) + ' is in stock at ' + chalk.cyan.bold(this.name.toUpperCase()) + '!!')
				item.notificationSent = true;
			}
			
			if (index != length - 1) await sleep(this.delay)
		}
		
		log.toConsole(
			'info',
			'Waiting ' + 
			chalk.yellow.bold(STORE_INTERVALS[this.name] ? 
				STORE_INTERVALS[this.name].value + ' ' + STORE_INTERVALS[this.name].unit : 
				INTERVAL.value + ' ' + INTERVAL.unit) +
			' to check ' + chalk.cyan.bold(this.name.toUpperCase()) + ' again')

		setTimeout(this.monitorItems.bind(this), this.interval)
	}
}