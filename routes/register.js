var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var Notif = require('../models/Notif');
var dBase = require('../lib/db');

exports.form = function(req, res){
//	formServer.report(function(data){
		res.render('register', {user : req.user});
//	});
};

exports.twitter = function(req, res){
	res.render('twitter', {user : req.user});
}

//INPUT: A req from the POST request of the account creation form
//OUTPUT: Update the account field made by Passport to include other user information
exports.updateAccount = function(data, notifIDs, users, userData, notifs, callback){
	//instantiate userID to undefined
	var userID;
	var key = data.source+".username";
	var findObject = {};
	findObject[key] = data.username;
	
	users.find(findObject).toArray(function(err,docs){
		if (err){
			return console.error(err);
		}else{
			if(docs.length > 1){
				return console.error('More than one user returned for username: '+data.username);
			}else if(docs.length == 0){
				return console.error('No users returned for username: '+data.username);
			}else{
				//set the userID to the object ID of the passport created account
				if(docs[0].twitter){
					userID = docs[0].twitter.id;
				}else if(docs[0].local){
					userID = docs[0].local.id;
				}else{
					console.error("User not authenticated by local or Twitter strategy");
				}
				
				var firstNotif = new Notif.Notif('Welcome to Advocate!', 'This is where you\'ll find updates.', {name : 'Advocate', type : 'advocate', profile : '/resources/logo_square_small.png', id:data.id}, notifIDs);
				
				notifs.insert(firstNotif,function(err, docs){
					if(err){
						return console.error(err);
					}
				});
				
				var city = null;
				var state = null;
				var latitude = null;
				var longitude = null;
				var profile = '/resources/temp_profile.png';
				
				if(data.city){
					city = data.city;
				}
				if(data.state){
					state = data.state;
				}
				if(data.latitude){
					latitude = data.latitude;
				}
				if(data.longitude){
					longitude = data.longitude;
				}
				if(data.profile){
					profile = data.profile;
				}
				
				userData.insert(
					{
						userID : userID,
						username : data.username,
						firstname : data.firstname,
						lastname : data.lastname,
						email : data.emailAddress,
						affiliates : [data.affiliate],
						profile : profile,
						source : data.source,
						city : city,
						state : state,
						latitude : latitude,
						longitute : longitude,
						interests : [],
						accounts : {},
						active : {name : data.name, type : data.source, id : userID, profile : profile},
						done : false
					},function(err, docs){
						if(err){
							return console.error(err);
						}
						console.log("New account created: ", data.username);
						
						var returnUser = {userID : userID, username : data.username, name : data.firstname+' '+data.lastname, profile : profile, active : {name : data.username, type : data.source, id : userID}, accounts : []};
						
						callback(returnUser);
					}
				);
			}
		}
		//Now use the found userID to create a document in userData including the object ID as the userID
		if(!userID){
			console.error('A userID was not returned from the Passport accounts collection so a userData document was not created for '+req.body.username);
		}
	});
}