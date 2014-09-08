var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var passportSocketIo = require("passport.socketio");

exports.listen = function(server, socketio, express, sessionstore, userData){
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
		handleFormBroadcasting(socket, userData);
	});
};

exports.report = function(reportResults){
	var results = handleFormRequest(reportResults);
	
}

//given a socket
function handleFormBroadcasting(socket, userData){
	//START HERE BY PREVENTING ORG UPLOAD FROM OVERWRITING USER UPLOADS
	socket.on('profilePhoto', function(data){			
		var accountUsername = socket.handshake.user.username;
		var activeObject = {name : socket.handshake.user.name, type : 'personal', id : socket.handshake.user.userID, profile : data.url};
		userData.update(
			{username : accountUsername},
			{$set: {
				profile : data.url,
				active : activeObject
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
}