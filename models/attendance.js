var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Attendance = new Schema({
	_id				: ObjectId,
	userId			: ObjectId, 
	eventId			: ObjectId,
	state			: Number
});

module.exports = mongoose.model('attendance', Attendance);