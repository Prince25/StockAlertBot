import fs from "fs";
import util from "util";
import chalk from "chalk"; // https://www.npmjs.com/package/chalk
import moment from "moment";

const DIRECTORY = "logs/";
const MOMENT_FORMAT = "hh:mm:ss: a";

/*
	Writes a message to console for one of the following types:
	error, info, setup, stock
*/
export function toConsole(type, message) {
	const time = () => moment().format(MOMENT_FORMAT);
	switch (type.toLowerCase()) {
		case "alert":
			console.error(
				"[" +
					chalk.yellow.bold(type.toUpperCase()) +
					"]" +
					"\t" +
					chalk.gray.italic(time()) +
					": " +
					message
			);
			break;

		case "check":
			console.error(
				"[" +
					chalk.magentaBright.bold(type.toUpperCase()) +
					"]" +
					"\t" +
					chalk.gray.italic(time()) +
					": " +
					message
			);
			break;

		case "error":
			console.error(
				"[" +
					chalk.red.bold(type.toUpperCase()) +
					"]" +
					"\t" +
					chalk.gray.italic(time()) +
					": " +
					message
			);
			break;

		case "info":
			console.info(
				"[" +
					chalk.cyan.bold(type.toUpperCase()) +
					"]" +
					"\t" +
					chalk.gray.italic(time()) +
					": " +
					message
			);
			break;

		case "setup":
			console.info(
				"[" +
					chalk.bold(type.toUpperCase()) +
					"]" +
					"\t" +
					chalk.gray.italic(time()) +
					": " +
					message
			);
			break;

		case "stock":
			console.info(
				"[" +
					chalk.green.bold(type.toUpperCase()) +
					"]" +
					"\t" +
					chalk.gray.italic(time()) +
					": " +
					message
			);
			break;
	}
}

/*
	Writes a message (preferably an error) to log file
*/
export function toFile(store, error, item = undefined) {
	const itemClone = Object.assign({}, item);
	delete itemClone.html;
	fs.writeFile(
		DIRECTORY + store + ".log",
		util.inspect(error) +
			(item ? "\n" + "ITEM_INFO: " + JSON.stringify(itemClone, undefined, 4) : ""),
		function (error) {
			if (error) toConsole("error", chalk.red("File write error: ") + error);
		}
	);

	let message =
		"Error occured for " +
		chalk.cyan.bold(store.toUpperCase()) +
		(item && item.title
			? " while checking the item, " + chalk.magenta.bold(item.title)
			: item
			? " while checking url: " + chalk.magenta(item.url)
			: "");
	".\n\t\t      Writing error information to " + chalk.yellow(DIRECTORY + store + ".log.");

	if (item && item.html) {
		message +=
			"\n\t\t      Writing HTML to " + chalk.yellow(DIRECTORY + store + "ErrorPage.html.");

		fs.writeFile(DIRECTORY + store + "ErrorPage.html", item.html, function (error) {
			if (error) toConsole("error", chalk.red("File write error: ") + error);
		});
	}
	message +=
		"\n\t\t      This is usually not a problem but if this error appears frequently, please report the error with the log and html files to GitHub.";

	toConsole("error", message);
}
