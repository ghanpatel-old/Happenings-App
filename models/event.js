var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Video = require('../models/video.js');
var Photo = require('../models/photo.js');
var Comments = require('../models/comments.js');
var Ratings = require('../models/ratings.js');

/*
var Event = new Schema({
	_id				: ObjectId,
	name			: String, 
	genre			: String,
	tags			: [String],
	modified		: { type: Date, default: Date.now }
});
*/


var Event = new Schema({
	id				: { type: String, required: true, index: { unique: true } },
	name			: String, 
	genre			: String,
	venueId			: String,
	vname			: String,
 	long_description	: String,
 	short_description	: String,
 	event_start_date	: String,
 	event_end_date		: String,
	event_time			: String,
 	orgid				: Number,
 	adm					: String,
	ratings			: [Ratings],
	ticketURL		: String,
	URL				: String,
	twitterHash		: String,
	videos			: [Video],
	photos			: [Photo],
	comments		: [Comments],
	tags			: [String],
	rush			: Boolean,
	cat_id			: String,
	category		: String,
	modified		: { type: Date, default: Date.now }
});

module.exports = mongoose.model('event', Event);