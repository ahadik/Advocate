var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var Notif = require('../models/Notif');
var Event = require('../models/Event');
var dBase = require('../lib/db');

exports.newOrg = function(req, res, accountIDs, notifIDs, orgs, userData, notifs){
	var userID = req.user.userID;
	var accountID = dBase.makeid(accountIDs);
	var firstNotif = new Notif.Notif('Welcome to Advocate!', 'This is where you\'ll find updates.', {name : 'Advocate', type : 'advocate', profile : '/resources/logo_square_small.png'}, notifIDs);
	var orgInfo = {orgname: req.body.orgName, type: req.body.accountType, npo: req.body.registered, email: req.body.orgEmail, address : req.body.orgStreet, state : req.body.zipstate, city : req.body.zipcity, zip: req.body.orgZIP, latitude : req.body.latitude, longitude : req.body.longitude, phone: req.body.orgPhone, mission: req.body.orgMission, story: req.body.orgStory, profile : req.body.avatar_url, admins : [userID], orgID : accountID, notifs : [firstNotif.notifID]};
	
	notifs.insert(firstNotif, function(err,docs){
		if(err){return console.error(err);}	
	});
	
	orgs.insert(orgInfo, function(err, docs) {
		if (err){
			return console.error(err);
		}
		console.log('New organization submitted: ', req.body.orgName);
		
		var modifier = { $set: {} };
		modifier.$set['accounts.' + dBase.makeid(makeUniqueIDCheck(req.user.userData))] = accountID;
		
		userData.findAndModify(
			{userID : userID},
			[['_id', 'asc']],
			modifier,
			{},
			function(err, object){
				if(err){
					return console.warn(err.message);
				}else{
					res.redirect('/style');
				}
			}
		);
	});
}

exports.newEvent = function(req, res, events, userData){

	userData.find({userID : req.user.userID}).toArray(function(err, users){
		if(err){return console.error(err);}
		
		console.log(req.body);
		
		var newEvent = new Event.Event(req, users[0].accounts[users[0].active.id]);
		events.insert(newEvent, function(err, docs){
			if(err){return console.error(err);}
			res.redirect('/style');
		});
		
	});
}

exports.tempEvent = function(req, res, eventSubmit){
	
	eventSubmit.insert({
		eventName: req.body.eventName,
		eventTag: req.body.eventTag,
		orgName: req.body.orgName,
		email : req.body.eventEmail,
		volunNum: req.body.volunNum,
		date: req.body.eventDate,
		doing: req.body.eventDescription,
		bringing: req.body.eventToBring,
		type: req.body.eventType,
		street : req.body.eventStreet,
		latitude : req.body.latitude,
		longitude : req.body.longitude,
		ZIP : req.body.eventZIP,
		city : req.body.zipcity,
		state : req.body.zipstate,
		duration : req.body.eventDur,
		time : req.body.eventTime,
		
	}, function(err,docs){
		if(err){return console.error(err);}
	});
	
	res.redirect('/');
}

function getActiveID(req, userData){
	
}

function makeUniqueIDCheck(ids){
	var idHash = {};
	for(id in ids){
		idHash[ids[id]]=1;
	}
	return idHash;
}