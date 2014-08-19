var express = require('express');
//var user = require('./routes/user');
var http = require('http');
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
var register = require('./routes/register');
var twitter = require('./routes/twitter');
var app = express();
var socketio = require('socket.io');
var flash    = require('connect-flash');
var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
  
twitter.twitter(passport, TwitterStrategy);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.logger('dev'));
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

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


// mongoose
mongoose.connect(process.env.MONGOHQ_DB);

app.set('photos', __dirname + '/public/photos');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', index.index);
app.get('/clear', function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var accounts = db.collection('accounts');
		accounts.remove({}, function(err, docs){});
	});
	res.redirect('/');
});
app.get('/submits', registrations.form);
app.get('/register', register.form);
app.get('/auth', register.twitter);
app.post('/register', function(req, res) {
	if(validateUsername(req.body.username)){
		Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
	        //if the post produces an error
	        if (err) {
	        	console.log('error');
	        	console.log(err);
	            return res.render('register', { account : account });
	        }
			//if no error - call the authenticate function of the passport
	        passport.authenticate('local')(req, res, function () {
	        	accountCreate.updateAccount(req, res);
	        	res.redirect('/profileComplete');
	        });
		});
	}else{
		console.log('error');
	    console.log('Username cannot start with @');
		return res.render('register', { account : account });
	}
});

app.get('/login', function(req, res){
	res.render('login', {user : req.user});
});

app.post('/login', passport.authenticate('local'), function(req, res) {
	
	res.redirect('/account');
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/account', account.accountView);

app.get('/profileComplete', account.accountComplete);

app.get('/sign_s3', upload.sign);

app.post('/submit_form', upload.submit_form);

app.get('/auth/twitter',
	passport.authenticate('twitter'),
	function(req, res){
		console.log("authenticated");
});

app.get('/auth/twitter/callback',
	passport.authenticate('twitter', {failureRedirect: '/login'}),
	function(req, res){
		
		res.redirect('/');
	});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var formServer = require('./lib/form_server');
formServer.listen(server, socketio, express, sessionStore);

function validateUsername(username){
	if(username.indexOf('@')==0){
		return false;
	}else{
		return true;
	}
}