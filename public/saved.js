function displayResults(results) {
	results.forEach(function(result) {
		var div = $("<div>").addClass("col-md-3 col-sm-4 col-xs-12 entire-container");
		var videoContainer = $("<div>").addClass("video-container");

		var image = $("<img>").addClass("video-image").attr("src", result.image).attr("alt", "YouTube Thumbnail");

		var middle = $("<div>").addClass("middle");
		var commentsButton = $("<a>").addClass("comments").attr("href", "#").attr("data-id", result._id).html("<i class='fa fa-commenting-o fa-3x' aria-hidden='true'></i>");
		var unsaveButton = $("<a>").addClass("unsave").attr("href", "#").attr("data-id", result._id).html("<i class='fa fa-trash-o fa-3x' aria-hidden='true'></i>");
		middle.html(commentsButton);
		middle.append(unsaveButton);

		videoContainer.html(image);
		videoContainer.append(middle);

		var titleDiv = $("<h5>").html($("<a>").addClass("video-title").attr("href", result.content_url).attr("target", "_blank").html(result.title));

		div.html(videoContainer);
		div.append(titleDiv);

		$("#videos").prepend(div);
	});
};

// Upon load, grab all the saved entries in 'Content' and display it to the user
$.get("/saved_videos", function(results) {
	displayResults(results);
});

// Click "Notes" of specific video
$(document).on("click", ".comments", function() {
	$(".modal-comments").empty();

	var id = $(this).attr("data-id");
	console.log("ID: " + id);

	$.get("/saved_videos/" + id, function(result) {
		if (result.comments.length === 0) {
			$(".modal-comments").html($("<h4>").addClass("no-comments").text("No comments on this video. Be the first to comment!"));
			$(".modal-comments").append("<hr>");
			// $(".share-thoughts").css(""))
		} else {
			var ul = $("<ul>").addClass("list-group");
			result.comments.forEach(function(comment) {
				var li = $("<li>").addClass("list-group-item relative");
				var commentNameDate = $("<p>").html($("<span>").addClass("comment-name").text(comment.author));
				var commentDate = $("<span>").addClass("comment-date").text(moment(comment.createdAt).format("MMM DD, h:mm a"));
				commentNameDate.append("&bull;");
				commentNameDate.append(commentDate);
				var commentContent = $("<p>").addClass("comment-content").text(comment.body);
				var deleteButton = $("<a>").addClass("delete-comment").attr("href", "#").attr("data-video-id", result._id).attr("data-comment-id", comment._id).html("&times;");

				li.html(commentNameDate);
				li.append(commentContent);
				li.append(deleteButton);

				ul.prepend(li);
			});
			$(".modal-comments").append(ul);
		}
		$("#submit-comment").attr("data-id", result._id);
		$("#video-comments").modal("toggle");
	});
});

// Click "Delete From Saved" of specific video
$(document).on("click", ".unsave", function() {
	var id = $(this).attr("data-id");
	console.log("ID: " + id);

	$.get("/unsave/" + id);
	$(this).closest("div.col-md-3.col-sm-4.col-xs-12.entire-container").remove();
});

// Click "Save Comment" of specific video
$(document).on("click", "#submit-comment", function(event) {
	event.preventDefault();
	var id = $(this).attr("data-id");
	console.log("ID: " + id);

	var comment;
	if ($("#name-input").val().trim() === "") {
		comment = {
			body: $("#comment-input").val()
		};
	} else {
		comment = {
			author: $("#name-input").val(),
			body: $("#comment-input").val()
		};	
	}

	$.post("/saved_videos/" + id, comment)
	.done(function(data) {
		$("#name-input").val("");
		$("#comment-input").val("");

		console.log(data);
		$("#video-comments").modal("hide");
	});
});

// Click "X" (delete comment) of specific video
$(document).on("click", ".delete-comment", function() {
	var videoId = $(this).attr("data-video-id");
	var commentId = $(this).attr("data-comment-id");
	console.log("Video ID: " + videoId);
	console.log("Comment ID: " + commentId);

	$.get("/saved_videos/" + videoId + "/delete_comment/" + commentId);
	$("#video-comments").modal("hide");
});
