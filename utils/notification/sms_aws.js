import aws from 'aws-sdk';
import fs from "fs";
import moment from 'moment';
import config from "../config.js";
import { SMS_METHOD } from '../../main.js'

const service = config.sms_aws;

export default async function sendAlertToSMSViaAWS(product_url, title, store) {
	if (SMS_METHOD == "Amazon Web Services") {
		if (!fs.existsSync('.env')) {
			console.error(moment().format('LTS') + ": Error sending AWS SMS alert, .env file not present.")
		}
		else if (service.region == "" || service.key == "" || service.secret == "" || service.phone == "") {
			console.error(moment().format('LTS') + ": Error sending AWS SMS alert, ensure AWS information is filled.")
		} else {
			console.info(moment().format('LTS') + ": Sending AWS SMS alert")
			
			aws.config.update({
				region: service.region,
				accessKeyId: service.key,
				secretAccessKey: service.secret
			});

			var sns = new aws.SNS();

			var params = {
				Message: `${title} in stock at ${store}! \n\n${product_url} \n\nStockAlertBot | ${moment().format('MMM Do YYYY - h:mm:ss A')}`,
				MessageStructure: 'string',
				PhoneNumber: '+' + service.phone
			};

			sns.publish(params, (err) => {
				if (err) {
					console.error(moment().format('LTS') + ": Error sending email alert", err, err.stack);
				}	
			});
		}
	}
}			
