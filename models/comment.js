var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
	author: {
		type: String,
		default: "Anonymous"
	},
	body: {
		type: String,
		required: "Please enter a valid comment"
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

var Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;