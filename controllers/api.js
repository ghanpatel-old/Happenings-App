/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/

var Event = require('../models/event.js');
//var User = require('../models/user.js');

// get('/')
exports.blank = function(req,res){
	res.send("<p>Hi!</p>");
}


//post('/')
exports.add = function(req, res) {
//    new User({title: req.params.title, author: req.params.author}).save();
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
		    //what happens when this is successful?
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
	
	dateObj = new Date();
	todaysDate = dateObj.getDate();
	
	//find all records where boolean = 1 and date = today
	Event.find({ rush: true , date: todaysDate }, function (err, docs) {
	  	res.writeHead(200, {'Content-Type': 'application/javascript'});
		res.end(JSON.stringify(docs));
	});
	
}

exports.fillData = function(req,res) {
	//runOnce.fillData();
	
	dateObj = new Date();
	todaysDate = dateObj.getDate();

	new Event({
		name			: 'Jazz Event (test)', 
		genre			: 'jazz',
		description		: 'Jazz event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
		date			: todaysDate,
		rush			: true
	}).save();
	
	dateObj = dateObj.setDate(1);
	theDate = dateObj.getDate();
	
	new Event({
		name			: 'Dance Event (test)', 
		genre			: 'dance',
		description		: 'Dance event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
		date			: theDate,
		rush			: true
	}).save();
	
	new Event({
		name			: 'Dance Event 2 (test)', 
		genre			: 'dance',
		description		: 'Second dance event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
		date			: todaysDate,
		rush			: true
	}).save();

	new Event({
		name			: 'Jazz Event (test)', 
		genre			: 'jazz',
		description		: 'Jazz event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
		date			: theDate,
		rush			: true
	}).save();
	
	new Event({
		name			: 'Dance Event (test)', 
		genre			: 'dance',
		description		: 'Dance event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
		date			: theDate,
		rush			: false
	}).save();
	
	new Event({
		name			: 'Dance Event 2 (test)', 
		genre			: 'dance',
		description		: 'Second dance event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
		date			: todaysDate,
		rush			: false
	}).save();
	
	res.end("Success");
}
