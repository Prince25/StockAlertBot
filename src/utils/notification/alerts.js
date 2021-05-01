import open from "open";
import sendAlertToEmail from "./email.js";
import sendDesktopAlert from "./desktop.js";
import sendAlertToWebhooks from "./webhook.js";
import sendAlertToSMSViaAWS from "./sms-aws.js";
import sendAlertToSMSViaEmail from "./sms-email.js";
import sendAlertToSMSViaTwilio from "./sms-twilio.js";
import {
	DESKTOP,
	EMAIL,
	environment_config,
	OPEN_URL,
	SMS_METHOD,
	WEBHOOK_URLS,
} from "../../main.js";

let openedDonateLink = false;
export default function sendAlerts(product_url, title, image, store) {
	if (DESKTOP) sendDesktopAlert(product_url, title, image, store);
	if (EMAIL) sendAlertToEmail(environment_config.email, product_url, title, image, store);
	if (OPEN_URL) {
		if (!openedDonateLink) {
			open(
				"https://www.paypal.com/donate/?business=3Y9NEYR4TURT8&item_name=Making+software+and+hacking+the+world%21+%E2%99%A5&currency_code=USD"
			);
			openedDonateLink = true;
			setTimeout(() => (openedDonateLink = false), 30 * 60 * 1000);
		}
		open(product_url);
	}
	if (SMS_METHOD == "Amazon Web Services")
		sendAlertToSMSViaAWS(environment_config.sms_aws, product_url, title, store);
	if (SMS_METHOD == "Email")
		sendAlertToSMSViaEmail(environment_config.sms_email, product_url, title, image, store);
	if (SMS_METHOD == "Twilio")
		sendAlertToSMSViaTwilio(environment_config.sms_twilio, product_url, title, store);
	if (WEBHOOK_URLS.length > 0)
		sendAlertToWebhooks(WEBHOOK_URLS, product_url, title, image, store);
}
