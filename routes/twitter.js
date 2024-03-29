var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var ObjectID = require('mongodb').ObjectID;
var Notif = require('../models/Notif');

var geo = require('../lib/geo');

var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;



/*THIS FUNCTION IS WAY TOO COMPLEX AND SHOULD BE VASTLY SIMPLIFIED TO SPEED UP TWITTER LOGIN*/

exports.twitter = function(passport, TwitterStrategy, userData){

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});
	
	passport.deserializeUser(function(obj, done) {
	  done(null, obj);
	});
	
	passport.use(new TwitterStrategy({
	    consumerKey: TWITTER_CONSUMER_KEY,
	    consumerSecret: TWITTER_CONSUMER_SECRET,
	    callbackURL: process.env.INSTANCE_HOST+"/auth/twitter/callback"
	},
	//This here is the callback function indicating successfull communication and verification with Twitter
	function(token, tokenSecret, profile, done) {
		// asynchronous verification, for effect...
		//recall that this bumps execution down to the next iteration of the loop
		process.nextTick(function () {
			//lets extract some info from the profile
			var nameSplit = profile.displayName.split(" ");
			var lastName = nameSplit.slice(1).join(" ");
			var firstName = nameSplit[0];
			var username = profile.username;
			//we need to remove the final index of '_normal' from the image to get the full size image from the smaller image provided in the profile
			var profilePic = profile.photos[0].value;
			var suffixIndex = profilePic.lastIndexOf("_normal");
			profilePic = profilePic.slice(0,suffixIndex)+profilePic.slice(suffixIndex+7);
			//instantiate an empty variable to fill later
			var account;
			//we've logged in with Twitter, but we want to store the credentials in our own databse for new users, OR update the existing document if this user has logged in with Twitter before
			var location = profile._json.location.split(" ");
			var city = location[0].substring(0, location[0].length - 1);
			var state = location[1];
			
			geo.createLocationfromCityState(city, state, function(location){
				
				userData.find({userID: profile._json.id_str}).toArray(function(err, users) {
					if(users.length){
						
						userData.update(
							{userID : profile._json.id_str},
							{$set: {
								username : username,
								firstname : firstName,
								lastname : lastName,
								profile : profilePic,
								city : city,
								state : state,
								latitude : location.latitude,
								longitude : location.longitude,
								source : profile.provider
							} },
							{
								upsert : true
							},
							//as part of our call back we're going to do some error checking and then return the user object newly created/updated
							function(err, docs){
								if(err){
									return console.error(err);
								}
								//Log this action
								console.log("Account created/updated: ", firstName+" "+lastName+": "+username);
								//retrieve the newly updated account
								userData.find({username: username}).toArray(function(err, users) {
									//if there's no users, then something went wrong up above, so we return null resulting in a redirect to /login
									if( err || !users){
										console.log("No users found");
										return done(null, null);
										//if there's more than one user with this user name, we done fucked up somewhere and we return null again
										//really this should redirect the user to a warning and generate a log sent to our backend dashboard to look into the issue
									} else if(users.length != 1){
										console.log("Multiple users found - something's fucked up!");  
										return done(null, null);
										//if we've made it this far, all is good and we can log the account details and return the account object from the database
									} else{
										account = users[0];  
										console.log("ACCOUNT: "+JSON.stringify(account));
										return done(null, account);
									}
								});
							}
						);
					}else{
						var firstNotif = new Notif.Notif('Welcome to Advocate!', 'This is where you\'ll find updates.', {name : 'Advocate', type : 'advocate', profile : '/resources/logo_square_small.png'});
						userData.update(
							{userID : profile._json.id_str},
							{$set: {
								username : username,
								firstname : firstName,
								lastname : lastName,
								profile : profilePic,
								city : city,
								state : state,
								latitude : location.latitude,
								longitude : location.longitude,
								source : profile.provider,
								interests : [],
								accounts : [],
								email : '',
								affiliates : '',
								active : {name : username, type : 'personal'},
								notifs : [firstNotif]
							} },
							{
								upsert : true
							},
							//as part of our call back we're going to do some error checking and then return the user object newly created/updated
							function(err, docs){
								if(err){
									return console.error(err);
								}
								//Log this action
								console.log("Account created/updated: ", firstName+" "+lastName+": "+username);
								//retrieve the newly updated account
								userData.find({username: username}).toArray(function(err, users) {
									//if there's no users, then something went wrong up above, so we return null resulting in a redirect to /login
									if( err || !users){
										console.log("No users found");
										return done(null, null);
										//if there's more than one user with this user name, we done fucked up somewhere and we return null again
										//really this should redirect the user to a warning and generate a log sent to our backend dashboard to look into the issue
									} else if(users.length != 1){
										console.log("Multiple users found - something's fucked up!");  
										return done(null, null);
										//if we've made it this far, all is good and we can log the account details and return the account object from the database
									} else{
										account = users[0];  
										console.log("ACCOUNT: "+JSON.stringify(account));
										return done(null, account);
									}
								});
							}
						);
					}
				})
			});
		});
	}));
}
