var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var Notif = require('../models/Notif');

exports.form = function(req, res){
	formServer.report(function(data){
		res.render('register', {user : req.user});
	})
};

exports.twitter = function(req, res){
	res.render('twitter', {user : req.user});
}

//INPUT: A req from the POST request of the account creation form
//OUTPUT: Update the account field made by Passport to include other user information
exports.updateAccount = function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		//instantiate userID to undefined
		var userID;
		
		var accounts = db.collection('accounts');
		accounts.find({username : req.body.username}).toArray(function(err,docs){
			if (err){
				return console.error(err);
			}else{
				if(docs.length > 1){
					return console.error('More than one user returned for username: '+req.body.username);
				}else if(docs.length == 0){
					return console.error('No users returned for username: '+req.body.username);
				}else{
					//set the userID to the object ID of the passport created account
					userID = docs[0]._id;
					
					
					var accountData = db.collection('userData');
					var firstNotif = new Notif.Notif('Welcome to Advocate!', 'This is where you\'ll find updates.', {name : 'Advocate', type : 'advocate', profile : '/resources/logo_square_small.png'});
					accountData.insert(
						{
							userID : userID.toString(),
							username : req.body.username,
							firstname : req.body.firstName,
							lastname : req.body.lastName,
							email : req.body.emailAddress,
							affiliates : req.body.affiliate,
							profile : '/resources/temp_profile.png',
							source : 'web',
							city : null,
							state : null,
							latitude : null,
							longitute : null,
							interests : [],
							accounts : [],
							active : {name : req.body.username, type : 'personal'},
							notifs : [firstNotif]
						},function(err, docs){
							if(err){
								return console.error(err);
							}
							console.log("New account created: ", req.body.username);
						}
					);
				}
			}
			//Now use the found userID to create a document in userData including the object ID as the userID
			if(!userID){
				console.error('A userID was not returned from the Passport accounts collection so a userData document was not created for '+req.body.username);
			}
		});
	});
}