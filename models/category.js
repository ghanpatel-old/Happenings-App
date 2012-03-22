var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Category = new Schema({
	id					: String,
//	id				: { type: String, required: true, index: { unique: true } },
	name				: String,
	description			: String,
	for_orgs			: Boolean,
	for_venues			: Boolean,
	for_events			: Boolean,
	is_featured			: Boolean,
	parent_category_id 	: String
});

module.exports = mongoose.model('category', Category);