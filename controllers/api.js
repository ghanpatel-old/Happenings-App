/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/

var Event = require('../models/event.js');
var User = require('../models/user.js');
var Wnet = require('../models/wnet.js');

var request = require('request');

// get('/')
exports.blank = function(req,res){
	//res.render('/app/views/index.html');
	res.send("<p>Hi!</p>");
}

//post('/')
exports.add = function(req, res) {
//    new User({title: req.params.title, author: req.params.author}).save();
}


//post('/login/')
/*
exports.checkLogin = function(req,res){
	var loginSet  = {
		'already': false,
		'info': {}
		};

	User.findOne({mail: req.body.email}, function(err, doc){
		if (doc == null) {
		    loginSet.already = false;
			loginSet.info = { 'mail': req.body.email };
			console.log(loginSet);
		} else {
			console.log(req.body.email + " found!" + " doc: " + doc);
			loginSet.already = true;
			loginSet.info = doc;
		}
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(loginSet));
	});
}
*/
exports.setLogin = function (req,res) {
		var submit = { "value" : "" };
			
		req.session.user = req.body.token;
		
		//find in user table, session.user
		User.findOne({ 'fbtoken': req.session.user }, function (err, docs) {
			console.log(docs);
			if(err){
				submit.value = "error";
				console.log("err on find()");
			}
			if(docs == null){ //doesn't have it
				console.log("creating new record");
				var instance = new User();
				instance.fbtoken = req.session.user;
				instance.save(function (err) {
					if (!err) {
						console.log('Success!');
						submit.value = "new";
					} else {
						console.log('Save Failed.');
						submit.value = "error";
					}
					console.log(submit);
					res.writeHead(200, {'Content-Type': 'application/javascript'});
					res.end(JSON.stringify(submit));
				});	
			} else { //found record
				submit.value = "already";
				console.log(submit);
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.end(JSON.stringify(submit));
			}
		});
}

//get(/login/)
exports.sendLogin = function (req,res) {
	var submit = {"token" : req.session.user};
   	res.writeHead(200, {'Content-Type': 'application/javascript'});
	res.end(JSON.stringify(submit));
   }

//post('/user/')
exports.setUser = function(req,res){
	var submit = { "value" : "" };
	console.log("updating user with fbtoken " + req.session.user);
	User.update({ fbtoken: req.session.user }, 
	        	{$set: { 
				fname:req.body.fname, 
				lname:req.body.lname,
				mail:req.body.email,
				phone:req.body.phone		
				}},
		   		{ upsert: false },
				function(err,numAffected){
					if(err){
						console.log(err + req.body.fname+req.body.lname+req.body.email+req.body.phone);
						submit.value = "error";
					}
					if(numAffected > 0){
						submit.value = "success";
						console.log("Updated " + numAffected + "user records.");
						res.writeHead(200, {'Content-Type': 'application/javascript'});
						res.end(JSON.stringify(submit));						
					}
				});
}

//post('/register/')
exports.registerNewUser = function(req,res) {
	console.log("inside function");
	var fname = req.body.fname;
	var lname = req.body.lname;
	var email = req.body.email;
	var phone = req.body.phone;
	var submit = { "value" : "" };
	
	User.findOne({ 'mail': req.body.email }, function (err, docs) {
		console.log(docs);
		if(err){
			//send "other"
			submit.value = "other";
			console.log("err on find()");
		}
		if(docs == null){
			//create new record
			console.log("creating new record");
			var instance = new User();
			instance.mail = req.body.email;
			instance.fname = req.body.fname;
			instance.lname = req.body.lname;
			instance.phone = req.body.phone;
			instance.save(function (err) {
				if (!err) {
					console.log('Success!');
					submit.value = "success";
				} else {
					console.log('Save Failed.');
					submit.value = "other";
				}
				console.log(submit);
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.end(JSON.stringify(submit));
			});
		} else {
		 	//send "redundant"	
			submit.value = "redundant";
			console.log("redundant");
			console.log(submit);
			res.writeHead(200, {'Content-Type': 'application/javascript'});
			res.end(JSON.stringify(submit));
		}
	});
}

