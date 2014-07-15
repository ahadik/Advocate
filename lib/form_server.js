var socketio = require('socket.io');
var io;
var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/advocate';
var port = process.env.PORT || 3000;
var client;

client = new pg.Client(connectionString);
client.connect();

exports.listen = function(server, entries){
	//piggyback new Socket.io server on HTTP server passed as function argument
	io = socketio.listen(server);
	
	io.set('log level', 1);
	//define how a new connection is handled
	io.sockets.on('connection', function(socket) {

		handleFormBroadcasting(socket, entries);

	});
};

//given a socket
function handleFormBroadcasting(socket, entries){
	//broadcast the message of the socket
	socket.on('formSubmit', function (message) {
		client.query('INSERT INTO registrations (orgtype, orgname, email) VALUES ($1, $2, $3)', [message.orgType, message.orgName, message.email]);
		//client.query('INSERT INTO registrations(orgtype) VALUES($1)', [message.orgType]);
		//client.query('INSERT INTO registrations(orgname) VALUES($1)', [message.orgName]);
		//client.query('INSERT INTO registrations(email) VALUES($1)', [message.email]);
		//to the room associated with the message and emit the message
		entries.push(message);
	});
}
