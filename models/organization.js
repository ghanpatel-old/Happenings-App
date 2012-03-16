var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Org = new Schema({
	org_id				: { type: String, required: true, index: { unique: true } },
	name				: String,
	short_description	: String,
	long_description	: String,
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
	web				: String,
	borough_id		: String,
	neighborhood_id	: String,
	neighborhood_name: String,
	borough_name	: String,  
	logoURL			: String,
	imageURL		: String,
	cat_id 			: String

});

module.exports = mongoose.model('org', Org);