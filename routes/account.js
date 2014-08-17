var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;

exports.accountView = function(req, res){
	renderProfilePages('account', req, res);
}

exports.accountComplete = function(req, res){
	renderProfilePages('profile_complete', req, res);
}

function renderProfilePages(page, req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var accounts = db.collection('accounts');
		accounts.find({username: req.user.username}).toArray(function(err, users) {
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
				var account = users[0];  
				res.render(page, {username : account.username, firstName : account.firstname, lastName : account.lastname, profile : account.profile, email : account.email});
			}
		});
	});
}