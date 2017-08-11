function displayResults(results) {
	results.forEach(function(result) {
		var div = $("<div>").addClass("col-md-3 col-sm-4 col-xs-12 entire-container");
		var videoContainer = $("<div>").addClass("video-container");

		var image = $("<img>").addClass("video-image").attr("src", result.image).attr("alt", "YouTube Thumbnail");

		var middle = $("<div>").addClass("middle");
		var channelButton = $("<a>").attr("href", result.channel_url).attr("target", "_blank").html("<i class='fa fa-user-o fa-3x' aria-hidden='true'></i>");
		var saveButton = $("<a>").addClass("save").attr("href", "#").attr("data-id", result._id).html("<i class='fa fa-bookmark-o fa-3x' aria-hidden='true'></i>");
		middle.html(channelButton);
		middle.append(saveButton);

		videoContainer.html(image);
		videoContainer.append(middle);

		var titleDiv = $("<h5>").html($("<a>").addClass("video-title").attr("href", result.content_url).attr("target", "_blank").html(result.title));

		div.html(videoContainer);
		div.append(titleDiv);

		$("#videos").prepend(div);
	});
};

// Upon load, grab all the entries in 'Content' and display it to the user
$.get("/unsaved", function(results) {
	displayResults(results);
});

// Click "Scrape New Videos"
$("#scrape").on("click", function() {
	$.get("/scrape", function(results) {
		// Populate the modal with the number of videos added and toggle it
		console.log("Number of Videos Added: " + results.added);
		if (results.added === 0) {
			$("#modal-video-count-added").text("No new videos available. Please try again later.");
		} else {
			$("#modal-video-count-added").text("Added " + results.added + " new videos.");
		}
		$("#videos-added").modal("toggle");

		// Display the updated list of videos in database
		$.get("/unsaved", function(videos) {
			displayResults(videos);
		});
	});
});

// Click "Save Video" of specific video
$(document).on("click", ".save", function() {
	var id = $(this).attr("data-id");
	console.log("ID: " + id);

	$.get("/save/" + id);
	$(this).closest("div.col-md-3.col-sm-4.col-xs-12.entire-container").remove();
});
