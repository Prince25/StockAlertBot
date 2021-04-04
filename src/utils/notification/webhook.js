import moment from "moment";
import fetch from 'node-fetch'
import * as log from '../log.js';

export default async function sendAlertToWebhooks(WEBHOOK_URLS, product_url, title, image, store) {
	for (const url of WEBHOOK_URLS) {
		
		// Notify Discord
		if (url.includes("discord")) {
			log.toConsole('alert', 'Sending notification to Discord!')
			fetch(url, {
				method: "POST",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					username: "StockAlertBot",
					embeds: [
						{
							title: title,
							url: product_url,
							color: "15736093",
							footer: {
								text: `StockAlertBot | ${moment().format(
									"MMMM Do YYYY - h:mm:ss A"
								)}\nhttps://github.com/Prince25/StockAlertBot`,
							},
							thumbnail: {
								url: image,
							},
							fields: [
								{
									name: "Store",
									value: store,
									inline: true,
								},
								{
									name: "Status",
									value: "In Stock",
									inline: true,
								},
								{
									name: "Product Page",
									value: product_url,
								},
							],
						},
					],
				}),
			}).catch((error) => {
				log.toConsole('error', 'Error sending notification to Discord: ' + error)
				log.toFile('Discord', error)
			});

		// Notify Slack
		} else if (url.includes("slack")) {
			log.toConsole('alert', 'Sending notification to Slack!')
			fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					attachments: [
						{
							title: title,
							title_link: product_url,
							color: "#36a64f",
							fields: [
								{
									title: "Store",
									value: store,
									short: true,
								},
								{
									title: "Status",
									value: "In Stock",
									short: true,
								},
								{
									title: "Product Page",
									value: product_url,
									short: false,
								},
							],
							thumb_url: image,
							footer: `StockAlertBot | ${moment().format(
								"MMMM Do YYYY - h:mm:ss A"
							)}\nhttps://github.com/Prince25/StockAlertBot`,
						},
					],
				})
			})
			.catch((error) => {
				log.toConsole('error', 'Error sending notification to Slack: ' + error)
				log.toFile("Slack", error);
			});

		// Notify IFTTT  
		} else if (url.includes('ifttt')) {
			log.toConsole('alert', 'Sending notification to IFTTT!')
			fetch(url, {
				method: 'POST',
				url: url,
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify({
					value1: title,
					value2: product_url,
					value3: image
				})
			})
			.catch(error => {
				log.toConsole('error', 'Error sending notification to IFTTT: ' + error)
				log.toFile('IFTTT', error)
			}) 
		}  
	}   
} 