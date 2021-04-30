import * as log from './utils/log.js'	// TODO : Need toConsole?
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
	async getPage(store, use_proxies, badProxies) {
		const response = await fetchPage(this.url, store, use_proxies, badProxies)
		switch (response.status) {
			case "ok":
				this.html = response.html;
				return({
					"status": "ok"
				})

			case "retry":
				this.html = response.html;
				return({
					"status": "retry",
					"bad_proxies": response.badProxies
				})

			case "error":
				this.html = response.html;
				log.toFile(store, response.error, this)
				return({
					"status": "error"
				})
		}
	}

	
	/*
		Extract item information based on the passed callback function and assigns it to this.info
		Returns true if successful, false otherwise
	*/
	async extractInformation(store, storeFunction) {
		const info = await storeFunction(this.html)
		if (info.title && info.image && typeof(info.inventory) == 'boolean') {
			// Change notification status to false once item goes out of stock
			if (this.notificationSent && !info.inventory)
				this.notificationSent = false	

			this.shouldSendNotification = !this.info.inventory && info.inventory	// Check change in item stock
			this.info = info
			return true
		} else if (info.error) {
			log.toFile(store, info.error, this)
			return false;
		} else {
			log.toFile(store, 'Unable to get information', Object.assign(this, info))
			return false;
		}
	}
}
