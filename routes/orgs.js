var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var Notif = require('../models/Notif');

exports.newOrg = function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var orgs = db.collection('organizations');
		
		var orgInfo = {orgname: req.body.orgName, npo: req.body.registered, email: req.body.orgEmail, zip: req.body.orgZIP, phone: req.body.orgPhone, mission: req.body.orgMission, story: req.body.orgStory, profile : req.body.avatar_url};
		
		var userID;
		if(req.user.source){
			userID = req.user.userID;
		}else{
			userID = req.user._id.toString();
		}
		
		orgInfo.admins = [userID];
		
		orgs.insert(orgInfo, function(err, docs) {
			if (err){
				return console.error(err);
			}
			console.log('New organization submitted: ', req.body.orgName);
			res.redirect('/style');
		});
		
	});
}