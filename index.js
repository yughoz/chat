var app 	= require('express')();
var server 	= require('http').Server(app);
var io 		= require('socket.io')(server);
var redis 	= require("redis"),
    client 	= redis.createClient();

server.listen(3000);
 

app.get('/', function (reqest, response) {
	response.sendFile(__dirname + '/index.html');
	// console.log('Test 123');
});


var chatcache = [];
var CID = 0;
client.hkeys("chatcache", function (err, replies) {
	CID = replies.length+1;
    console.log(replies.length + " replies:");
});


var allClients = [];
var allClientsuID = [];
	// var CID =  chatcache.length;
io.on('connection',function(socket){

	console.log(socket.handshake.query.name);
	const _id = socket.id;
  	console.log('Socket Connected: ' + _id);
  	var connectionParam = {
						  "_id"  : _id,
						  "action"  : "connect",
						  "name" : socket.handshake.query.name };
	
	var checkExist = allClientsuID.indexOf(socket.handshake.query.name);
  	console.log('checkExist: ' + checkExist);
	if (checkExist < 0) {
		allClients.push(connectionParam);
		allClientsuID.push(socket.handshake.query.name);
		io.emit('users.status',connectionParam);
	}


	socket.on('chat.message',function(message){
    	client 	= redis.createClient();
		console.log('Message : ');
		console.log(message);
		client.hset(["chatcache", CID,JSON.stringify(message)]);
		CID++;
		io.emit('chat.message',message);
    	client.quit();

	});
	socket.on('chat.init',function(init){
    	client 	= redis.createClient();
		client.hgetall("chatcache", function (err, obj) {
			chatcache = obj;
		    client.quit();
			param = {
				allClients : allClients,
				chatcache : chatcache,
			}
			io.emit('chat.init',param);
		});
	});


	socket.on('disconnect', () => {
		var disconnParam = {
						  "_id"  : _id,
						  "action"  : "disconnect",
						  "name" : socket.handshake.query.name };
		connectionParam = {
						  "_id"  : _id,
						  "action"  : "connect",
						  "name" : socket.handshake.query.name };
		var i = allClients.indexOf(connectionParam);
		allClients.splice(i, 1);
		var cAllClientsuID = allClientsuID.indexOf(socket.handshake.query.name);
		allClientsuID.splice(cAllClientsuID, 1);
		io.emit('users.status',disconnParam);
	    io.emit('myCustomEvent', {customEvent: 'Custom Message'})
	    console.log('Socket disconnected: ' + _id)
	  	console.log('allClientsuID disconnected: ');
	  	console.log(allClientsuID);
	  })
});
 