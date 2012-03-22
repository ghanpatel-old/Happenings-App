var http = require('http'),  
io = require('socket.io');

server = http.createServer(function(req, res){ 
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    res.end();
});
server.listen(8181);

// socket.io 
var socket = io.listen(server); 

socket.on('connection', function(client){ 

function getMessages() {

    http.get({ host: '173.203.29.228:8227', port: 8888, path: '/fo.php/iphone/wnetfeed' },   function(response) {

        var data = "";
        response.on('data', function(chunk) {
            data += chunk;
        });

        response.on('end', function() {

            socket.broadcast(JSON.parse(data));
            console.log(data);
            //socket.broadcast('{ "alrt": "YES", "message": "Something is wrong!" }');
            //socket.broadcast('hi');
        });

    });

}

setInterval(getMessages, 1000);

client.on('message', function(){})
client.on('disconnect', function(){}); 

});