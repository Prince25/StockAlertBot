import chalk from 'chalk'
import moment from "moment";
import * as log from '../log';
import nodemailer from "nodemailer";


export default async function sendAlertToSMSViaEmail(sms_email, product_url, title, image, store) {
	log.toConsole('alert', 'Sending SMS via Email notification')

	var transporter = nodemailer.createTransport({
		service: sms_email.service,
		auth: {
			user: sms_email.from,
			pass: sms_email.pass,
		},
	});

	var mailOptions = {
		from: `"StockAlertBot" <${sms_email.from}>`,
		to: sms_email.number + "@" + sms_email.carrier,
		subject: "***** In Stock at " + store + " *****",
		text: `${title} \n\n${product_url} \n\nStockAlertBot | ${moment().format(
			"MMM Do YYYY - h:mm:ss A"
		)}\nhttps://github.com/Prince25/StockAlertBot`,
		attachments: [
			{
				filename: "Product.jpg",
				path: image,
			},
		],
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			log.toConsole('error', 'Error sending SMS via Email notification: ' + error)
			log.toFile('sms-email', error)
		} else {
			log.toConsole('alert', 'SMS via Email notification sent to ' + chalk.yellow.bold(info.accepted[0]) + '!')
		}
	});
}
