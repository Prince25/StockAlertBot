import chalk from 'chalk'
import moment from "moment";
import * as log from '../log';
import nodemailer from "nodemailer";


export default async function sendAlertToEmail(email, product_url, title, image, store) {
	log.toConsole('alert', 'Sending Email notification')

	var transporter = nodemailer.createTransport({
		service: email.service,
		auth: {
			user: email.from,
			pass: email.pass,
		},
	});

	var mailOptions = {
		from: `"StockAlertBot" <${email.from}>`,
		to: email.to,
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

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			log.toConsole('error', 'Error sending Email notification: ' + error)
			log.toFile('Email', error)
		} else {
			log.toConsole('alert', 'Email notification sent to ' + chalk.yellow.bold(info.accepted[0]) + '!')
		}
	});
}
