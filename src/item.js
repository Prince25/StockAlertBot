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
	getPage(store, use_proxies, badProxies) {
		return new Promise(async resolve => {
			const response = await fetchPage(this.url, store, use_proxies, badProxies)
			switch (response.status) {
				case "ok":
					this.html = response.html;
					resolve({
						"status": "ok"
					})
					break

				case "retry":
					this.html = response.html;
					resolve({
						"status": "retry",
						"bad_proxies": response.badProxies
					})
					break

				case "error":
					resolve({
						"status": "error"
					})
					break
			}
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
				// Change notification status to false once item goes out of stock
				if (this.notificationSent && !info.inventory)
					this.notificationSent = false	

				this.shouldSendNotification = !this.info.inventory && info.inventory	// Check change in item stock
				this.info = info
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
