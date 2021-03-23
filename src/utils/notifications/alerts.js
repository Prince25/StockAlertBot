import sendAuditoryAlert from "./beep.js";
import sendAlertToEmail from "./email.js";
import sendAlertToWebhooks from "./webhook.js";
import sendAlertToSMSViaAWS from "./sms-aws.js";
import sendAlertToSMSViaEmail from "./sms-email.js";
import sendAlertToSMSViaTwilio from "./sms-twilio.js";

// TODO: Conditions for sending alerts
export default function sendAlerts(product_url, title, image, store) {
	sendAuditoryAlert()
	sendAlertToEmail(product_url, title, image, store);
	sendAlertToSMSViaAWS(product_url, title, store);
	sendAlertToSMSViaEmail(product_url, title, image, store);
	sendAlertToSMSViaTwilio(product_url, title, store);
	sendAlertToWebhooks(product_url, title, image, store);
}
