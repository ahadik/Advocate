var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
//var routes = require('./routes');
var registrations = require('./routes/registrations');
var accountCreate = require('./routes/register');
var upload = require('./routes/upload');
var account = require('./routes/account');
var index = require('./routes/index');
//import event file for EarthDay beta
var event = require('./routes/event')
var orgs = require('./routes/orgs');
var register = require('./routes/register');
var twitter = require('./routes/twitter');
var geo = require('./lib/geo.js');
var socketio = require('socket.io');
var flash    = require('connect-flash');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var ObjectID = require('mongodb').ObjectID;
var dbase = require('./lib/db');
var signup = require('./lib/signup');


twitter.twitter(passport, TwitterStrategy);

var accountIDs = {};
var notifIDs = {};

MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
	if(err){return console.error(err);}
	var organizations = db.collection('organizations');
	var userData = db.collection('userData');
	var systemData = db.collection('systemData');
	var notifs = db.collection('notifs');
	var events = db.collection('events');
	var users = db.collection('users');
	var eventSubmit = db.collection('eventSubmit');

	organizations.find({}).toArray(function(err, orgs){
		for(org in orgs){
			accountIDs[orgs[org].orgID] = 1;
		}
	});

	notifs.find({}).toArray(function(err, notifs){
		for(notif in notifs){
			notifIDs[notifs[notif].notifID] = 1;
		}
	});

	var app = express();

	// all environments
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.use(express.static(__dirname + '/public'));
	app.set('view engine', 'ejs');

	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('chip chocolate chip'));
	app.use(express.session({
			secret : 'in service of what?',
			store : sessionStore
		}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash()); // use connect-flash for flash messages stored in session
	app.use(app.router);
	app.use(express.static(path.join(__dirname, '')));
	app.use(express.favicon());
	app.use(express.errorHandler());


	// mongoose
	mongoose.connect(process.env.MONGOHQ_DB);

	require('./config/passport')(passport, accountIDs, notifIDs, users, userData, notifs); // pass passport for configuration

	app.set('photos', __dirname + '/public/photos');

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
	
	//ServeRI EarthDay Code
	
	app.get('/earthday', function(req, res){
		event.signup(req,res);
	});
	
	app.get('/makegroups', function(req,res){
		var groups = [{
			name: "The Musketeers",
			members: 1
		},
		{
			name: "Providence Baptist Church",
			members: 12
		},
		{
			name: "Pawtucket Baptist Church",
			members: 16
		},
		{
			name: "Barrington Boy Scout Troop",
			members: 9
		},
		{
			name: "Troop 328",
			members: 16
		},
		{
			name: "Troop 21 Warren",
			members: 18
		},
		{
			name: "Brown University Alpha Beta Pi Fraternity",
			members: 7
		},
		{
			name: "RISD Service Club",
			members: 9
		}];
		
		for (var i=0; i<groups.length; i++){
			signup.addGroup(groups[i]);
		}
		
		res.redirect('/earthday');
		
	});
	
	app.get('/groups.js', function(req,res){
		res.setHeader('Content-Type', 'application/json');
		signup.Group.find({}, function(err, groups){
			res.end(JSON.stringify(groups));
		});
	});
	
	//END SERVERI CODE

	app.get('/', function(req, res){
		if(req.isAuthenticated()){
			account.marketview(req, res, userData, events, organizations, notifs);	
		}else{
			index.index(req, res, userData, organizations, notifs);
		}
	});
	
	app.get('/marketplace', function(req,res){
		account.marketview(req, res, userData, events, organizations, notifs);
	});
	
	
	app.get("/event/*", function(req,res){
		//if(req.isAuthenticated()){
			account.renderEvent(req, res, userData, organizations, notifs, events);
		//}else{
			//res.redirect('/login?redirect='+require('url').parse(req.url, true).pathname.substring(1));
			//res.redirect('/');
		//}
	});
	
	app.get("/volunteer", function(req,res){
		if(req.isAuthenticated()){
			account.volunteerEvent(req, res, userData, events, organizations, notifs);
		}else{
			res.redirect('/');
		}
	});

	app.get('/style', function(req, res){
		if(req.isAuthenticated()){
			console.log(req.user);
			account.renderProfilePages('generic', req, res, {auth : true}, userData, organizations, notifs);
		}else{
			res.render('generic', {auth : false});
		}
	});

	app.get('/clear', function(req, res){
		var users = db.collection('users');
		users.remove({}, function(err, docs){});
		userData.remove({}, function(err, docs){});
		notifs.remove({}, function(err, docs){});
		res.redirect('/');
	});
	app.get('/submits', registrations.form);
	app.get('/register', function(req, res){
		if(req.isAuthenticated()){
			res.redirect('/');
		}else{
			res.render('register', {auth: false});
		}
	});
	app.get('/auth', register.twitter);

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/profileComplete', // redirect to the secure profile section
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.post('/complete', function(req, res){
		if(err){console.log(err);}
		
		var accountUsername = req.user.username;
		//If the zipcode field has a value, then the city, state, lat and long need to be recomputed and updated in the database
		if(req.body.zipCode != 'ZIP Code'){
			userData.update(
				{username : accountUsername},
				{$set: {
					city : req.body.city,
					state : req.body.state,
					latitude : req.body.latitude,
					longitude : req.body.longitude,
					interests : req.body.interest,
					done : true
				} },
				{
					upsert : true
				}
			,function(err, docs){
				if(err){
					console.log("There was an error.");
					return console.error(err);
				}
				console.log("Profile updated: ", accountUsername);
			});
			userData.find({username : accountUsername}).toArray(function(err, users){
				console.log("Account creation complete. Rendering account page");
				res.redirect('/');
			});
		//otherwise, only the interests section needs to be updated
		}else{
			userData.update(
				{username : accountUsername},
				{$set: {
					interests : req.body.interest,
					done : true
				}},
				{
					upsert : true
				}
			,function(err, docs){
				if(err){
					return console.error(err);
				}
				console.log("Profile updated: ", accountUsername);
			});
			userData.find({username : accountUsername}).toArray(function(err, users){
				res.redirect('/');
			});
		}
	});

	app.get('/login', function(req, res){
		if(req.isAuthenticated()){
			res.redirect('/');
		}else{
			res.render('login', {auth: false});
		}
	});


	app.post('/login', function(req,res, next){
		passport.authenticate('local-login', function(err, user, info){
			if (err){return next(err);}
			if(!user){return res.redirect('/login');}
			req.logIn(user, function(err){
				if(err){return next(err);}
				var parsedQuery = require('url').parse(req.headers.referer, true);
				if(parsedQuery.query.redirect){
					return res.redirect('/'+parsedQuery.query.redirect);
				}else{
					return res.redirect('/');
				}

			});
		})(req,res,next);
	});

//exports.updateAccount = function(data, notifIDs, callback, users, accountData, notifs){

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/account', function(req, res){
		account.accountView(req, res, userData, notifs);
	});

	app.get('/switch', function(req,res){
		account.switchAccounts(req, res, userData, organizations);
	});

	app.get('/newOrganization', function(req, res){
		account.createOrg(req, res, userData, organizations, notifs);
	});

	app.get('/newEvent', function(req, res){
		account.createEvent(req, res, systemData, userData, organizations, notifs);
	});

	app.get('/profileComplete', function(req, res){
		account.accountComplete(req, res, systemData, userData, organizations, notifs);
	});

	app.get('/organize', function(req, res){
		account.eventView(req, res, userData, notifs, events, organizations);
	});

	app.get('/sign_s3', function(req,res){
		upload.sign(req, res, process.env.S3_PROFILE_BUCKET)
	});

	app.get('/sign_orglogo', function(req, res){
		upload.sign(req, res, process.env.S3_ORG_BUCKET)
	});

	app.get('/sign_eventcover', function(req, res){
		upload.sign(req, res, process.env.S3_EVENT_BUCKET)
	});

	app.post('/submit_form', upload.submit_form);

	app.post('/newOrganization', function(req,res){
		orgs.newOrg(req,res, accountIDs, notifIDs, organizations, userData, notifs);
	});

	app.post('/newEvent', function(req, res){
		orgs.newEvent(req, res, events, userData);
	});

	app.get('/auth/twitter', passport.authenticate('twitter'));
	
	app.get('/twitter_done', function(req, res){
		
	});

	// handle the callback after twitter has authenticated the user
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/marketplace',
			failureRedirect : '/login'
		})
	);

	//TEMP EVENT CREATE FORM
	/*
	app.post('/create', function(req, res){
		orgs.tempEvent(req, res, eventSubmit);
	});

	app.get('/create', function(req, res){
		res.render('event_temp', {auth : false});
	});
*/
	/*-----------------------DON'T GO BELOW THIS--------------------*/

	app.use(function(req, res, next){
		if(req.isAuthenticated()){
			account.renderProfilePages('404', req, res, {auth : true}, userData, organizations, notifs);
		}else{
			res.render('404', {auth : false});
		}
	});

	var server = http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});

	var formServer = require('./lib/form_server');
	formServer.listen(server, socketio, express, sessionStore, userData);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function validateUsername(username){
	if(username.indexOf('@')==0){
		return false;
	}else{
		return true;
	}
}
