import chalk from 'chalk'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import * as log from './utils/log.js'
// import { INTERVAL } from "./main.js";

class Item {
	constructor(url) {
		this.url = url;
		this.interval = { ...INTERVAL };
		this.firstRun = true;
		this.urlOpened = false;
		this.html = undefined;
		this.info = {
			title: undefined,
			inventory: undefined,
			image: undefined,
		};
	}

	// Fetches the item page and assigns the html to this.html
	// Returns true if successful, false otherwise
	getPage(badProxies) {
			
	}

	// Extract item information based on the passed callback function and assigns it to this.info
	// Returns true if successful, false otherwise
	extractInformation(storeFunction) {

	}
}

log.toConsole('info', 'this ' + chalk.red('is test'))
log.toConsole('setup', 'this ' + chalk.red('is test'))
log.toConsole('error', 'this ' + chalk.red('is test'))
log.toConsole('stock', 'this ' + chalk.red('is test'))







