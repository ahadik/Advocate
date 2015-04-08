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
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

//import event file for EarthDay beta
var signup = require('./lib/signup');
var event = require('./routes/event');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var transporter = nodemailer.createTransport(smtpTransport({
	host : 'gmail.com',
	port : 25,
	
}))

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'alex@getadvocate.co',
        pass: 'Vt33qqYxjExTmz'
    }
});

var accountIDs = {};
var notifIDs = {};

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

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
	
	//ServeRI EarthDay Code
	
	app.get('/earthday', function(req, res){
		event.signup(req,res);
	});
	
	app.get('/event_confirm', function(req, res){
		event.resend(req, res, transporter);
	});
	
	app.post('/earthday', function(req, res){
		event.submit(req,res, transporter);
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
			index.index(req, res);
		}
	});
	
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
