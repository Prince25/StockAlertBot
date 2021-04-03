import chalk from 'chalk'
import * as log from './utils/log.js'
import { fetchPage } from './utils/fetch.js'


export default class Item {
	constructor(url) {
		this.url = url;
		this.firstRun = true;	// TODO : Need this?
		this.notificationSent = false;
		this.shouldSendNotification = true;
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
			}
			resolve(false);
		})
	}

	/*
		Extract item information based on the passed callback function and assigns it to this.info
		Returns true if successful, false otherwise
	*/
	extractInformation(store, storeFunction) {
		return new Promise(async resolve => {
			const info = storeFunction(this.html)
			if (info.title && info.image && typeof(info.inventory) == 'boolean') {
				this.info =  info
				resolve(true)
			} else if (info.error) {
				log.toFile(store, info.error, this)
				resolve(false);
			} else {
				log.toFile(store, 'Unable to get information', Object.assign(this, info))
				resolve(false);
			}
		})
	}
}
