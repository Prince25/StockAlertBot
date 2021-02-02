import aws from 'aws-sdk';
import fs from "fs";
import moment from 'moment';
import config from "../config.js";
import { AWS } from '../../main.js'

const service = config.aws;

export default async function sendAlertToAWS(product_url, title, store) {
	if (AWS) {
		if (!fs.existsSync('.env')) {
			console.error(moment().format('LTS') + ": Error sending AWS sms alert, rename example.env file to .env")
		}
		else if (service.region == "" || service.key == "" || service.secret == "" || service.phone == "") {
			console.error(moment().format('LTS') + ": Error sending AWS sms alert, open and edit .env file")
		} else {
			console.info(moment().format('LTS') + ": Sending AWS sms alert")

			aws.config.update({
				region: service.region,
				accessKeyId: service.key,
				secretAccessKey: service.secret
			});

			var sns = new aws.SNS();

			var params = {
				Message: `${title} \n\n${product_url} \n\nStockAlertBot | ${moment().format('MMM Do YYYY - h:mm:ss A')}`,
				MessageStructure: 'string',
				PhoneNumber: service.phone
			};

			sns.publish(params, (err) => {
				if (err) {
					console.error(moment().format('LTS') + ": Error sending email alert", err, err.stack);
				}	
			});
		}
	}
}			
