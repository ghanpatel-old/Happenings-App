var mongoose		= require("mongoose");

var Schema			= mongoose.Schema;
var ObjectId		= Schema.ObjectId;

var Ratings = new Schema({
    rating    : Number,
    _id	      : ObjectId,
    date      : Date
});

module.exports = mongoose.model('ratings', Ratings);