var Mongoose = require('mongoose').Mongoose;

Mongoose.model('User', {
	properties: ['login', 'password','role'],
	
	indexes: ['login', 'password'],
	
	static: {
		authenticate: function(login, password){
			return this.find({login:login, password:password});
		}
	}
});