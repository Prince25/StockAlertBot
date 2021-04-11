import cheerio from 'cheerio'

export default function ebuyer(html) {
	try {
		const TITLE_SELECTOR = ".product-hero__title"
		const INVENTORY_SELECTOR = ".js-add-to-basket-main.js-show-loader"
		const IMAGE_SELECTOR = "div.image-gallery__hero > a > img"

		const $ = cheerio.load(html)
		const title = $(TITLE_SELECTOR).text().trim()
		const image = $(IMAGE_SELECTOR).attr('src')
		let inventory = $(INVENTORY_SELECTOR).attr('value')

		if (inventory == 'Add to Basket') {
			inventory = true
		} else {
			inventory = false
		}

		return { title, image, inventory }
	} catch (error) {
		return { error }
	}
}