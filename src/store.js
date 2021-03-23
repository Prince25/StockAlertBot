import chalk from 'chalk'
import Item from './item.js'
import cheerio from 'cheerio'
import * as log from './utils/log.js'
import { INTERVAL } from "./main.js";

export default class Store {
	constructor(name, storeFunction) {
		this.name = name;
		this.items = [];
		this.badProxies = [];
		this.storeFunction = storeFunction
	}

	// Adds an Item to the array
	addItem(item) {
		this.items.push(item);
	}

	// Starts checking status of items
	startMonitor() {
		if (this.items.length == 0) {
			log.toConsole('error', 'Cannot start montior: no items added!')
			return
		}

		log.toConsole('info', 'Starting monitor for store: ' + chalk.cyan.bold(this.name))
        
		setInterval(this.monitorItems.bind(this), INTERVAL.value * 1000)
	}

	async monitorItems() {
		for (const item of this.items) {
			if (item.info.title)
				log.toConsole('info', 'Checking item, ' + chalk.magenta(item.info.title) + ', from store: ' + chalk.cyan.bold(this.name))
			else
				log.toConsole('info', 'Checking url: ' + chalk.magenta(item.url))

			if (!await item.getPage(this.badProxies)) continue
			if (!await item.extractInformation(this.storeFunction)) continue
		}
	}


}


const currysFunction = (html) => {
	const TITLE_SELECTOR = ".prd-name"
	const INVENTORY_SELECTOR = "div[data-component='add-to-basket-button-wrapper']:first"
	const IMAGE_SELECTOR = "meta[property='og:image']"

	const $ = cheerio.load(html)
	const title = $(TITLE_SELECTOR).text().trim()
	const inventory = $(INVENTORY_SELECTOR).attr('data-button-label').trim()
	const image = $(IMAGE_SELECTOR).attr('content')
	
	return { title, inventory, image }
}

const currys = new Store('currys', currysFunction)
currys.addItem(new Item('https://www.currys.co.uk/gbuk/gaming/pc-gaming/gaming-laptops/asus-rog-zephyrus-duo-15-se-15-6-gaming-laptop-amd-ryzen-9-rtx-3080-2-tb-ssd-10220360-pdt.html'))
currys.startMonitor()
