var socketio = require('socket.io');
var io;

// npm install mongodb
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;

exports.listen = function(server){
	//piggyback new Socket.io server on HTTP server passed as function argument
	io = socketio.listen(server);
	
	io.set('log level', 1);
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
		console.log(process.env.MONGOHQ_DB);
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