import cheerio from 'cheerio'

export default function bhphotovideo(html) {
	try {
		const TITLE_SELECTOR = "h1[data-selenium='productTitle']"
		const IMAGE_SELECTOR = "img[data-selenium='inlineMediaMainImage']"
		const INVENTORY_SELECTOR = "button[data-selenium='addToCartButton']"

		const $ = cheerio.load(html)
		const title = $(TITLE_SELECTOR).text().trim()
		const image = $(IMAGE_SELECTOR).attr('src')
		let inventory = $(INVENTORY_SELECTOR).text()

		if (inventory) {
			inventory = inventory.trim()
			inventory = inventory == 'Add to Cart'
		} else if (html.includes('Notify When Available')) {
			inventory = false
		}

		return { title, image, inventory }
	} catch (error) {
		return { error }
	}
}