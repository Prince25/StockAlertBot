import * as cheerio from 'cheerio';

export default function gamestop(html) {
	try {
		const TITLE_SELECTOR = "h2.product-name:first";
		const IMAGE_SELECTOR = "img.product-main-image:first";
		const IMAGE_BACKUP_SELECTOR = "div.product-image-carousel > picture > source:first";
		const PRODUCT_INFO_SELECTOR = "button.add-to-cart.btn.btn-primary:first";

		const $ = cheerio.load(html);
		const json = $(PRODUCT_INFO_SELECTOR).attr("data-gtmdata");
		const product_info = json ? JSON.parse(json) : undefined;
		let title = $(TITLE_SELECTOR).text()?.trim();
		let image = $(IMAGE_SELECTOR).attr("data-src");
		let inventory = product_info?.productInfo?.availability;

		// Backup method
		if (!title) {
			title = product_info?.productInfo?.name;
		}
		if (!image) {
			image = "https://media.gamestop.com/i/gamestop/" + product_info?.productInfo?.productID;
			image = !image ? $(IMAGE_BACKUP_SELECTOR).attr("srcset") : image;
		}
		inventory = inventory == "Available";

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
