console.log("Setting up server...");

// Support require
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Attempt to read .env file
// If it doesn't exist, create an .env file with example.env information
console.log("Looking for .env file...");
const fs = require("fs");
var firstRun = true;
function readEnvironmentFile(firstRun) {
	let environmentFile = "";
	try {
		environmentFile = fs.readFileSync(".env", { encoding: "utf8", flag: "r" });
		if (environmentFile == "") throw new Error(".env file empty!");
		if (firstRun) console.log(".env file found! Attempting to read...");
	} catch {
		if (firstRun) console.log(".env file not found! Creating a new one...");
		environmentFile = fs.readFileSync("example.env", { encoding: "utf8", flag: "r" });
		fs.writeFileSync(".env", environmentFile);
	}
	return environmentFile;
}
readEnvironmentFile(firstRun);
firstRun = false;

// Import stuff
console.log("Importing important stuff...");
const { parse, stringify } = require("envfile");
var open = require("open");
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var cors = require("cors");
var app = express();

// Setup express with CORS on port 3250
console.log("Starting server...");
app.use(cors());
app.options("*", cors());
app.listen(3250, listening);

function listening() {
	console.log("Server started!");
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
  Setup routes
*/
console.log("Setting up routes...");

// index.html: https://localhost:3250/
app.get("/", getPage);
function getPage(request, response) {
	response.sendFile(path.join(path.resolve() + "/server/index.html"));
}

// GET .env: https://localhost:3250/env
app.get("/env", getEnvironment);
function getEnvironment(request, response) {
	let environmentFile = readEnvironmentFile(firstRun);
	response.send(parse(environmentFile));
}

// POST .env: https://localhost:3250/env
app.post("/env", postEnvironment);
function postEnvironment(request, response) {
	console.log("Settings received! Saving to .env...");
	let environmentSettings = stringify(request.body);

	fs.writeFile(".env", environmentSettings, "utf8", function (error) {
		if (error) {
			response.status(400).send({ error: "Error writing .env" });
		} else {
			response.send({ message: "Successfully saved .env" });
		}
	});
}

// GET config.json: https://localhost:3250/config
app.get("/config", getSettings);
function getSettings(request, response) {
	response.sendFile(path.join(path.resolve() + "/config.json"));
}

// POST config.json: https://localhost:3250/config
app.post("/config", postSettings);
function postSettings(request, response) {
	console.log("Settings received! Saving to config.json...");
	let settings = JSON.stringify(request.body, undefined, 4);

	fs.writeFile("config.json", settings, "utf8", function (error) {
		if (error) {
			response.status(400).send({ error: "Error writing config.json" });
		} else {
			response.send({ message: "Successfully saved config.json" });
		}
	});
}

console.log("Opening settings page...");
open("http://localhost:3250/");
