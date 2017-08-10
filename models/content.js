var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var contentSchema = new Schema({
	title: String,
	content_url: String,
	description: String,
	channel: String,
	channel_url: String,
	image: String,
	saved: {
		type: Boolean,
		default: false
	},
	comments: [{
		type: Schema.Types.ObjectId,
		ref: "comment"
	}]
});

var Content = mongoose.model("content", contentSchema);

module.exports = Content;