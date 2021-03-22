import nodemailer from "nodemailer"
import fs from "fs";
import moment from "moment";
import config from "../config.js";
import { SMS_METHOD } from '../../main.js'

const { sms_email } = config;

export default async function sendAlertToSMSViaEmail(product_url, title, image, store) {
	if (SMS_METHOD == "Email") {
		if (!fs.existsSync('.env')) {
			console.error(moment().format('LTS') + ": Error sending SMS alert, rename example.env file to .env")
		}
		else if (sms_email.number.length == 0 && (!sms_email.from || !sms_email.pass)) {
			console.error(moment().format('LTS') + ": For SMS alerts to work, both email and SMS must be configured")
		} else {
			console.info(moment().format('LTS') + ": Sending SMS alert")
			
			var transporter = nodemailer.createTransport({
				service: sms_email.service,
				auth: {
					user: sms_email.from,
					pass: sms_email.pass
				}
			});

			var mailOptions = {
				from: `"StockAlertBot" <${sms_email.from}>`,
				to: sms_email.number + '@' + sms_email.carrier,
				subject: '***** In Stock at ' + store + ' *****',
				text: `${title} \n\n${product_url} \n\nStockAlertBot | ${moment().format('MMM Do YYYY - h:mm:ss A')}`,
				attachments: [
					{
						filename: 'Product.jpg',
						path: image
					}
				]
			};

			transporter.sendMail(mailOptions, (error) => {
				if (error) {
					console.error(moment().format('LTS') + ": Error sending SMS alert", error);
				} else {
					console.info(moment().format('LTS') + ": SMS alert sent");
				}
			});
		}	
	}
}