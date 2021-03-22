import sendAlertToEmail from "./email.js";
import sendAlertToSMSViaAWS from "./sms-aws.js";
import sendAlertToSMSViaEmail from "./sms-email.js";
import sendAlertToSMSViaTwilio from "./sms-twilio.js";
import sendAlertToWebhooks from "./webhook.js";

export default async function sendAlerts(product_url, title, image, store) {
	sendAlertToEmail(product_url, title, image, store);
	sendAlertToSMSViaAWS(product_url, title, store);
	sendAlertToSMSViaEmail(product_url, title, image, store);
	sendAlertToSMSViaTwilio(product_url, title, store);
	sendAlertToWebhooks(product_url, title, image, store);
}
