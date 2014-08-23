var moment = require('moment');

exports.Notif = function(title, body, account){
	this.title = title;
	this.body = body;
	this.summary = createSummary(body);
	//Account is an object with the following attributes: .name, .type, .profile
	this.account = account;
	this.viewed = false;
	this.timestamp = moment();
}

exports.Notif.prototype.setViewed = function(){
	this.viewed = true;
}

function createSummary(body){
	if(body.length>100){
		return body.substring(0,100)+'...';
	}else{
		return body;
	}
}