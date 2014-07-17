var socketio = require('socket.io');
var io;
var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/advocate';
var port = process.env.PORT || 3000;
var client;

exports.listen = function(server){
	client = new pg.Client(connectionString);
	client.connect();
	//piggyback new Socket.io server on HTTP server passed as function argument
	io = socketio.listen(server);
	
	io.set('log level', 1);
	//define how a new connection is handled
	io.sockets.on('connection', function(socket) {

		handleFormBroadcasting(socket);

	});
};

exports.report = function(reportResults){
	client = new pg.Client(connectionString);
	client.connect();
	var results = handleFormRequest(reportResults);
}

//given a socket
function handleFormBroadcasting(socket){
	//broadcast the message of the socket
	socket.on('formSubmit', function (message) {
		client.query('INSERT INTO registrations (orgtype, orgname, email) VALUES ($1, $2, $3)', [message.orgType, message.orgName, message.email]);
	});
}

function handleFormRequest(reportResults){
	var query = client.query('SELECT orgtype, orgname, email FROM registrations', []);
	var response = [];
	query.on('row', function(row) {
		response.push(row);
	});
	
	query.on('end', function() {
		client.end();
		reportResults(response);
	});
}