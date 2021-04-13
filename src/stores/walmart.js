import cheerio from 'cheerio'

export default function walmart(html) {
	try {
		const TITLE_SELECTOR = ".prod-ProductTitle"
		const IMAGE_SELECTOR = "meta[property='og:image']"
		const INVENTORY_SELECTOR = ".prod-ProductCTA--primary"

		const $ = cheerio.load(html)
		const title = $(TITLE_SELECTOR).text().trim()
		const image = $(IMAGE_SELECTOR).attr('content')
		let inventory = $(INVENTORY_SELECTOR).text().trim()

		if (inventory == 'Add to cart') {
			inventory = true
		} else if (html.includes('out of stock')) {
			inventory = false
		}

		return { title, image, inventory }
	} catch (error) {
		return { error }
	}
}