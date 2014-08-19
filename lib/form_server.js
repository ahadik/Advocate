// npm install mongodb
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var passportSocketIo = require("passport.socketio");

exports.listen = function(server, socketio, express, sessionstore){
	//piggyback new Socket.io server on HTTP server passed as function argument
	
	io = socketio.listen(server);
	
	io.set('log level', 1);
	
	io.set('authorization', passportSocketIo.authorize({
		cookieParser: express.cookieParser,
		key:         'connect.sid',       // the name of the cookie where express/connect stores its session_id
		secret:      'in service of what?',    // the session_secret to parse the cookie
		store:       sessionstore,        // we NEED to use a sessionstore. no memorystore please
		success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
		fail:        onAuthorizeFail,     // *optional* callback on fail/error - read more below
	}));
	
	function onAuthorizeSuccess(data, accept){
	  console.log('successful connection to socket.io');
	
	  // The accept-callback still allows us to decide whether to
	  // accept the connection or not.
	  accept(null, true);
	}
	
	function onAuthorizeFail(data, message, error, accept){
	  if(error)
	    throw new Error(message);
	  console.log('failed connection to socket.io:', message);
	
	  // We use this callback to log all of our failed connections.
	  accept(null, false);
	}
	
	//define how a new connection is handled
	io.sockets.on('connection', function(socket) {
		handleFormBroadcasting(socket);
	});
};

exports.report = function(reportResults){
	var results = handleFormRequest(reportResults);
	
}

//given a socket
function handleFormBroadcasting(socket){
	//broadcast the message of the socket
	socket.on('formSubmit', function (message) {
		//console.log(process.env.MONGOHQ_DB);
		MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
			var collection = db.collection('registrations');
			collection.insert([{orgtype: message.orgType, orgname: message.orgName, email: message.email}], function(err, docs) {
				if (err){
					return console.error(err);
				}
				console.log('New entry submitted: ', message.orgType, message.orgName, message.email);
			});
		});
	});
	
	socket.on('profileUpdate', function(data){
		MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		
			 console.log("USERNAME: "+socket.handshake.user.username);
			 console.log("DATA: "+JSON.stringify(data));
		
			var accounts = db.collection('accounts');
			accounts.update(
				{username : socket.handshake.user.username},
				{$set: {
					zipCode : data.zipCode,
					interests : data.interests
				} },
				{
					upsert : false
				}
			,function(err, docs){
				if(err){
					return console.error(err);
				}
				console.log("Profile updated: ", socket.handshake.user);
				socket.emit('saveStatus', {result : true});
			});
		});
	});
	
	socket.on('profilePhoto', function(data){
		MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		
			var accounts = db.collection('accounts');
			accounts.update(
				{username : socket.handshake.user.username},
				{$set: {
					profile : data.url
				} },
				{
					upsert : false
				}
			,function(err, docs){
				if(err){
					return console.error(err);
				}
			});
		});
	});
}

function handleFormRequest(reportResults){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var collection = db.collection('registrations');
		collection.find({}).toArray(function(err,docs){
			if (err){
				return console.error(err);
			}
			reportResults(docs);
		});
	});
}