import cheerio from "cheerio";

export default function costco(html) {
	try {
		const TITLE_SELECTOR = "title:first";
		const IMAGE_SELECTOR = "#initialProductImage";
		const INVENTORY_SELECTOR = "#add-to-cart-btn";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).text()?.trim();
		const image = $(IMAGE_SELECTOR).attr("src");
		let inventory = $(INVENTORY_SELECTOR).attr("value");

		if (inventory) {
			inventory = inventory == "Add to Cart";
		} else if (html.includes("Out of Stock")) {
			inventory = false;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
