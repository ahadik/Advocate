var dBase = require('../lib/db');

exports.Notif = function(title, body, account, notifs){
	this.notifID = dBase.makeid(notifs);
	this.account = {name : account.name, profile : account.profile};
	this.title = title;
	this.body = body;
	this.summary = createSummary(body);
	this.owner = account.id;
	//Account is an object with the following attributes: .name, .type, .profile
	this.viewed = false;
	this.timestamp = new Date;
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