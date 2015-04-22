var signup = require('./signup');

exports.listen = function(server, socketio, express){
	//piggyback new Socket.io server on HTTP server passed as function argument
	
	io = socketio.listen(server);
	
	io.set('log level', 1);
	
	//define how a new connection is handled
	io.sockets.on('connection', function(socket) {
		handleCheckinBroadcasting(socket);
	});
};

//given a socket
function handleCheckinBroadcasting(socket){
	socket.on('swipe', function(data){
		var status = parseInt(data.status);
		var uniqueid = data.uniqueid;
		
		if(isNaN(status)){
			console.log('Error: Invalid status ('+status+') provided for user with ID: '+uniqueid);
			socket.emit('invalid_status', data);
			return false;
		}
		
		if((status > 3) || (status < 0)){
			console.log('Error: Invalid status ('+status+') provided for user with ID: '+uniqueid);
			socket.emit('invalid_status', data);
			return false;
		}
		
		signup.Volunteer.find({_id : uniqueid.toObjectId()}, function(err, doc){
			var volunteer = doc[0];
			if(err){
				console.log('Error retrieving from database: '+uniqueid);
				socket.emit('db_error', data);
				return false;
			}
			if(volunteer == null){
				console.log('Error finding volunteer with ID: '+uniqueid);
				socket.emit('null_id', {uniqueid : uniqueid});
				return false;
			}
			volunteer.status = status;
			//check what kind of status this is, and update the volunteer log accordingly
			if(status == 0){
				//this should really never happen - status should always be 1 or 2
				//0 indicates reset of volunteer
				volunteer.time_in = [];
				volunteer.time_out = [];
			}else if(status == 1){
				//the user has just been checked in
				var date = new Date();
				volunteer.time_in = volunteer.time_in.push(date);
			}else if(status == 2){
				//the user has just been checked out
				var date = new Date();
				volunteer.time_out = volunteer.time_out.push(date);
			}else{
				//this need to throw an error
				console.log('Status of ('+status+') failed error checking and matching! Review file \'lib/checkin_server.js\', function handleCheckinBroadcasting()');
				return false;
			}
			volunteer.save();
			socket.emit('swipe_success', data);
			socket.broadcast.emit('swipe_update', data);
			return true;
		});
	});
}