var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	'title': { type: String, index: true },
	  'fname': String,
	  'lname': String,
	  'tags': [String],
	  'user_id': ObjectId
	});

module.exports = mongoose.model('user', UserSchema);