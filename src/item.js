import { toFile } from "./utils/log.js";
import { fetchPage } from "./utils/fetch.js";

export default class Item {
	constructor(url) {
		this.url = url;
		this.notificationSent = false;
		this.shouldSendNotification = true;
		this.html = null;
		this.info = {
			title: null,
			inventory: null,
			image: null,
		};
	}

	/**
	 * Fetches the item page and assigns the html to this.html
	 * Returns a promise of an object with status and badProxies keys
	 */
	async getPage(store, useProxies, badProxies) {
		const { status, html, error, badProxies: responseBadProxies } = await fetchPage(
			this.url,
			store,
			useProxies,
			badProxies
		);

		this.html = html;
		if (status === "error") {
			toFile(store, error, this);
		}

		return { status, badProxies: responseBadProxies };
	}

	/**
	 * Extract item information based on the passed callback function and assigns it to this.info
	 * Returns a boolean indicating success or failure
	 */
	async extractInformation(store, storeFunction) {
		const info = await storeFunction(this.html);

		if (!info.title || !info.image || typeof info.inventory !== "boolean") {
			toFile(store, "Unable to get information", Object.assign(this, info));
			return false;
		}

		const { title, image, inventory } = info;
		const { inventory: currentInventory } = this.info;

		if (this.notificationSent && !inventory) {
			this.notificationSent = false;
		}

		this.shouldSendNotification = !currentInventory && inventory;
		this.info = { title, image, inventory };

		if (info.error) {
			toFile(store, info.error, this);
			return false;
		}

		return true;
	}
}
