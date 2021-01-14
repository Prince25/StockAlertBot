import sendAlertToWebhooks from "./webhook.js"
import sendAlertToEmail from "./email.js"

export default async function sendAlert(product_url, title, image, store) {
	sendAlertToWebhooks(product_url, title, image, store)
	sendAlertToEmail(product_url, title, image, store)
}