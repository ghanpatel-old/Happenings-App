var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Wnet = new Schema({
	id					: { type: Number, required: true, index: { unique: true } },
 	name				: String,
 	long_description	: String,
 	short_description	: String,
 	event_start_date	: String,
 	event_end_date		: String,
 	venue_id			: String,
 	vname				: String,
 	add1				: String,
 	add2				: String,
 	add3				: String,
 	add_loc				: String,
 	city				: String,
 	state				: String,
 	zip					: String,
 	lattitude			: String,
 	longitude			: String,
 	phone				: String,
 	locid				: Number,
 	orgid				: Number,
 	adm					: String
});

module.exports = mongoose.model('wnet', Wnet);