/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/

var Event = require('../models/event.js');
var User = require('../models/user.js');
var Wnet = require('../models/wnet.js');
var Venue = require('../models/venue.js');

var request = require('request');

// get('/')
exports.blank = function(req,res){
	//res.render('/app/views/index.html');
	res.send("<p>Hi!</p>");
}

// ======= USER LOGIN ======== //

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

// ===== EVENTS ===== //

//get('/event/')
exports.eventsAll = function(req,res){
	var JSONuserList = {'elements':[]};
	
	Event.find({}, function(err,docs){
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
	var JSONevent = {'elements': '', 'sessuser': ''};
	
	Event.findOne({id : req.params.id}, function(err,doc){
		JSONevent.elements = doc;
		
		//add session user's email to the JSON feed. Used by Fave button.
		User.findOne({ 'fbtoken': req.session.user }, function (err, sessuser) {
			console.log(sessuser);
			if(err){
				submit.value = "error";
				console.log("err on find()");
			}
			if(sessuser != null){ //found it
				JSONevent.sessuser = sessuser.mail;
				console.log(JSONevent.sessuser);
			}
			
			console.log(JSONevent);
			res.writeHead(200, {'Content-Type': 'application/javascript'});
			res.end(JSON.stringify(JSONevent));
		});
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
		Event.update({ id : req.params.id},{ $addToSet : { tags : req.body.tag }}, function(name) {
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
	var emailExists = false;
	console.log(req.session.user);
	console.log(req.params.id);
	
	User.findOne({ 'fbtoken': req.session.user }, function (err, doc) {
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
			Event.findOne({ 'id' : req.params.id }, function (err, doc){
				console.log(req.params.id);
				//if rushList[] doesn't contain userEmail, add it
				if(doc.rushList){
					doc.rushList.forEach(function(element, index, array){
						if(element == userEmail){
							//add it
							emailExists = true;
						}
					});
					if(!emailExists){
						doc.rushList.push(userEmail);
						doc.save();
						submit.value = "added";
						console.log("added user id:" + doc.id + " to rush list: " + doc.rushList);
						console.log(doc.rushList);
					} else {
						submit.value = "already";
						console.log("Already in there: " + doc.rushList);
					}
				} else {
					doc.rushList[0] = userEmail;
					doc.save();
					submit.value = "added";
					console.log("added user id:" + doc.id + " to rush list: " + doc.rushList);
					console.log(doc.rushList);
				}
				console.log(submit);
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.end(JSON.stringify(submit));
			});
		}
	});
}

// ============ SMS HANDLERS ============ //


//app.post('/set-rush/', api.setRush);
exports.setRush = function(req, res) {
	console.log("setting rush for id: " + req.params.id);
	var submit = { "value" : "" };
	Event.findOne({ 'id' : req.params.id }, function (err, doc){
		if(err){
			submit.value = 'error';
		}
		if(doc != null){
			if(doc.rush){
				doc.rush = false;
			} else {
				doc.rush = true;
			}
			submit.value = 'success';
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
				
				//if end date is not in the past, add to Event table 
				if (docEndDate > target){
					console.log(element.id);
					Event.findOne({ 'id' : element.id }, function (err, doc){
						if(doc == null){
							//create new record
							console.log("creating new event record for id " + element.id);
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
							//instance.venueId = element.vname;
							instance.save(function (err) {
								if (!err) {
									console.log('Success!');
								} else {
									console.log('Save Failed.');
								}
							});
						} else {
							console.log("event redundant");
							//search within doc to confirm no entries have been updated
						}
					});
				}				
		});
	  }
	});	
	//convert event.venueId from vname to _id
	
	res.send("Running in Background");
}

/*
Venue.findOne({'name': element.vname}, function(err1,venDoc){
	//If it isn't create a new record with the event's venue info
	if(venDoc == null){
		console.log('creating new venue record for ' + element.vname);
		var instance = new Venue();
		instance.name = element.vname;
		instance.add1 =	element.add1;
		instance.add2 = element.add2;
		instance.add3 = element.add3;
		instance.add_loc = element.add_loc;
		instance.city = element.city;
		instance.state = element.state;
		instance.zip = element.zip;
		instance.lattitude = element.lattitude;
		instance.longitude = element.longitude;
		instance.phone = element.phone;
		instance.save(function (err) {
			if (!err1) {
				console.log('Success!');
			} else {
				console.log('Save Failed.');
			}
		});
	} else {
		console.log("venue redundant");
		//search within doc to confirm no entries have been updated
	}	
});
*/


function addToVenue(element){
	//check if element.vname is in Venue table. 
	
}


function addToEvents(element) {
//	console.log(events[i].id);
	//add each event to Event record. Check whether exists first.
	
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
	
	
	//remove all records from Venue
	/*
	Venue.find({}, function(err,docs){
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
	*/
	
	res.send("Processing");
	
}

