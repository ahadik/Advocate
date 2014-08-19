var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;

exports.form = function(req, res){
	formServer.report(function(data){
		res.render('register', {user : req.user});
	})
};

exports.twitter = function(req, res){
	res.render('twitter', {user : req.user});
}

exports.setOrg = function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var collection = db.collection('organizations');
		collection.insert([{orgname: req.body.orgName, npo: req.body.registeredNPO, email: req.body.orgEmail, zip: req.body.zip, phone: req.body.telephone, mission: req.body.mission, story: req.body.story}], function(err, docs) {
			console.log("ORG HERE");
			if (err){
				return console.error(err);
			}
			console.log('New organization submitted: ', req.body.orgName);
		});
	});
}

//INPUT: A req from the POST request of the account creation form
//OUTPUT: Update the account field made by Passport to include other user information
exports.updateAccount = function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var accounts = db.collection('accounts');
		accounts.update(
			{username : req.body.username},
			{$set: {
				firstname : req.body.firstName,
				lastname : req.body.lastName,
				email : req.body.emailAddress,
				affiliates : req.body.affiliate,
				profile : '/resources/temp_profile.png',
				source : 'web',
				zipCode : '',
				interests : []
			} },
			{
				upsert : false
			}
		,function(err, docs){
			if(err){
				return console.error(err);
			}
			console.log("New account created: ", req.body.username);
		});
	});
}