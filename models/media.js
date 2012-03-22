var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Media = new Schema({
	_id				: ObjectId,
	path			: String, 
	type			: String,
	eventId			: ObjectId,
	venueID			: ObjectId,
	tags			: [String]
});

module.exports = mongoose.model('media', Media);