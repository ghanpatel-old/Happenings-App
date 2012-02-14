var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Venue = new Schema({
	_id				: ObjectId,
	name			: String, 
	description		: String,
	location		: String,
	geo				: [String,String],
	logoURL			: String,
	imageURL		: String
});

module.exports = mongoose.model('venue', Venue);