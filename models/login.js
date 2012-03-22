var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Login = new Schema({
	_id				: ObjectId 
	userId			: {type : String, index : true, unique : true, required : true, safe : true}
	type			: String, 
	ValidationData	: String
});

module.exports = mongoose.model('login', Login);