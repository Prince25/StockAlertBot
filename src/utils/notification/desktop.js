import fs from "fs";
import tmp from "tmp";
import open from "open";
import axios from "axios";
import * as log from "../log.js";
import notifier from "node-notifier";

// Triggers if `wait: true` and user clicks notification
let url;
notifier.on("click", () => {
	open(url);
});
tmp.setGracefulCleanup();

export default function sendDesktopAlert(product_url, title, image, store) {
	try {
		log.toConsole("alert", "Sending notification to Desktop!");

		// Create a temporary file
		tmp.file(
			{ prefix: store, postfix: ".jpg" },
			async function (error, path, fd, cleanupCallback) {
				if (error) throw error;

				// Download image to the tmp file for Desktop Thumbnail
				const downloadImage = async () => {
					const photoWriter = fs.createWriteStream(path);
					const response = await axios
						.get(image, { responseType: "stream" })
						.catch(function (error) {
							log.toFile(store, error);
						});

					if (response && response.status == 200 && response.data) {
						response.data.pipe(photoWriter);
						return new Promise((resolve, reject) => {
							photoWriter.on("finish", resolve);
							photoWriter.on("error", reject);
						});
					}
				};

				await downloadImage();
				url = product_url;
				notifier.notify(
					{
						// Send Desktop Notification
						title: "***** In Stock at " + store + " *****",
						message: title,
						subtitle: "Stock Alert Bot",
						icon: path,
						contentImage: image,
						open: product_url,
						sound: true, // Only Notification Center or Windows Toasters
						wait: true, // Wait with callback
					},
					function () {
						cleanupCallback(); // Delete tmp file
					}
				);
			}
		);
	} catch (error) {
		log.toFile(store, error);
	}
}
