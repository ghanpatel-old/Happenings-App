/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/

var Thread = require('../models/thread.js');
var Post = require('../models/post.js');
var User = require('../models/user.js')

exports.post = function(req, res) {
    new Thread({title: req.body.title, author: req.body.author}).save();
}

exports.list = function(req, res) {
  User.find(function(err, docs) {
    res.send(docs);
  });
}

exports.add = function(req, res) {
    new User({title: req.params.title, author: req.params.author}).save();
}

exports.userId = function(req, res) {
	title = req.params.title;
	var JSONuserList = {elements:[]};
	User.find({'title':title}, function(err, docs){
		if(!err){
			docs.forEach(function(element, index, array){
				JSONuserList.elements[index] = element;
			});
		}
		res.send(JSONuserList);	
	});
	
}

exports.usersAll = function(req, res) {
	
	var sendData;
	var JSONuserList = {'elements':[]};
	
	User.find(function (err, docs) {
		// docs.forEach
		if(!err) {
			docs.forEach(function(element, index, array){
				JSONuserList.elements[index] = element;
			});
		}
		console.log(JSONuserList);
		sendData = JSONuserList;
		res.send(sendData);
	});	
}

exports.test = function(req,res){
	var JSONuserList = 
	{
	}
}

exports.blank = function(req,res){
	res.send("<p>Hi!</p>");
}

// first locates a thread by title, then locates the replies by thread ID.
exports.show = (function(req, res) {
    Thread.findOne({title: req.params.title}, function(error, thread) {
        var posts = Post.find({thread: thread._id}, function(error, posts) {
          res.send([{thread: thread, posts: posts}]);
        });
    })
});