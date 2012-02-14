var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Video = new Schema({
	_id				: ObjectId,
	url				: String
});

module.exports = mongoose.model('video', Video);