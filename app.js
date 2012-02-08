// The main application script, ties everything together.

var express = require('express');
var mongoose = require('mongoose');
var app = express.createServer(express.logger());
app.use(express.bodyParser());

var db = mongoose.connect('mongodb://heroku:1111@staff.mongohq.com:10010/app2729959')

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

var api = require('./controllers/api.js');

app.get('/', api.blank);
app.post('/', api.add);

app.post('/thread', api.post);
app.get('/thread/:title.:format?', api.show);
app.get('/thread', api.list);

app.get('/user/get.json', api.usersAll);
app.get('/user/:title/get.json', api.userId);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
