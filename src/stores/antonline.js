import * as cheerio from 'cheerio';

export default function antonline(html) {
	try {
		const TITLE_SELECTOR = ".title";
		const IMAGE_SELECTOR = "ul.uk-slideshow > li > img";
		const INVENTORY_SELECTOR = "button.uk-button:first";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).text()?.trim();
		const image = $(IMAGE_SELECTOR).attr("src");
		let inventory = $(INVENTORY_SELECTOR).text()?.trim();

		if (inventory == "Add to Cart") {
			inventory = true;
		} else if (html.includes("OUT OF STOCK ")) {
			inventory = false;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
