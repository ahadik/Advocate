var dBase = require('../lib/db');
var EventDate = require('../models/EventDate');

exports.Event = function(req, id){
	var formBody = req.body;
	var datesObject = JSON.parse(formBody.dateData);
	
	console.log("here");
	console.log(datesObject);
	console.log(JSON.stringify(datesObject));
	
	this.title = formBody.eventTitle;
	this.tagline = formBody.eventTagLine;
	this.doWhat = formBody.eventDescription;
	this.bringWhat = formBody.eventToBring;
	this.type = formBody.eventType;
	this.street = formBody.eventStreet;
	this.city = formBody.zipcity;
	this.state = formBody.zipstate;
	this.zip = formBody.eventZIP;
	this.latitude = formBody.latitude;
	this.longitude = formBody.longitude;
	this.dates = generateDates(datesObject, formBody.numVolun);
	this.cover = formBody.avatar_url;
	this.org = id;
	this.id = makeid();
}

function generateDates(datesObject, numVolun){
	var dateArray = [];
	for(date in datesObject){
		//Tue Sep 09 2014 00:00:00 GMT-0400 (EDT)
		var dateObj = new Date(date);
		var timePairs = [];
		for(pair in datesObject[date]){
			var timePair = {start : datesObject[date][pair][0], end : datesObject[date][pair][1], volunteers : [], maxVolunteers : numVolun};
			timePairs.push(timePair);
		}
		var eventDate = new EventDate.EventDate(timePairs, dateObj);
		dateArray.push(eventDate);
	}
	return dateArray;
}

function getActiveID(req, userData){
	userData.find({userID : req.user.userID}).toArray(function(err, users){
		if(err){return console.error(err);}
		
		console.log(users[0].account[users[0].active.id]);
		
		return users[0].account[users[0].active.id];
	});
}


//Generate an unique random id. Random permutations are created until one is made that does not collide with an existing ID in orgs
function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	//generate the 10 character text variable while the text variable is already included in the orgs hash. this prevents duplicates by chance

    for( var i=0; i < 15; i++ ){
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}