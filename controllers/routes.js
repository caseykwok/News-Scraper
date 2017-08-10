var express = require("express");
var router = express.Router();

var request = require("request");
var cheerio = require("cheerio");

var Content = require("../models/content");
var Comment = require("../models/comment");

router.get("/", function(req, res) {
	res.render("home");
});

router.get("/unsaved", function(req, res) {
	Content.find({"saved": false}, function(err, data) {
		if (err) {
			console.log("Error: ", err);
		} else {
			res.json(data);
		}
	});
});

router.get("/saved", function(req, res) {
	res.render("saved");
})

router.get("/saved_videos", function(req, res) {
	Content.find({"saved": true}, function(err, data) {
		if (err) {
			console.log("Error: ", err);
		} else {
			res.json(data);
		}
	});
});

router.get("/saved_videos/:id", function(req, res) {
	Content.findOne({"_id": req.params.id, "saved": true}).populate("comments").exec(function(err, data) {
		if (err) {
			console.log("Error: ", err);
		} else {
			res.json(data);
		}
	});
});

router.post("/saved_videos/:id", function(req, res) {
	var comment = new Comment(req.body);

	comment.save(function(err, newComment) {
		if (err) {
			console.log("Error: ", err);
		} else {
			Content.findOneAndUpdate({"_id": req.params.id}, {$push: {"comments": newComment._id}}, {new: true}, function(error, newdoc) {
				if (error) {
					console.log("Error: ", error);
				} else {
					console.log("Comment added!");
					res.json(newdoc);
				}
			});
		}
	});
});

router.get("/saved_videos/:videoId/delete_comment/:commentId", function(req, res) {
	Comment.remove({"_id": req.params.commentId});
	Content.findOneAndUpdate({"_id": req.params.videoId}, {$pull: {"comments": req.params.commentId}}, function(err, doc) {
		if (err) {
			console.log("Error: ", err);
		} else {
			console.log("Comment removed!");
			res.json(doc);
		}
	});
});

router.get("/scrape", function(req, res) {
	request("https://www.youtube.com/feed/trending", function(error, response, html) {
		var count = 0;
		var added = 0;
		var $ = cheerio.load(html);
		var trendingLength = $("div.expanded-shelf-content-item").length;
		console.log("Length: " + trendingLength);
		function trendingLoop() {
			if (count < trendingLength) {
				var element = $("div.expanded-shelf-content-item")[count];
				// console.log("-------------------New Element!-------------------");
				// console.log("Title: " + $(element).find("h3.yt-lockup-title").children("a").attr("title"));
				// console.log("URL: https://www.youtube.com" + $(element).find("h3.yt-lockup-title").children("a").attr("href"));
				// console.log("Description: " + $(element).find("div.yt-lockup-description").text());
				// console.log("Channel: " + $(element).find("div.yt-lockup-byline").text());
				// console.log("Channel URL: https://www.youtube.com" + $(element).find("div.yt-lockup-byline").children("a").attr("href"));
				// console.log("--------------------------------------------------");
				var title = $(element).find("h3.yt-lockup-title").children("a").attr("title");
				var contentUrl = "https://www.youtube.com" + $(element).find("h3.yt-lockup-title").children("a").attr("href");
				var description = $(element).find("div.yt-lockup-description").text();
				var channel = $(element).find("div.yt-lockup-byline").text();
				var channelUrl = "https://www.youtube.com" + $(element).find("div.yt-lockup-byline").children("a").attr("href");
				var dataThumbImage = $(element).find("span.yt-thumb-simple").children("img").attr("data-thumb");
				var srcImage = $(element).find("span.yt-thumb-simple").children("img").attr("src");
				var image;
				// If image URL doesn't exist within data-thumb attribute,
				// Set the image URL to the src attribute (should exist in either one)
				if (!dataThumbImage) {
					image = srcImage;
				// If the image URL doesn't exist within the src attribute,
				// Set the image URL to the data-thumb attribute
				} else if (!srcImage) {
					image = dataThumbImage;
				// If both the data-thumb and src attributes exist,
				// Check to see which one is a .gif and set the other option to be the image URL
				} else if (dataThumbImage && srcImage) {
					if (!srcImage.match(/\.(gif)/g)) {
						image = srcImage;
					} else {
						image = dataThumbImage;
					}
				}

				var video = {
					"title": title, 
					"content_url": contentUrl, 
					"description": description,
					"channel": channel,
					"channel_url": channelUrl,
					"image": image
				};

				// Go through 'Content' collection to see if the video entry already exists
				var promise = Content.findOne(video).exec();
				promise.then(function(result) {
					// If the video entry does not exist already, add it to the 'Content' collection
					if (!result) {
						var entry = new Content(video);
						console.log("Entry: ", entry);
						entry.save(function(err) {
							if (err) {
								console.log("Error: ", err);
							} else {
								count++;
								added++;
								console.log("New video added!");
								trendingLoop();
							}
						});
					} else {
						count++;
						trendingLoop();
					}
				});	
			} else {
				console.log("Done!!");
				res.json({
					added: added
				});
			}
		};

		trendingLoop();
	});
});

router.get("/save/:id", function(req, res) {
	Content.findOneAndUpdate({"_id": req.params.id}, {"saved": true}).exec(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			console.log("Video saved!");
			res.json(results);
		}
	});
});

router.get("/unsave/:id", function(req, res) {
	Content.findOneAndUpdate({"_id": req.params.id}, {"saved": false}).exec(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			console.log("Video unsaved!");
			res.json(results);
		}
	});
});

router.get("/unsave/:id", function(req, res) {
	Content.findOneAndUpdate({"_id": req.params.id}, {"saved": false}).exec(function(err, results) {
		if (err) {
			console.log(err);
		} else {
			console.log("Video unsaved!");
			res.json(results);
		}
	});
});

router.get("*", function(req, res) {
	res.render("home");
});

module.exports = router;
