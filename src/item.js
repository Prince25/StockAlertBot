import chalk from 'chalk'
import * as log from './utils/log.js'
import { fetchPage } from './utils/fetch.js'
import { INTERVAL } from "./main.js";


export default class Item {
	constructor(url) {
		this.url = url;
		this.interval = INTERVAL;
		this.firstRun = true;
		this.urlOpened = false;
		this.html = undefined;
		this.info = {
			title: undefined,
			inventory: undefined,
			image: undefined,
		};
	}


	/*
		Fetches the item page and assigns the html to this.html
		Returns a promise of true if successful, false otherwise
	*/
	getPage(badProxies) {
		return new Promise(async resolve => {
			const html = await fetchPage(this.url, badProxies)
			if (html) {
				this.html = html;
				resolve(true);
			} else resolve(false);
		})
	}

	/*
		Extract item information based on the passed callback function and assigns it to this.info
		Returns true if successful, false otherwise
	*/
	extractInformation(storeFunction) {
		return new Promise(async resolve => {
			const info = storeFunction(this.html)
			if (info.title && info.inventory && info.image) {
				this.info = info
				resolve(true)
			}
			resolve(false);
		})
	}
}
