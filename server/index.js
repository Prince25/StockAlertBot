
console.log("Setting up server...")

// Support require
import { createRequire } from "module";
const require = createRequire(import.meta.url);


// Attempt to read .env file
// If it doesn't exist, create an .env file with example.env information 
console.log('Looking for .env file...')
const fs = require('fs');
var firstRun = true;
function readEnvFile(firstRun) {
  let envFile = ''
  try {
    envFile = fs.readFileSync('.env', {encoding:'utf8', flag:'r'});
    if (envFile == '') throw new Error('.env file empty!')
    if(firstRun) console.log('.env file found! Attempting to read...')
  } catch (_) {
    if(firstRun) console.log('.env file not found! Creating a new one...')
    envFile = fs.readFileSync('example.env', {encoding:'utf8', flag:'r'});
    fs.writeFileSync('.env', envFile);
  }
  return envFile
}
readEnvFile(firstRun)
firstRun = false;


// Import stuff
console.log('Importing important stuff...')
const { parse, stringify } = require('envfile')
var open = require('open')
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var cors = require('cors');
var app = express();


// Setup express with CORS on port 3250
console.log('Starting server...')
app.use(cors());
app.options('*', cors());
app.listen(3250, listening);

function listening(){
  console.log("Server started!")
}

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*
  Setup routes
*/
console.log('Setting up routes...')

// index.html: https://localhost:3250/
app.get('/', getPage);
function getPage(req,res){
  res.sendFile(path.join(path.resolve() + '/server/index.html'))
}


// GET .env: https://localhost:3250/env
app.get('/env', getEnv);
function getEnv(req, res){
  let envFile = readEnvFile(firstRun)
  res.send(parse(envFile))
}

// POST .env: https://localhost:3250/env
app.post('/env', postEnv);
function postEnv(req, res){
  console.log('Settings received! Saving to .env...')
  let envSettings = stringify(req.body);

  fs.writeFile('.env', envSettings, 'utf8', function (err) {
    if (err) {
      res.status(400).send({error: 'Error writing .env'})
    } else {
      res.send({message: 'Successfully saved .env'})
    }
  });
}


// GET config.json: https://localhost:3250/config
app.get('/config', getSettings);
function getSettings(req, res){
  res.sendFile(path.join(path.resolve() + '/config.json'))
}

// POST config.json: https://localhost:3250/config
app.post('/config', postSettings);
function postSettings(req, res){
  console.log('Settings received! Saving to config.json...')
  let settings = JSON.stringify(req.body, null, 4);

  fs.writeFile('config.json', settings, 'utf8', function (err) {
    if (err) {
      res.status(400).send({error: 'Error writing config.json'})
    } else {
      res.send({message: 'Successfully saved config.json'})
    }
  }); 
}

console.log("Opening settings page...")
open('http://localhost:3250/')
