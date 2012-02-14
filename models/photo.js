var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Photo = new Schema({
	_id				: ObjectId,
	url				: String
});

module.exports = mongoose.model('photo', Photo);