import cheerio from "cheerio";

export default function argos(html) {
	// Hard code PS5 special case
	if (html.includes("Sorry, PlayStation®5 is currently unavailable.")) {
		return {
			title: "PlayStation 5",
			image:
				"https://media.4rgos.it/s/Argos/8349000_R_SET?w=270&h=270&qlt=75&fmt.jpeg.interlaced=true",
			inventory: false,
		};
	}

	try {
		const TITLE_SELECTOR = "span[data-test='product-title']:first";
		const IMAGE_SELECTOR =
			"div.MediaGallerystyles__ImageWrapper-sc-1jwueuh-2.eDqOMU > picture > img";
		const INVENTORY_SELECTOR = "button[data-test='add-to-trolley-button-button']:first";

		const $ = cheerio.load(html);
		const title = $(TITLE_SELECTOR).text()?.trim();
		const image = "https:" + $(IMAGE_SELECTOR).attr("src");
		let inventory = $(INVENTORY_SELECTOR).text()?.trim();

		if (inventory == "Add  to trolley") {
			inventory = true;
		} else if (html.includes("Currently unavailable")) {
			inventory = false;
		}

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
