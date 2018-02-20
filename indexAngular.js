var app 	= require('express')();
var server 	= require('http').Server(app);
var io 		= require('socket.io')(server);
var redis 	= require("redis"),
    client 	= redis.createClient({expire: 60 });
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var dbChat = "yuu_lte_db";
var tblChat = "chats_tb";

server.listen(3000); 



app.get('/', function (reqest, response) {
	response.sendFile(__dirname + '/index.html');
	// console.log('Test 123');
});

// sub.subscribe("chat")


var chatcache = [];
var CID = 0;

var allClients = [];
var allClientsuID = [];
	// var CID =  chatcache.length;
io.on('connection',function(socket){
	try{
		jsonparse = JSON.parse(socket.handshake.query.name);
	} catch (err) {
		jsonparse = [];
	    console.error('There was an error', err);
		socket.disconnect();		
	}
		console.log(socket.handshake.query.name);
		const _id = socket.id;
		const queryParam = jsonparse;
		// const queryParam = JSON.parse(socket.handshake.query.name);
		// const appName = queryParam.appName;
		// tblChat += "_"+appName;
		// console.log(queryParam.appName+"_"+tblChat);
	  	var connectionParam = {
				  "_id"  : _id,
				  "action"  : "connect",
				  "name" : queryParam.name };

		// console.log(connectionParam);

		client.hset([queryParam.appName+"_userOL", queryParam.name,JSON.stringify(connectionParam)], function(e, r){
			io.emit('users.status',connectionParam);
		})
	  	console.log('Socket Connected: ' + _id); 

		MongoClient.connect(url, function(err, db) {
		  if (err) {
		    console.error('There was an error', err);
		    return;
		  } else {
			  var dbo = db.db(dbChat);
			  dbo.createCollection(queryParam.appName+"_"+tblChat, function(err, res) {
			    if (err) throw err;
			    db.close();
			  });
		  }
		});
	// } catch (err) {
	//     console.error('There was an error', err);
	// 	socket.disconnect();		
	// }




	socket.on('chat.message',function(message){
		try {

			// console.log(message.message);

			MongoClient.connect(url, function(err, db) {
			  if (err) {
			    console.error('There was an error', err);
			    return;
			  } else {
				  var dbo = db.db(dbChat);
				  var myobj = { 
				  				username: message.username, 
				  				UID: message.UID ,
				  				idRand: message.idRand ,
				  				message: message.message ,
				  				time: timeNow() ,
				  				};
				  dbo.collection(queryParam.appName+"_"+tblChat).insertOne(myobj, function(err, res) {
				    if (err) {
						console.error('There was an error', err);
						return;
					} else {
					    // console.log("1 document inserted");
						io.emit('chat.message',myobj);
					    db.close();
					}
				  });
				}
			});
		} catch (err) {
		    console.error('There was an error', err);
			socket.disconnect();		
		}
	});




	socket.on('chat.init',function(init){
		try {

			// listChats(queryParam, timeNow());
			

			client.hgetall(queryParam.appName+"_userOL", function (err, obj) {
				// console.log(obj);
				io.emit('users.init',obj);
			});
		} catch (err) {
		    console.error('There was an error', err);
			socket.disconnect();		
		}


	});

	socket.on('chat.viewMore',function(param, callback){
		try {
			// console.log(param);
			MongoClient.connect(url, function(err, db) {
				if (err) {
					console.error('There was an error', err);
					return;
				} else {
			 		var dbo = db.db(dbChat);
					dbo.collection(queryParam.appName+"_"+tblChat).find({time: { $lt: param } }).sort({time : -1}).limit(10).toArray(function(err, result) {
						if (err) {
							console.error('There was an error', err);
							return;
						} else {
							// console.log(result);
							result = {
									allClients : allClients,
									time : param,
									chatcache : result,
								}
							db.close();
							callback(result);
						}
					});
				}
			});
		} catch (err) {
		    console.error('There was an error', err);
			socket.disconnect();		
		}
	});


	socket.on('disconnect',function(){
		try{
			var disconnParam = {
							  "_id"  : _id,
							  "action"  : "disconnect",
							  "name" : queryParam.name };

			console.log(disconnParam);
			console.log(socket.id);
			client.hdel([queryParam.appName+"_userOL", queryParam.name], function(e, r){
				io.emit('users.status',disconnParam);
			    io.emit('myCustomEvent', {customEvent: 'Custom Message'})
			})
		    console.log('Socket disconnected: ' + _id);

		} catch (err) {
		    console.error('There was an error', err);
		}
	  })
});


function timeNow(){
   return Math.floor(Date.now() / 1000);;
} 
/*function listChats(queryParam, timeStart , limit = 10){

   MongoClient.connect(url, function(err, db) {
	// console.log("listChats connect");
		if (err) {
			console.error('There was an error', err);
			return;
		} else {
		  var dbo = db.db(dbChat);
		  dbo.collection(queryParam.appName+"_"+tblChat).find({time: { $lt: timeStart } }).sort({time : -1}).limit(limit).toArray(function(err, result) {
		    if (err) {
				console.error('There was an error', err);
				return;
			} else {
			    param = {
						allClients : allClients,
						time : timeStart,
						chatcache : result,
					}
					io.emit('chat.init',param);
			    db.close();
			}
		    return param;
		  });
		}
	});

}*/