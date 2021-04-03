import chalk from 'chalk'
import moment from "moment";
import * as log from './utils/log.js'
import getMs from './utils/interval-value.js'
import { INTERVAL, STORE_INTERVALS, TIME_BETWEEN_CHECKS } from "./main.js";

const PROXY_BLOCKING_MESSAGES = [
	""
]

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)) 

export default class Store {
	constructor(name, storeFunction) {
		this.name = name;
		this.items = [];
		this.bad_proxies = new Set();
		this.store_function = storeFunction,
		this.interval = getMs(STORE_INTERVALS[name] ? STORE_INTERVALS[name] : INTERVAL)
		this.delay = getMs(TIME_BETWEEN_CHECKS)
		this.check_in_progress = false
		this.last_checked = moment().unix()
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

		const monitorItems = async () => {
			const length = this.items.length
			for (const [index, item] of this.items.entries()) {
				if (item.info.title)
					log.toConsole('info', 'Checking ' + chalk.magenta.bold(item.info.title) + ' at ' + chalk.cyan.bold(this.name))
				else
					log.toConsole('info', 'Checking url: ' + chalk.magenta(item.url))
	
				if (!await item.getPage(this.bad_proxies)) {
					await sleep(this.delay)
					continue
				}

				if (!await item.extractInformation(this.name, this.store_function)) {
					await sleep(this.delay)
					continue
				}
				
				if (index != length - 1) await sleep(this.delay)
			}
			
			log.toConsole(
				'info',
				'Waiting ' + 
				chalk.yellow.bold(STORE_INTERVALS[this.name] ? 
					STORE_INTERVALS[this.name].value + ' ' + STORE_INTERVALS[this.name].unit : 
					INTERVAL[this.name].value + ' ' + INTERVAL[this.name].unit) +
				' to check ' + chalk.cyan.bold(this.name.toUpperCase()) + ' again')
			setTimeout(monitorItems.bind(this), this.interval)
		}

		monitorItems()
	}
}

