import cheerio from "cheerio";
import { fetchPage } from "../utils/fetch.js";
import { TARGET_KEY, TARGET_ZIP_CODE } from "../main.js";

export default async function target(html) {
	try {
		const $ = cheerio.load(html);
		let product_info = $("script[type='application/ld+json']")?.html();
		product_info = product_info ? JSON.parse(product_info) : undefined;

		const product_id = product_info?.["@graph"]?.[0]?.["sku"];
		let title = product_info?.["@graph"]?.[0]?.["name"];
		let image = product_info?.["@graph"]?.[0]?.["image"];

		// Get location ID from zip code
		let jsonResponse = await fetchPage(
			"https://api.target.com/shipt_deliveries/v1/stores?zip=" +
				TARGET_ZIP_CODE +
				"&key=" +
				TARGET_KEY,
			"target",
			true,
			new Set(),
			false,
			true
		);
		const location_id = jsonResponse
			? jsonResponse?.closest_eligible_store?.location_id
			: undefined;

		// Get fulfillment status
		jsonResponse = await fetchPage(
			"https://redsky.target.com/redsky_aggregations/v1/web/pdp_fulfillment_v1?" +
				"key=" +
				TARGET_KEY +
				"&tcin=" +
				product_id +
				"&has_store_positions_store_id=false" +
				"&store_id=" +
				location_id +
				"&store_positions_store_id=" +
				location_id +
				"&scheduled_delivery_store_id=" +
				location_id +
				"&pricing_store_id=" +
				location_id,
			"target",
			true,
			new Set(),
			false,
			true
		);
		jsonResponse = jsonResponse ? jsonResponse.data?.product?.fulfillment : undefined;

		let in_store = false;
		if (jsonResponse && jsonResponse.store_options && jsonResponse.store_options.length > 0)
			in_store = jsonResponse.store_options.some((store) => {
				if (store.order_pickup || store.in_store_only)
					return (
						store.order_pickup.availability_status == "IN_STOCK" ||
						store.in_store_only.availability_status == "IN_STOCK"
					);
			});

		let shipping = false;
		if (jsonResponse && jsonResponse.shipping_options)
			shipping = jsonResponse.shipping_options.availability_status == "IN_STOCK";

		let delivery = false;
		if (jsonResponse && jsonResponse.scheduled_delivery)
			delivery = jsonResponse.scheduled_delivery.availability_status == "IN_STOCK";

		const inventory = in_store || shipping || delivery;

		return { title, image, inventory };
	} catch (error) {
		return { error };
	}
}
