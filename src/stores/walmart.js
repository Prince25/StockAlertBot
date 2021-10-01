import cheerio from "cheerio";

export default function walmart(html) {
	try {
		const SCRIPT_SELECTOR = "#__NEXT_DATA__";
		const TITLE_SELECTOR = '.lh-copy[itemprop = "name"]';
		const IMAGE_SELECTOR = ".self-center > img";
		const IMAGE_SELECTOR_BACKUP = 'li[data-slide="0"] img';
		const INVENTORY_SELECTOR =
			'div[data-testid="add-to-cart-section"] span[style="visibility:visible"]';
		const SELLER_SELECTOR = 'a[data-testid="seller-name-link"]';

		const $ = cheerio.load(html);
		let title, image, seller, inventory;

		// Script method
		const script = $(SCRIPT_SELECTOR).html()?.trim();
		const product_info = script
			? JSON.parse(script).props?.pageProps?.initialData?.data?.product
			: undefined;
		if (product_info) {
			title = product_info.name;
			image = product_info.imageInfo?.thumbnailUrl;
			seller = product_info?.sellerName;
			inventory = product_info.availabilityStatus == "IN_STOCK" && seller == "Walmart.com";
		}

		// HTML method
		else {
			title = $(TITLE_SELECTOR).text()?.trim();
			image = $(IMAGE_SELECTOR).attr("src");
			if (!image) {
				image = $(IMAGE_SELECTOR_BACKUP).attr("src");
			}
			seller = $(SELLER_SELECTOR).text()?.trim();
			inventory = $(INVENTORY_SELECTOR).text()?.trim();
			inventory = inventory == "Add to cart" && seller == "";
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
