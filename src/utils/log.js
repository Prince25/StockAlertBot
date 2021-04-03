import fs from "fs";
import util from "util";
import chalk from 'chalk'	// https://www.npmjs.com/package/chalk
import moment from "moment";


const DIRECTORY = "../../logs/";
const MOMENT_FORMAT = "LTS"


/*
	Writes a message to console for one of the following types:
	error, info, setup, stock
*/
export function toConsole(type, message) {
	const time = () => moment().format(MOMENT_FORMAT)
	switch (type.toLowerCase()) {
		case 'error':
			console.error(
				"[" + chalk.red.bold(type.toUpperCase()) + "]" + "\t" +
				chalk.gray.italic(time()) + ": " +
				message
			)
			break

		case 'info':
			console.info(
				"[" + chalk.cyan.bold(type.toUpperCase()) + "]" + "\t" +
				chalk.gray.italic(time()) + ": " +
				message
			)
			break

		case 'setup':
			console.info(
				"[" + chalk.bold(type.toUpperCase()) + "]" + "\t" +
				chalk.gray.italic(time()) + ": " +
				message
			)
			break

		case 'stock':
			console.info(
				"[" + chalk.green.bold(type.toUpperCase()) + "]" + "\t" +
				chalk.gray.italic(time()) + ": " +
				message
			)
			break
	}
}


/*
	Writes a message (preferably an error) to log file
*/
export function toFile(store, error, html = undefined) {
	fs.writeFile(DIRECTORY + store + ".log", util.inspect(error), function (error) {
		if (error) toConsole("error", chalk.red("File write error: ") + error);
	});

	toConsole(
		"error",
		"Error occured for " +
		chalk.cyan(store) + ". Written to " + 
		chalk.yellow(DIRECTORY + store + ".log.")
	);

	let message =
		"This is usually not a problem but if this error appears frequently, please report the error (and the log) to GitHub.";

	if (html) {
		message +=
			"\nHTML written for " +
			chalk.cyan(store) +
			" to " +
			chalk.yellow(DIRECTORY + store + "ErrorPage.html. ") +
			"Please report this bug to GitHub and upload this file.";

		fs.writeFile(DIRECTORY + store + "ErrorPage.html", html, function (error) {
			if (error) toConsole("error", chalk.red("File write error: ") + error);
		});
	}

	toConsole("info", message);
}
