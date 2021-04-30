import cheerio from 'cheerio'

/*
    Checks Best Buy in the following order:
    US Normal -> US Package -> US Open box -> Canada 
*/
export default function bestbuy(html) {
	try {
		const TITLE_SELECTOR = "div.sku-title:first"
		const TITLE_SELECTOR_CANADA = "div.x-product-detail-page > h1:first"

		const IMAGE_SELECTOR = "img.primary-image:first"
		const IMAGE_SELECTOR_US_PACKAGE = ".picture-wrapper > img:first"
		const IMAGE_SELECTOR_CANADA = "img[alt='product image']"

		const INVENTORY_SELECTOR_US = "button.add-to-cart-button:first"
		const INVENTORY_SELECTOR_US_OPEN_BOX = "span.open-box-option__label"
		const INVENTORY_SELECTOR_CANADA = "button.addToCartButton:first"

        const CANADA_BACKUP_SELECTOR = "body > script:first"

		const $ = cheerio.load(html)

        // Check US Normal Products
		let title = $(TITLE_SELECTOR).text()?.trim()
		let image = $(IMAGE_SELECTOR).attr('src');
		let inventory = $(INVENTORY_SELECTOR_US).text()?.trim()
		if (inventory == 'Add to Cart') {
			inventory = true
		} else {
			inventory = false
		}

        // Check US Package Products
        if (!image && $(IMAGE_SELECTOR_US_PACKAGE).length) {
            image = $(IMAGE_SELECTOR_US_PACKAGE).attr('src');
        }

        // Check US Normal Open Box
        if (!inventory && $(INVENTORY_SELECTOR_US_OPEN_BOX).length) {
            title += ' - Open Box'
            inventory = true
        }

        // Check Best Buy Canada Products 
        if (!title || !image) {
            title = $(TITLE_SELECTOR_CANADA).text()?.trim()
            image = $(IMAGE_SELECTOR_CANADA).attr('src');
            let inventory_button = $(INVENTORY_SELECTOR_CANADA)
            if (inventory_button.length) {
                inventory = inventory_button.attr('disabled') ? false : true
            } else {
                inventory = false
            }
            
            // Backup method
            if (!title || !image || !inventory) {
                let script = $(CANADA_BACKUP_SELECTOR).html()
                if (script.length > 0) {
                    script = script.slice(script.indexOf("window.__INITIAL_STATE__ = {") + 27, script.indexOf('};') + 1)
                    script = script.length > 0 ? JSON.parse(script) : undefined
                    if (script) {
                        let productInfo = script.product
                        title = productInfo.product.name
                        image = productInfo.product.productImage
                        if (productInfo.availability.shipping.purchasable) inventory = true
                        else inventory = false
                    }
                }
            }
        }

		return { title, image, inventory }
	} catch (error) {
		return { error }
	}
}