import aws from "aws-sdk";
import moment from "moment";
import * as log from "../log.js";

export default async function sendAlertToSMSViaAWS(service, product_url, title, store) {
	log.toConsole("alert", "Sending SMS notification via AWS!");

	aws.config.update({
		region: service.region,
		accessKeyId: service.key,
		secretAccessKey: service.secret,
	});

	var sns = new aws.SNS();

	var parameters = {
		Message: `${title} in stock at ${store}! \n\n${product_url} \n\nStockAlertBot | ${moment().format(
			"MMM Do YYYY - h:mm:ss A"
		)}\nhttps://github.com/Prince25/StockAlertBot`,
		MessageStructure: "string",
		PhoneNumber: "+" + service.phone,
	};

	sns.publish(parameters, (error) => {
		if (error) {
			log.toConsole(
				"error",
				"Error sending SMS notification via AWS: " + error + "\n" + error.stack
			);
			log.toFile("sms-aws", error);
		}
	});
}
