import { toConsole } from "../src/utils/log.js";
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import express from "express";
import { parse, stringify } from "envfile";
import { resolve } from "path";
import open from "open";

const require = createRequire(import.meta.url);
const app = express();
const port = 3250;
const envFile = "config/.env";
const exampleEnvFile = "config/example.env";
const configFile = "config/config.json";

// Attempt to read .env file, if it doesn't exist, create an .env file with example.env information
let environmentFile = "";
try {
  environmentFile = readFileSync(envFile, { encoding: "utf8", flag: "r" });
  if (environmentFile === "") throw new Error(".env file empty!");
  toConsole("info", ".env file found! Attempting to read...");
} catch {
  toConsole("info", ".env file not found! Creating a new one...");
  environmentFile = readFileSync(exampleEnvFile, { encoding: "utf8", flag: "r" });
  writeFileSync(envFile, environmentFile);
}

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup routes
app.get("/", (req, res) => {
  res.sendFile(resolve() + "/server/index.html");
});

app.get("/env", (req, res) => {
  res.send(parse(environmentFile));
});

app.post("/env", (req, res) => {
  const environmentSettings = stringify(req.body);
  writeFileSync(envFile, environmentSettings, "utf8");
  res.send({ message: "Successfully saved .env" });
});

app.get("/config", (req, res) => {
  res.sendFile(resolve() + "/config/config.json");
});

app.post("/config", (req, res) => {
  const settings = JSON.stringify(req.body, undefined, 4);
  writeFileSync(configFile, settings, "utf8");
  res.send({ message: "Successfully saved config.json" });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  toConsole("setup", `Server started on port ${port}`);
  toConsole("info", `Opening settings page on http://localhost:${port}/...`);
  open(`http://localhost:${port}/`);
});