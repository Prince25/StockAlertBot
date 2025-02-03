import * as cheerio from 'cheerio';

export default function currys(html) {
	try {
		const TITLE_SELECTOR = ".prd-name";
		const IMAGE_SELECTOR = "meta[property='og:image']";
		const INVENTORY_SELECTOR = "div[data-component='add-to-basket-button-wrapper']:first";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).text()?.trim();
		const image = $(IMAGE_SELECTOR).attr("content");
		let inventory = $(INVENTORY_SELECTOR).attr("data-button-label");

		if (inventory) {
			inventory = inventory?.trim();
			inventory = inventory == "Add to basket";
		} else if (html.includes("Out of stock")) {
			inventory = false;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