//get('/event')
exports.eventsAll = function(req,res){
	var JSONuserList = {'elements':[]};
	
	Event.find(function (err, docs) {
		// docs.forEach
		if(!err) {
			docs.forEach(function(element, index, array){
				JSONuserList.elements[index] = element;
			});
		}
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
}

//get('/event/:id')

exports.getEvent = function(req,res){
	var JSONuserList = {};
	Event.findOne({_id: req.params.id}, function(err, doc){
		JSONuserList = doc;
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
}

//post('/event/:id?=:tag')
exports.setEventTag = function(req,res){
	Event.findById(req.params.id, function(err, p) {
	  if (!p)
	    return next(new Error('Could not load Document'));
	  else {
		Event.update({ _id : req.params.id},{ $addToSet : { tags : req.body.tag }}, function(name) {
			res.end("success");
		});
	    p.modified = new Date();

	    p.save(function(err) {
	      if (err)
	        console.log('error')
	      else
	        console.log('success')
	    });
	  }
	});
}

exports.smsFeed = function(req,res) {
	
	var feed = {
		events : [],
		users  : []
	};
	var users = [];
	
	//add date filter
	
	//find all records where boolean = 1 and date = today
	
	Event.find({ rush: true }, function (err, events) {
		if(err){
			console.log('error');
		}
		feed.events = events;
	  	
		User.find({phone : { $exists : true }}, function (err, userList) {
			if(err){
				console.log('error');
			}
		  	feed.users = userList;
		
			res.writeHead(200, {'Content-Type': 'application/javascript'});
			res.end(JSON.stringify(feed));
		});
	});
}


exports.fillData = function(req,res) {
	//get JSON data from WNET
	//var url = "http://173.203.29.228:8227/fo.php/iphone/wnetfeed";
	
	request('http://173.203.29.228:8227/fo.php/iphone/wnetfeed', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var jsonObj = JSON.parse(body);
		//console.log(jsonObj.events[1].id);
		for (var i = 0; i < jsonObj.events.length; i++) { 
		    // add jsonObj.events[i] as a new record to table
			//console.log(jsonObj.events[i].id);
			doFindOne(jsonObj.events, i);
			
			
		}
	  }
	});
function doFindOne(events, i) {
//	console.log(events[i].id);
	Wnet.findOne({ 'id' : events[i].id }, function (err, doc){
		if(doc == null){
			//create new record
			console.log("creating new record");
			var instance = new Wnet();
			instance.id = events[i].id;
			instance.name = events[i].name;
			instance.long_description = events[i].long_description;
		 	instance.short_description = events[i].short_description;
			instance.event_start_date = events[i].event_start_date;
			instance.event_end_date = events[i].event_end_date;
			instance.venue_id = events[i].venue_id;
			instance.vname = events[i].vname;
			instance.add1 = events[i].add1;
			instance.add2 = events[i].add2;
			instance.add3 = events[i].add3;
			instance.add_loc = events[i].add_loc;
			instance.city = events[i].city;
			instance.state = events[i].state;
			instance.zip = events[i].zip;
			instance.lattitude = events[i].lattitude;
			instance.longitude = events[i].longitude;
			instance.phone = events[i].phone;
			instance.locid = events[i].locid;
			instance.orgid = events[i].orgid;
			instance.adm = events[i].adm;
			instance.save(function (err) {
				if (!err) {
					console.log('Success!');
				} else {
					console.log('Save Failed.');
				}
			});
		} else {
			console.log("redundant");
			//search within doc to confirm no entries have been updated
		}
	}); 
}
	
	res.writeHead(200, {'Content-Type': 'application/javascript'});
	res.end("Running in background.");

}
