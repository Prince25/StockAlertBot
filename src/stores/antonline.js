import cheerio from 'cheerio'

export default function antonline(html) {
	try {
		const TITLE_SELECTOR = ".title"
		const INVENTORY_SELECTOR = ".uk-button"
		const IMAGE_SELECTOR = "img"

		const $ = cheerio.load(html)
		const title = $(TITLE_SELECTOR).text().trim()
		const image = $(IMAGE_SELECTOR).eq(7).attr('src');
		let inventory = $(INVENTORY_SELECTOR).text().trim()
		
		if (inventory == 'Add to Cart') {
			inventory = true
		} else if (html.includes('OUT OF STOCK ')) {
			inventory = false
		}

		return { title, image, inventory }
	} catch (error) {
		return { error }
	}
}