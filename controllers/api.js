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
var Org = require('../models/organization.js');
var Category = require('../models/category.js');

var request = require('request');
var async = require('async');

// get('/')
exports.blank = function(req,res){
	//res.render('/app/views/index.html');
	res.send("<p>Hi!</p>");
}

// ======= USER LOGIN ======== //

exports.setLogin = function (req,res) {
		var submit = { "value" : "", "email": ""};
			
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
				submit.email = docs.mail;
				console.log(submit);
				res.writeHead(200, {'Content-Type': 'application/javascript'});
				res.end(JSON.stringify(submit));
			}
		});
}

//get(/login/)
exports.sendLogin = function (req,res) {
	var submit = {"token" : req.session.user, "email": ""};
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
		console.log('sent events');
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
				JSONevent.sessuser = sessuser;
				console.log(JSONevent.sessuser);
			}
			
			console.log(JSONevent);
			res.writeHead(200, {'Content-Type': 'application/javascript'});
			res.end(JSON.stringify(JSONevent));
		});
	});

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

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}


//post('/fave/:id?=tag')
exports.setFave = function(req,res) {
	//add event id to user's rushlist
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
			console.log("found record, adding event id: " + req.params.id);
			//check if id already exists in rushList array
			if (containsObject(req.params.id,doc.rushList)){
				submit.value = "already";
				console.log(doc.mail + " already fave for "+ req.params.id);				
			} else {
				doc.rushList.push(req.params.id);
				doc.save();
				submit.value = "added";
				console.log(doc.mail + " added to event "+ req.params.id);	
			}
			console.log(submit);
			res.writeHead(200, {'Content-Type': 'application/javascript'});
			res.end(JSON.stringify(submit));
			//console.log(userEmail);
			//find Event by req.params.id, add userEmail to rushList[] array
			/*
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
			*/
		}
	});
}

// ============ VENUE HANDLERS ============ //

// get /venue/
exports.venuesAll = function(req,res){
	var JSONuserList = {'elements':[]};
	
	Venue.find({}, function(err,docs){
		if(!err) {
			docs.forEach(function(element, index, array){
				JSONuserList.elements[index] = element;
			});
		}
		console.log('sent venues');
		res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(JSONuserList));
	});
}

// get /venue/:id
exports.getVenue = function(req,res){
	var JSONevent = {'elements': '', 'sessuser': ''};
	
	Venue.findOne({venue_id : req.params.id}, function(err,doc){
		if (err){
			console.log(err);
		} else {
		JSONevent.elements = doc;
		
		//add session user's email to the JSON feed. Used by Fave button.	
		User.findOne({ 'fbtoken': req.session.user }, function (err, sessuser) {
			console.log(sessuser);
			if(err){
				console.log("err on find()");
			}
			if(sessuser != null){ //found it
				JSONevent.sessuser = sessuser;
			}
			
			console.log(JSONevent);
			res.writeHead(200, {'Content-Type': 'application/javascript'});
			res.end(JSON.stringify(JSONevent));
		});
		}
	});
}

// post /venue/:id
exports.setVenueInfo = function(req,res){
	
}




// ============ SMS HANDLERS ============ //


