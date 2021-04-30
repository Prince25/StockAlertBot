import cheerio from 'cheerio'

export default function ebuyer(html) {
	try {
		const TITLE_SELECTOR = ".product-hero__title"
		const IMAGE_SELECTOR = "div.image-gallery__hero > a > img"
		const INVENTORY_SELECTOR = ".js-add-to-basket-main:first"

		const $ = cheerio.load(html)
		let title = $(TITLE_SELECTOR).text()?.trim()
		const image = $(IMAGE_SELECTOR).attr('src')
		let inventory = $(INVENTORY_SELECTOR).attr('value')

		if (inventory == 'Add to Basket') {
			inventory = true
		} else if (inventory == 'Pre-order') {	// Check for preorder
			title += ' - Preorder'
			inventory = true
		} else {
			inventory = false
		}

		return { title, image, inventory }
	} catch (error) {
		return { error }
	}
}