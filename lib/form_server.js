var socketio = require('socket.io');
var io;


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
		//to the room associated with the message and emit the message
		entries.push(message);
	});
}
