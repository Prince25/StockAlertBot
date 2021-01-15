import nodemailer from "nodemailer"
import moment from "moment";
import config from "../config.js";

const email = config.email;

export default async function sendAlertToEmail(url, title, image, store) {
	if (email.service != "" && email.from != "" && email.pass != "" && email.to != "") {
		console.info(moment().format('LTS') + ": Sending email alert.")
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
			text: `${title}  \n ${url}`,
			attachments: [
				{
					filename: 'Product.jpg',
					path: image

				}
			]
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.error(error);
			} else {
				console.info(moment().format('LTS') + ": Email alert sent to:", info.accepted);
			}
		});
	}	
}