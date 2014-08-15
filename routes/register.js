var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;

exports.form = function(req, res){
	formServer.report(function(data){
		res.render('register', {});
	})
};

exports.twitter = function(req, res){
	res.render('twitter', {});
}

exports.setOrg = function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var collection = db.collection('organizations');
		collection.insert([{orgname: req.body.orgName, npo: req.body.registeredNPO, email: req.body.orgEmail, zip: req.body.zip, phone: req.body.telephone, mission: req.body.mission, story: req.body.story}], function(err, docs) {
			if (err){
				return console.error(err);
			}
			console.log('New organization submitted: ', req.body.orgName);
		});
	});
}