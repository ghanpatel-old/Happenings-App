
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://heroku:1111@staff.mongohq.com:10010/app2729959');

var api = require('./controllers/api.js');

api.fillDataThree();
