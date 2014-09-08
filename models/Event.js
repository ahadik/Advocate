var dBase = require('../lib/db');
var EventDate = require('../models/EventDate');

exports.Event = function(req, id){
	var formBody = req.body;
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
	this.dates = generateDates(formBody.selectedDates, formBody);
	this.cover = formBody.avatar_url;
	this.org = id;
}

function generateDates(dateString, formBody){
	var dates = dateString.split("+");
	var dateArray = [];
	for(date in dates){
		//Tue Sep 09 2014 00:00:00 GMT-0400 (EDT)
		var dateObj = new Date(dates[date]);
		var dateString = dateObj.toDateString().split(" ").join(',');
		//makes strings kind of like 'Tue,Sep,09,2014,start' which are then used to get the start and end times from formBody
		var startTime = formBody[dateString+',start'];
		var endTime = formBody[dateString+',end'];
		var timePair = {start : startTime, end : endTime, volunteers : []};
		var eventDate = new EventDate.EventDate([timePair], dateObj);
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