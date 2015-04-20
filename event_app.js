var express = require('express');
var app = express();
var http = require('http').Server(app);
//var https = require('https');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;
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
var io = require('socket.io')(http);
var flash    = require('connect-flash');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var dbase = require('./lib/db');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var json2csv = require('json2csv');
var jsonexport = require('jsonexport');

//import event file for EarthDay beta
var signup = require('./lib/signup');
var eventIndex = require('./lib/event');
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
        user: 'volunteer@serverhodeisland.org',
        pass: 'service655!'
    }
});

var accountIDs = {};
var notifIDs = {};

//Store an array of groups in memory to be updated whenever a new group is added.
var mem_groups = false;

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

//add function to String prototype to convert any string to Object ID
String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

function getGroups(callback){
	signup.Group.find({}, function(err, groups){
		if(err){
			//if something goes wrong, set groups to false to indicate it isn't an accurate count.
			callback(false);
		}else{
			callback(groups);
		}
	});
}

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

app.get('/event_add', function(req,res){
	res.setHeader('Content-Type', 'text/html');
	event.create_event(req,res);
});

app.get('/event/view', function(req, res){
	event.view(req, res);
});

app.get('/event_confirm', function(req, res){
	event.resend(req, res, transporter);
});



app.post('/earthday', function(req, res){
	
	var event_id;
	eventIndex.Event.find({name : 'Earth Day'}, function(err, events){
		if(err || events.length != 1){
			console.log('Error finding specific event!');
			res.end();
		}else{
			event_id = events[0].volunteerID;
			event.submit(req,res, transporter, event_id);
			signup.Group.find({}, function(err, groups){
				if(err){
					//if something goes wrong, set groups to false to indicate it isn't an accurate count.
					mem_groups = false;
				}else{
					mem_groups = groups;
				}
			});
		}
	});
	
});

app.post('/event/view', function(req, res){
	event.view(req,res);
});

app.get('/event/checkin', function(req,res){
	if (mem_groups!=false){
		event.checkin(req,res, mem_groups);
	}else{
		getGroups(function(retrieved_groups){
			mem_groups = retrieved_groups;
			event.checkin(req,res, retrieved_groups);
		});		
	}
	
});

app.get('/update_volunteers', function(req, res){
	signup.Volunteer.update({},{eventID : req.query.id, status : 0}, {multi: true}, function(err, numberAffected){
		res.end('Affected: '+numberAffected);
	});
});


app.get('/groups.js', function(req,res){
	res.setHeader('Content-Type', 'application/json');
	if(mem_groups != false){
		res.end(JSON.stringify(mem_groups));
	}else{
		getGroups(function(retrieved_groups){
			mem_groups = retrieved_groups;
			if(!mem_groups){
				res.end();
			}else{
				res.end(JSON.stringify(mem_groups));
			}
		});
	}	
});

function getVolunteers(req, fail, succeed){
	if(req.query.id == null){
		res.end();
	}else{
		eventIndex.Event.find({"_id": req.query.id.toObjectId()}, function(err, event){
			if(err || (event.length == 0)){
				fail();
				return false;
			}else{
				signup.Volunteer.find({eventID : event[0].volunteerID}).sort({firstName : 1}).exec(function(err, volunteers){
					if(err){
						return false;
					}else{
						succeed(volunteers);
						return true;
					}
				});
				
			}
		});
	}
}

app.get('/volunteers.js', function(req, res){
	getVolunteers(req, function(){
		console.log('error retrieving requested event: '+req.query.id);
		res.setHeader('Content-Type', 'text/html');
		res.end('Error retrieving requested event!');
	}, function(volunteers){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(volunteers));
	});
});

app.get('/event/export', function(req,res){

	getVolunteers(req, function(){
		console.log('error retrieving requested event: '+req.query.id);
		res.setHeader('Content-Type', 'text/html');
		res.end('Error retrieving requested event!');
	}, function(volunteers){
		res.setHeader('Content-disposition', 'attachment; filename=volunteers.csv');
	    res.writeHead(200, {
	        'Content-Type': 'text/csv'
	    });

	    
	    json2csv({data: volunteers, fields: ['firstname', 'lastname', 'group', 'email', 'phone', 'address', 'zip', 'age', 'accommodations', 'accommodatation_details', 'guard_name', 'guard_email']}, function(err, csv) {
		  if (err) console.log(err);
		  console.log(csv);
		  res.end(csv);
		});
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

http.listen(app.get('port'), function(){
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
