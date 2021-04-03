import cheerio from 'cheerio'

export default function currys(html) {
	const TITLE_SELECTOR = ".prd-name"
	const INVENTORY_SELECTOR = "div[data-component='add-to-basket-button-wrapper']:first"
	const IMAGE_SELECTOR = "meta[property='og:image']"

	const $ = cheerio.load(html)
	const title = $(TITLE_SELECTOR).text().trim()
	const inventory = $(INVENTORY_SELECTOR).attr('data-button-label').trim()
	const image = $(IMAGE_SELECTOR).attr('content')
	
	return { title, inventory, image }
}