import * as cheerio from 'cheerio';

export default function tesco(html) {
	try {
		const TITLE_SELECTOR = "h1.product-details-tile__title";
		const IMAGE_SELECTOR = "img.product-image.product-image-visible";
		const INVENTORY_SELECTOR = "button.add-control.button-secondary";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).text()?.trim();
		const image = $(IMAGE_SELECTOR).attr("src");
		let inventory = $(INVENTORY_SELECTOR).text()?.trim();

		inventory = inventory.includes("to basket");

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
