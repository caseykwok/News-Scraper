var mongoose = require("mongoose");
var express = require("express");

var request = require("request");
var cheerio = require("cheerio");

// Use Express to initialize server
var app = express();
var PORT = process.env.PORT || 3000;

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Access static files
var path = require("path");
app.use("/static", express.static(path.join(__dirname, "/public")));

// Initialize Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var databaseUri = "mongodb://localhost/news-scraper";
if (process.env.MONGODB_URI) {
	// Executes if this is being executed in Heroku
	mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
} else {
	// Executes if this is being executed on local machine
	mongoose.connect(databaseUri, { useMongoClient: true });
}

var db = mongoose.connection;

// Show any Mongoose errors
db.on("error", function(err) {
	console.log("Mongoose Error: ", err);
});

// Once logged in to the database through Mongoose, log a success message
db.once("open", function() {
	console.log("Mongoose connection successful.");
});

app.listen(PORT, function() {
	console.log("App listening on PORT " + PORT);
});