var Form = function(socket) {
	this.socket = socket;
}

Form.prototype.sendMessage = function(orgtype, organizationName, emailAddress) {
	var message = {
		orgType : orgtype,
		orgName : organizationName,
		email : emailAddress
	};
	this.socket.emit('formSubmit', message);
};