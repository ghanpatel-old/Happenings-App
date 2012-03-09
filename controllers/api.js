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
	
	Event.find({id : {$gte : 17186 } }, function(err,docs){
		if(!err) {
			docs.forEach(function(element, index, array){
				JSONuserList.elements[index] = element;
			});
		}
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
	
	
	/*
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
	*/
}
/*
//get('/updateData')
exports.updateData = function(req,res){
	var JSONuserList = {'elements':[]};
	
	//find all docs in WNET that have start date after jan 2012 and !enddate before April
	Wnet.find({id : {$gte : 17186 } }, function(err,docs){
		if(!err) {
			docs.forEach(function(element, index, array){
				//JSONuserList.elements[index] = element;
				Event.findOne({ _id : docs.index }, function(error, event){
					if(docs == null){
						//add element to Event table
						// regex --> /2012/
					}
				});
				
			});
		}
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
}
*/

//get('/event/:id')

exports.getEvent = function(req,res){
	var JSONuserList = {};
	
	Event.findOne({_id:req.params.id}, function(err,doc){
		JSONuserList = doc;
		console.log(doc);
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
	
	/*
	Event.findOne({_id: req.params.id}, function(err, doc){
		JSONuserList = doc;
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
	*/
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

//post('/fave/:id?=tag')
exports.setFave = function(req,res) {
	//add session.user's email to event's rushlist
	var submit = { "value" : "" };
	console.log(req.session.user);
	console.log(req.params.id);
	
	User.findOne({ 'fbtoken': req.session.user }, function (err, doc) {
		console.log(doc);
		if(err){
			submit.value = "error";
			console.log("err on find()");
		}
		if(doc == null){ //doesn't have it
			submit.value = "can't Find";
			console.log(submit);	
		} else { //found record
			console.log("found record");
			var userEmail = doc.mail;
			console.log(userEmail);
			//find Event by req.params.id, add userEmail to rushList[] array
			
		}
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(submit));
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

// ============= ADMIN and HELPER REQUESTS ============ //

exports.fillData = function(req,res) {
	//get JSON data from WNET
	//var url = "http://173.203.29.228:8227/fo.php/iphone/wnetfeed";
	console.log("fillData launch");
	request('http://173.203.29.228:8227/fo.php/iphone/wnetfeed', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var jsonObj = JSON.parse(body);
		//console.log(jsonObj.events[1].id);
		jsonObj.events.forEach(function(element, index, array){
				//print event_start_date to event_end_date
				//print Name
				//print vname
				var target = new Date();
				with(target)
				  {
				    //setMonth(getMonth());
				    //setDate(1);
				  }
				//console.log(target);
				var docStartDate = new Date(element.event_start_date);
				var docEndDate = new Date(element.event_end_date);
				
				if (docEndDate > target){
					console.log(element.id);
					addToEvents(element);
				}
		});
	  }
	});
	res.send("Running in Background");
}



function addToEvents(element) {
//	console.log(events[i].id);
	//add each event to Event record. Check whether exists first.
	Event.findOne({ 'id' : element.id }, function (err, doc){
		if(doc == null){
			//create new record
			console.log("creating new record for id " + element.id);
			var instance = new Event();
			instance.id = element.id;
			instance.name = element.name;
			instance.long_description = element.long_description;
		 	instance.short_description = element.short_description;
			instance.event_start_date = element.event_start_date;
			instance.event_end_date = element.event_end_date;
			instance.venueId = element.venue_id;
			instance.orgid = element.orgid;
			instance.adm = element.adm;
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
	
//app.get('/viewEvents');	
exports.viewEvents = function(req,res) {
	console.log('in function');
	
	var monthNames = [ "January", "February", "March", "April", "May", "June",
	    "July", "August", "September", "October", "November", "December" ];
	
	var writeString = "<h1>Events in WNET Feed</h1><ul>";

	var query = Event.find({});
		query.sort('event_start_date', -1);
		//query.limit(5);
		query.exec(function (err, docs) {
	 		if(!err) {	
				console.log('found docs');
				docs.forEach(function(element, index, array){
					//print event_start_date to event_end_date
					//print Name
					//print vname
					var target = new Date();
					with(target)
					  {
					    //setMonth(getMonth());
					    //setDate(1);
					  }
					//console.log(target);
					var docStartDate = new Date(element.event_start_date);
					var docEndDate = new Date(element.event_end_date);
					
					if(docEndDate.getMonth()){
						var docEndDateAsString = monthNames[docEndDate.getMonth()] + " " + docEndDate.getDate() + ", " + docEndDate.getFullYear();
						} else {
							docEndDateAsString = "Ongoing"
						}
					
					writeString = writeString + "<li>From: <strong>" + monthNames[docStartDate.getMonth()] + " " + docStartDate.getDate() + ", " + docStartDate.getFullYear() + "</strong> to " + docEndDateAsString + ". <br />" +
								  "Event Name: " + element.name + ". <br />" + ". </li>"; 
					//print city
					//print short description
					//print a href="/sendSMS/?event="+docs.id
				});
				res.writeHead(200, {'Content-Type': 'html'});
				res.end(writeString + "</ul>");
			} else {
				console.log('error');
			}
		});
}

//app.get('/killData/')
exports.killData = function(req,res){
	//present an alert to confirm
	
	//remove all records from Wnet
	Wnet.find({}, function(err,docs){
		if (err){
			console.log(err);
		}
	  	if (!docs || !Array.isArray(docs) || docs.length === 0){
			console.log('no docs found');
		} 
		docs.forEach( function (doc) {
			doc.remove();
			console.log("doc removed");
		});
	});
	
	//remove all records from Event
	Event.find({}, function(err,docs){
		if (err){
			console.log(err);
		}
	  	if (!docs || !Array.isArray(docs) || docs.length === 0){
			console.log('no docs found');
		} 
		docs.forEach( function (doc) {
			doc.remove();
			console.log("doc removed");
		});
	});	
	
	res.send("Processing");
	
}

