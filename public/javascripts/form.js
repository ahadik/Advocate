var Form = function(socket) {
	this.socket = socket;
}

Form.prototype.sendMessage = function(orgtype, organizationName, emailAddress, callback) {
	var message = {
		orgType : orgtype,
		orgName : organizationName,
		email : emailAddress
	};
	this.socket.emit('formSubmit', message);
	callback();
};

Form.prototype.updateProfile = function(interests, zip) {
	var data = {
		interests : interests,
		zipCode : zip
	};
	this.socket.emit('profileUpdate', data);
}

Form.prototype.updateProfileEntry = function(url){
	var data = {url : url};
	this.socket.emit('profilePhoto', data);
}