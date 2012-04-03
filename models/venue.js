var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Venue = new Schema({
	venue_id		: String,
	name			: { type: String, required: true, index: { unique: true } },
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
	imageURL		: String,
	org_id			: String,
	borough_id		: String,
	neighborhood_id : String, 
	neighborhood_name: String,
	borough_name	: String,
	cat_id			: String,
	wear			: String
	
});

module.exports = mongoose.model('venue', Venue);