//app.post('/set-rush/', api.setRush);
exports.setRush = function(req, res) {
	console.log("setting rush for id: " + req.body.id);
	var submit;
	Event.findOne({ 'id' : req.body.id }, function (err, doc){
		if(err){
			submit = 'error';
		}
		if(doc != null){
			if(doc.rush){
				doc.rush = false;
			} else {
				doc.rush = true;
			}
			doc.save(function (err) {
				if (!err) {
					console.log("rush set to:" + doc.rush);
					submit = 'success';
				} else {
					console.log('Save Failed.');
					submit = 'failed';
				}
				console.log(submit);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end(submit);
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

// ============= ADMIN and HELPER REQUESTS ============ //

exports.fillData = function() {
	console.log("fillData launch");
	request('http://173.203.29.228:8227/fo.php/iphone/wnetfeed', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var jsonObj = JSON.parse(body);
	
		//fill events
		jsonObj.events.forEach(function(element, index, array){
			var target = new Date();
			var docStartDate = new Date(element.event_start_date);
			var docEndDate = new Date(element.event_end_date);
			
			//if end date is not in the past, add to Event table 
			if (docEndDate > target){
				console.log("Checking event: " + element.id);
				addToEvents(element);
			}				
		});
	
		//fill venue
		jsonObj.venues.forEach(function(venueData, index, array){
			console.log("checking venue: "+ venueData.venue_id);
			addToVenue(venueData);
		});
		
		//fill orgs
		jsonObj.organizations.forEach(function(element, index, array){
			console.log("checking organization: "+ element.org_id);
			addToOrg(element);
		});
	  }
	});
}

exports.fillDataTwo = function() {
	console.log("fillDataTwo launch");
	request('http://173.203.29.228:8227/fo.php/iphone/wnetfeed', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var jsonObj = JSON.parse(body);
	
		//fill event times
		jsonObj.eventoccurences.forEach(function(element, index, array){
			Event.findOne({ 'id' : element.id.toString() }, function (err, doc){
				if(err){
					console.log("Error: " + err);
				}
				if(doc == null){
					console.log("Event doesn't exist for eventoccurence ");
				} else {
					if(!doc.event_time || doc.event_time == null){
						doc.event_time = element.start.toString();
						console.log(doc.event_time);
						doc.save(function (err) {
							if (!err) {
								console.log('Success!');
							} else {
								console.log('Save Failed.');
							}
						});
					} else {
						console.log("time already filled for " + doc.id);
					}
				}
			});
		});
		
		//fill cat_ids
		jsonObj.eventcategories.forEach(function(element, index, array){
			Event.findOne({ 'id' : element.ev_id.toString() }, function (err, doc){
				if(err){
					console.log("Error: " + err);
				}
				if(doc == null){
					console.log("Event doesn't exist for event-category ");
				} else {
					if(!doc.cat_id || doc.cat_id == null){
						doc.cat_id = element.cat_id.toString();
						console.log(doc.cat_id);
						doc.save(function (err) {
							if (!err) {
								console.log('Success!');
							} else {
								console.log('Save Failed.');
							}
						});
					} else {
						console.log("category already filled for " + doc.id);
					}
				}
			});
		});
	  }
	});
}

exports.fillDataThree = function() {
	console.log("fillDataThree launch");
	
	//add cat info to all
	Event.find({},function(err,all){
		all.forEach(function(element,index,array){
			if(!element.cat_id || element.cat_id == null){
				console.log("no cat_id for event " + element.id);
			} else {
				Category.findOne({"id" : element.cat_id}, function(err,doc){
					if(err){
						console.log("Error: " + err);
					}
					if(doc == null){
						console.log("Category id doesn't exist in category table");
					} else {
						element.category = doc.name.toString();
						element.save(function (err) {
							if (!err) {
								console.log('Success!');
							} else {
								console.log('Save Failed.');
							}
						});
					}
				});
			}
		});
	});	  
}

function addToEvents(element) {
	Event.findOne({ 'id' : element.id.toString() }, function (err, doc){
		if(err){
			console.log("Error: " + err);
		}
		if(doc == null){
			//create new record
			console.log("creating new event record for id " + element.id);
			var instance = new Event();
			instance.id = element.id.toString();
			instance.name = element.name.toString();
			instance.long_description = element.long_description.toString();
		 	instance.short_description = element.short_description.toString();
			instance.event_start_date = element.event_start_date.toString();
			instance.event_end_date = element.event_end_date.toString();
			instance.venueId = element.venue_id.toString();
			instance.vname = element.vname;
			instance.orgid = element.orgid.toString();
			instance.adm = element.adm.toString();
			instance.rush = false;
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

function addToVenue(element){
	console.log("checking venue table");
	Venue.findOne({'venue_id': element.venue_id.toString()}, function(err,doc){
	//If it isn't create a new record with the event's venue info
		if(doc == null){
			console.log('creating new venue record for ' + element.name);
			var instance = new Venue();
			instance.venue_id = element.venue_id.toString();
			instance.name = element.name;
			instance.description = element.description;
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
			instance.org_id	= element.org_id + "";
			instance.borough_id	= element.borough_id.toString();
			instance.neighborhood_id = element.neighborhood_id.toString();
			instance.neighborhood_name = element.neighborhood_name;
			instance.borough_name = element.borough_name;
			instance.save(function (err) {
				if (!err) {
					console.log('Success! Saved venue:' + instance.name);
				} else {
					console.log('Save Failed.');
				}
			});
		} else {
			console.log("venue redundant");
			//search within doc to confirm no entries have been updated
		}	
	});
}

function addToOrg(element){
	console.log("checking venue table");
	Org.findOne({'org_id': element.org_id.toString()}, function(err,doc){
	//If it isn't create a new record with the event's venue info
		if(doc == null){
			console.log('creating new org record for ' + element.name);
			var instance = new Org();
			instance.org_id = element.org_id.toString();
			instance.name = element.name;
			instance.short_description = element.short_description;
			instance.long_description = element.long_description;
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
			instance.web = element.web;
			instance.borough_id	= element.borough_id.toString();
			instance.neighborhood_id = element.neighborhood_id.toString();
			instance.neighborhood_name = element.neighborhood_name;
			instance.borough_name = element.borough_name;
			instance.save(function (err) {
				if (!err) {
					console.log('Success! Saved Organization:' + instance.name);
				} else {
					console.log('Save Failed.');
				}
			});
		} else {
			console.log("Org redundant");
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


exports.fillCategories = function() {
	console.log("fillCategory launch");
	request('http://173.203.29.228:8227/fo.php/iphone/categoryDump', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var jsonObj = JSON.parse(body);
	
		//fill events
		jsonObj.forEach(function(element, index, array){
			console.log("id: " + element.id);
			var instance = new Category();
			instance.id = element.id.toString();
			instance.name = element.name;
			instance.description = element.description;
		 	instance.for_orgs = element.for_orgs;
			instance.for_venues = element.for_venues;
			instance.for_events = element.for_events;
			instance.is_featured = element.is_featured;
			instance.parent_category_id = element.parent_category_id;
			console.log("about to save id " + instance.id);
			instance.save(function (err) {
				if (!err) {
					console.log('Success!');
				} else {
					console.log('Save Failed.');
				}
			  });		
		});
	  }
	});
}

