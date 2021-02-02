import sendAlertToAWS from "./aws.js"
import sendAlertToEmail from "./email.js"
import sendAlertToSMS from "./sms.js"
import sendAlertToTwilio from "./twilio.js"
import sendAlertToWebhooks from "./webhook.js"

export default async function sendAlerts(product_url, title, image, store) {
	sendAlertToAWS(product_url, title, store)
	sendAlertToEmail(product_url, title, image, store)
	sendAlertToSMS(product_url, title, image, store)
	sendAlertToTwilio(product_url, title, store)
	sendAlertToWebhooks(product_url, title, image, store)
}