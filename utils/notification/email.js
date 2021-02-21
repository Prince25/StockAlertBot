import nodemailer from "nodemailer"
import fs from "fs";
import moment from "moment";
import config from "../config.js";
import { EMAIL } from '../../main.js'

const email = config.email;

export default async function sendAlertToEmail(product_url, title, image, store) {
	if (EMAIL) {
		if (!fs.existsSync('.env')) {
			console.error(moment().format('LTS') + ": Error sending email alert, rename example.env file to .env")
		}
		else if (email.service == "" || email.from == "" || email.pass == "" || email.to == "") {
			console.error(moment().format('LTS') + ": Error sending email alert, open and edit .env file")
		} else {
			console.info(moment().format('LTS') + ": Sending email alert")

			var transporter = nodemailer.createTransport({
				service: email.service,
				auth: {
					user: email.from,
					pass: email.pass
				}
			});

			var mailOptions = {
				from: `"StockAlertBot" <${email.from}>`,
				to: email.to,
				subject: '***** In Stock at ' + store + ' *****',
				text: `${title} \n\n${product_url} \n\nStockAlertBot | ${moment().format('MMM Do YYYY - h:mm:ss A')}`,
				attachments: [
					{
						filename: 'Product.jpg',
						path: image
					}
				]
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.error(moment().format('LTS') + ": Error sending email alert", error)
				} else {
					console.info(moment().format('LTS') + ": Email alert sent to:", info.accepted);
				}
			});
		}	
	}
}