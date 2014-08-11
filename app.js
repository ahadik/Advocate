var express = require('express');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var routes = require('./routes');
var registrations = require('./routes/registrations');
var accountCreate = require('./routes/register');
var index = require('./routes/index');
var register = require('./routes/register');
var app = express();
var socketio = require('socket.io');
var flash    = require('connect-flash');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
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
app.get('/submits', registrations.form);
app.get('/register', register.form);
app.post('/register', function(req, res) {
	console.log('Registration submitted');
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        //if the post produces an error
        if (err) {
        	console.log('error');
        	console.log(err);
            return res.render('register', { account : account });
        }
		//if no error - call the authenticate function of the passport
        passport.authenticate('local')(req, res, function () {
        	accountCreate.setOrg(req, res);
        	res.redirect('/');
        });
	});
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var formServer = require('./lib/form_server');
formServer.listen(server, socketio);