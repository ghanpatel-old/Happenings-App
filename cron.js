//require("openurl").open("http://happenings-app.heroku.com/fillData");

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://heroku:1111@staff.mongohq.com:10010/app2729959');

var api = require('./controllers/api.js');

api.fillData();

var disconnect = function(){
	//wait 20 seconds, give timer...
	var date = new Date();
	var curDate = null;

	do { 
		curDate = new Date(); 
		console.log(curDate-date);
	} 
	while(curDate-date < 10000);

	//db.disconnect();
}

//disconnect();
