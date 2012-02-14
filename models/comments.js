var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Comments = new Schema({
    title     : String,
    body      : String,
    date      : Date
});

module.exports = mongoose.model('comments', Comments);

