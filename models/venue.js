var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Venue = new Schema({
	_id				: ObjectId,
	name			: String, 
	description		: String,
	add1			: String,
	add2			: String,
	add3			: String,
	add_loc			: String,
	city			: String,
	state			: String,
	zip				: String,
	location		: String,
	lattitude		: String,
	longitude		: String,
	phone			: String,
	logoURL			: String,
	imageURL		: String
});

module.exports = mongoose.model('venue', Venue);