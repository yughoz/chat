var app 	= require('express')();
var server 	= require('http').Server(app);
var io 		= require('socket.io')(server);
var redis 	= require("redis"),
    client 	= redis.createClient();

server.listen(3000);
 

var store = redis.createClient()
var pub = redis.createClient()
var sub = redis.createClient()

app.get('/', function (reqest, response) {
	response.sendFile(__dirname + '/index.html');
	// console.log('Test 123');
});

sub.subscribe("chat")


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




	socket.on('chat.message',function(message){
    	// client 	= redis.createClient();
		// console.log('Message : ');
		console.log(message);
		console.log(message.message);
		console.log(socket.id);
    	client.incr("messageNextId", function(e, id){
			client.hset(["chatcache", id,JSON.stringify(message)], function(e, r){
				io.emit('chat.message',message);
			})
	    })
		// CID++;
    	// client.quit();

    	/*store.incr("messageNextId", function(e, id){
	      store.hmset("messages:" + id, { uid: socket.id, text: message.message }, function(e, r){
	        pub.publish("chat", "messages:" + id)
	      })
	    })*/

	});




	socket.on('chat.init',function(init){
    	// client 	= redis.createClient();
		client.hgetall("chatcache", function (err, obj) {
			chatcache = obj;
		    // client.quit();
			param = {
				allClients : allClients,
				chatcache : chatcache,
			}
			io.emit('chat.init',param);
		});

	  	var connectionParam = {
						  "_id"  : _id,
						  "action"  : "connect",
						  "name" : socket.handshake.query.name };
	
		client.hgetall("userOL", function (err, obj) {
			io.emit('users.init',obj);
		});
		client.hset(["userOL", socket.handshake.query.name,JSON.stringify(connectionParam)], function(e, r){
			io.emit('users.status',connectionParam);
		})
		/*store.hgetall(key, function(e, obj){
	      socket.send(obj.uid + ": " + obj.text)
	    })*/
	});


	socket.on('disconnect', () => {
		var disconnParam = {
						  "_id"  : _id,
						  "action"  : "disconnect",
						  "name" : socket.handshake.query.name };

		client.hdel(["userOL", socket.handshake.query.name], function(e, r){
	    	console.log('HDEL: ' + _id)
			io.emit('users.status',disconnParam);
		    io.emit('myCustomEvent', {customEvent: 'Custom Message'})
		})
	    console.log('Socket disconnected: ' + _id)
	  })
});
 