// config/passport.js

// load all the things we need
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var ObjectID = require('mongodb').ObjectID;
var Notif = require('../models/Notif');
var LocalStrategy   = require('passport-local').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var accountCreate = require('../routes/register');
// load up the user model
var User       		= require('../models/user');
var geo = require('../lib/geo');
// load the auth variables
var configAuth = require('./auth');
var dBase = require('../lib/db');

function updateTwitter(profile, notifIDs, usersDB, userData, notifs, done){
	
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
	//we're going to update the account with the provided Twitter username with upsert set to true so that new users are created, and existing ones are updated with any new info from Twitter
	var location = profile._json.location.split(" ");
	var city = location[0].substring(0, location[0].length - 1);
	var state = location[1];
	
	geo.createLocationfromCityState(city, state, function(location){
		
		var data = {source : profile.provider, username : username, firstname : firstName, lastname : lastName, profile : profilePic, city : city, state : state, latitude : location.latitude, longitude : location.longitude, name : firstName+' '+lastName, id : profile._json.id_str};
		userData.find({userID: profile._json.id_str}).toArray(function(err, users) {
			//this user has logged in before
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
						source : profile.provider,
						done 	: true
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
						console.log("Account updated: ", firstName+" "+lastName+": "+username);
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
								var orgAccounts = Object.keys(account.accounts);
								var returnUser = {userID : account.userID, username : account.username, name : account.firstname+' '+account.lastname, profile : profile, active : account.active, accounts : orgAccounts};
								return done(null, returnUser);
							}
						});
					}
				);
			}else{
				accountCreate.updateAccount(data, notifIDs, usersDB, userData, notifs, function(createdUser){
					return done(null, createdUser);
				});
			}
		})
	});
}

// expose this function to our app using module.exports
module.exports = function(passport, orgs, notifIDs, usersDB, userData, notifs){

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL

    },
    function(token, tokenSecret, profile, done) {

        // make the code asynchronous
		// User.findOne won't fire until we have all our data back from Twitter
    	process.nextTick(function() {
			
	        User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
				
	       	 	// if there is an error, stop everything and return that
		        // ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found then log them in
	            if (user) {
	                updateTwitter(profile, notifIDs, usersDB, userData, notifs, done) // user found, return that user
	            } else {
	                // if there is no user, create them
	                var newUser = new User();
					// set all of the user data that we need
	                newUser.twitter.id          = profile.id;
	                newUser.twitter.token       = token;
	                newUser.twitter.username    = profile.username;
	                newUser.twitter.displayName = profile.displayName;
	                //newUser.twitter.done = false;

					// save our user into the database
	                newUser.save(function(err) {
	                    if (err){throw err;}
	                    updateTwitter(profile, notifIDs, usersDB, userData, notifs, done)
	                    
	                });
	            }
	        });
		});
    }));

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.username    = username;
                newUser.local.password = newUser.generateHash(password);
                newUser.local.id = dBase.makeid(orgs);
                //newUser.local.done = false;

				// save the user
                newUser.save(function(err) {
                    if (err){throw err;}
                    var data = {source : 'local', username : req.body.username, firstname : req.body.firstName, lastname : req.body.lastName, name : req.body.firstName+' '+req.body.lastName, emailAddress : req.body.emailAddress, affiliate : req.body.affiliate, done : false, id : newUser.local.id};
                                 
                    accountCreate.updateAccount(data, notifIDs, usersDB, userData, notifs, function(createdUser){
	                    return done(null, createdUser);
                    });
                });
            }

        });    

        });

    }));
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

			// if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
            	var userData = db.collection('userData');
	            var userID = dBase.getUserID(user);
				userData.find({userID : userID}).toArray(function(err, users){
					
					var orgAccounts = Object.keys(users[0].accounts);
					var returnUser = {userID : userID, username : users[0].username, name : users[0].firstname+' '+users[0].lastname, profile : users[0].profile, active : users[0].active, accounts : orgAccounts};
				
					return done(null, returnUser);
				});
            });
        });

    }));

};