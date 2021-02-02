import nodemailer from "nodemailer"
import fs from "fs";
import moment from "moment";
import config from "../config.js";
import { SMS } from '../../main.js'

const { email, sms } = config;

export default async function sendAlertToSMS(product_url, title, image, store) {
	if (SMS) {
		if (!fs.existsSync('.env')) {
			console.error(moment().format('LTS') + ": Error sending sms alert, rename example.env file to .env")
		}
		else if (sms.number.length > 0 && (!email.from || !email.pass)) {
			console.error(moment().format('LTS') + ": For sms alerts to work, both email and sms must be configured")
		} else {
			console.info(moment().format('LTS') + ": Sending sms alert")
			
			var transporter = nodemailer.createTransport({
				service: email.service,
				auth: {
					user: email.from,
					pass: email.pass
				}
			});

			var mailOptions = {
				from: `"StockAlertBot" <${email.from}>`,
				subject: '***** In Stock at ' + store + ' *****',
				text: `${title} \n\n${product_url} \n\nStockAlertBot | ${moment().format('MMM Do YYYY - h:mm:ss A')}`,
				to: sms.number + sms.carrier,
				attachments: [
					{
						filename: 'Product.jpg',
						path: image

					}
				]
			};

			transporter.sendMail(mailOptions, (error) => {
				if (error) {
					console.error(moment().format('LTS') + ": Error sending sms alert", error);
				} else {
					console.info(moment().format('LTS') + ": sms alert sent");
				}
			});
		}	
	}
}