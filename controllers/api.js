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

exports.fillData = function(req,res) {
	//runOnce.fillData();

	new Event({
		name			: 'Jazz Event (test)', 
		genre			: 'jazz',
		description		: 'Jazz event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
	}).save();
	
	new Event({
		name			: 'Dance Event (test)', 
		genre			: 'dance',
		description		: 'Dance event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
	}).save();
	
	new Event({
		name			: 'Dance Event 2 (test)', 
		genre			: 'dance',
		description		: 'Second dance event',
		ticketURL		: 'http://bam.org/',
		URL				: 'http://bam.org',
	}).save();
}
