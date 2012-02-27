// The main application script, ties everything together.

var express = require('express');
var mongoose = require('mongoose');
//var RedisStore = require('connect-redis')(express);
var app = express.createServer(express.logger());

var MemoryStore = require('memory');
var db = mongoose.connect('mongodb://heroku:1111@staff.mongohq.com:10010/app2729959');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  	app.use(express.session({ 
		key: 'some-key',
		secret: 'some-We1rD sEEEEEcret!',
		store: new MemoryStore({ reapInterval: 60000 * 10 }) 
  	}));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

var api = require('./controllers/api.js');
	app.get('/', api.blank);
	app.post('/', api.add);

	app.get('/login/', api.sendLogin);
	app.post('/login/', api.setLogin);
	
	app.post('/user/', api.setUser);
	
	//app.post('/register/', api.registerNewUser);

	app.get('/event/', api.eventsAll);
	app.get('/event/:id/', api.getEvent);
 	app.post('/event/:id/', api.setEventTag);

	app.get('/sms-feed/', api.smsFeed);

	app.get('/fillData', api.fillData);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});