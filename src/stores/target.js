import cheerio from "cheerio";
import { fetchPage } from "../utils/fetch.js";
import { TARGET_KEY, TARGET_ZIP_CODE } from "../main.js";

export default async function target(html) {
	try {
		const $ = cheerio.load(html);

		// Extract product data and api key JSON inside a script
		const scriptContent = $("script").toArray()
			.map(el => $(el).html())
			.find(content => content?.includes("'__TGT_DATA__'"));

		if (!scriptContent) process.exit(1);

		const extractJSON = (key) => {
			const match = scriptContent.match(new RegExp(`'${key}':\\s*\\{[^}]*value:\\s*deepFreeze\\(JSON\\.parse\\("(.+?)"\\)\\),`, 's'));
			return match ? JSON.parse(match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\[ntr]/g, '')) : null;
		};

		const tgtData = extractJSON('__TGT_DATA__');
		const configData = extractJSON('__CONFIG__');

		const findProductEntry = (obj) => { // Find product entry in the JSON
			if (typeof obj !== 'object' || !obj) return null;
			if (obj.__typename === 'Product') return obj;
			return Object.values(obj).map(findProductEntry).find(Boolean);
		};

		const product = findProductEntry(tgtData) || {};
		const title = product?.item?.product_description?.title;
		const image = product?.item?.enrichment?.images?.primary_image_url;
		const product_id = product?.tcin;
		const api_key = configData?.defaultServicesApiKey || configData?.services?.redsky?.apiKey || TARGET_KEY;


		// Get location ID from zip code
		let jsonResponse = await fetchPage(
			"https://api.target.com/location_fulfillment_aggregations/v1/preferred_stores?" +
			"zipcode=" + TARGET_ZIP_CODE +
			"&key=" + api_key,
			"target",
			true,
			new Set(),
			false,
			true
		);

		const location_id = jsonResponse
			? jsonResponse?.preferred_stores[0]?.location_id
			: undefined;

		// Get fulfillment status
		jsonResponse = await fetchPage(
			"https://redsky.target.com/redsky_aggregations/v1/web/product_fulfillment_v1?" +
			"is_bot=false" +
			"&channel=WEB" +
			"&key=" + api_key +
			"&tcin=" + product_id +
			"&zip=" + TARGET_ZIP_CODE +
			"&store_id=" + location_id +
			"&scheduled_delivery_store_id=" + location_id,
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
				if (store.order_pickup || store.in_store_only || store.ship_to_store)
					return (
						store.order_pickup?.availability_status == "IN_STOCK" ||
						store.in_store_only?.availability_status == "IN_STOCK" ||
						store.ship_to_store?.availability_status == "IN_STOCK"
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
