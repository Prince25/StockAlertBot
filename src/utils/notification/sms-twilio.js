import Twilio from "twilio";
import moment from "moment";
import * as log from "../log.js";

export default async function sendAlertToSMSViaTwilio(twilio, product_url, title, store) {
	log.toConsole("alert", "Sending SMS notification via Twilio!");

	try {
		var client = new Twilio(twilio.sid, twilio.auth);
		client.messages.create({
			from: "+" + twilio.from,
			to: "+" + twilio.to,
			body: `***** In Stock at ${store} ***** \n\n${title} \n\n${product_url} \n\nStockAlertBot | ${moment().format(
				"MMM Do YYYY - h:mm:ss A"
			)}\nhttps://github.com/Prince25/StockAlertBot`,
		});
	} catch (error) {
		log.toConsole("error", "Error sending SMS notification via Twilio: " + error);
		log.toFile("sms-twilio", error);
	}
}
