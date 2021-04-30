import cheerio from 'cheerio'

export default function newegg(html) {
	try {
		const TITLE_SELECTOR = "h1.product-title:first"
		const IMAGE_SELECTOR = "img.product-view-img-original:first"
		const INVENTORY_SELECTOR = "button.btn.btn-primary.btn-wide:first"
		const TITLE_COMBO_SELECTOR = "title"
		const IMAGE_COMBO_SELECTOR = "img#mainSlide_0:first"
		const INVENTORY_COMBO_SELECTOR = "a.atnPrimary:first"
	
		const $ = cheerio.load(html)
		let title = $(TITLE_SELECTOR).text().trim()
		let image = $(IMAGE_SELECTOR).attr('src')
		let inventory = $(INVENTORY_SELECTOR).text().trim().toLowerCase()

		// Combo Deals
		if (!title) {
			title = $(TITLE_COMBO_SELECTOR).text().trim()
			image = "https:" + $(IMAGE_COMBO_SELECTOR).attr('src')
			inventory = $(INVENTORY_COMBO_SELECTOR).text().trim().toLowerCase().replace(' ►', '')
		}

		return { title, image, inventory: inventory == 'add to cart' }
	} catch (error) {
		return { error }
	}
}