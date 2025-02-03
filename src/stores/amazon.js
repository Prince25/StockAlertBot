import * as cheerio from 'cheerio';

export default function amazon(html) {
	try {
		const TITLE_SELECTOR = "#productTitle";
		const IMAGE_SELECTOR = "#landingImage";
		const IMAGE_BOOK_SELECTOR = "#img-canvas > img";
		const INVENTORY_SELECTOR = "#add-to-cart-button";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).text()?.trim();
		let image = $(IMAGE_SELECTOR).attr("data-old-hires");
		let inventory = $(INVENTORY_SELECTOR).attr("value");

		if (!image) {
			image = $(IMAGE_SELECTOR).attr("src");
			if (!image) {
				image = $(IMAGE_BOOK_SELECTOR).attr("src");
			}
		}

		if (inventory != undefined) {
			inventory = true;
		} else if (inventory == undefined) {
			inventory = false;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
