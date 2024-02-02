// index.js

/**
 * Required External Modules
 */

require('dotenv-flow').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const indexingApi = require("./function");
const expressBasicAuth = require("express-basic-auth");
const multer  = require('multer');
const parseFileToDatabase = require('./fileParsingToDatabase');
const database = require('./databaseConnection');

/**
 * App Variables
 */

const app = express();
const port = process.env.PORT || "8000";
const upload = multer({ dest: 'uploads/' });

/**
 *  App Configuration
 */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let page_password = process.env.PAGE_PASSWORD;

app.use(expressBasicAuth({
  challenge: true,
  users: { 'admin': page_password }
}));

/**
 * Routes Definitions
 */

app.get("/", (req, res) => {
  res.render("loadFile", { title: "Indexing API" });
});

app.get("/custom", (req, res) => {
  res.render("index", { title: "Indexing API" });
});

app.post("/result", function (req, res) {
  indexingApi.indexingApi(req.body.data, (data) => {
    res.render("result", { data: data });
  });
});

app.post("/load-data", upload.single('fileToParse'), async function (req, res) {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const responseData = await parseFileToDatabase.parseFileToDatabase(req.file.path);
  
  res.render("result", { data: JSON.stringify(responseData) });
});

/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
