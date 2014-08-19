var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , ObjectID = require('mongodb').ObjectID;

exports.accountView = function(req, res){
	renderProfilePages('account', req, res);
}

exports.accountComplete = function(req, res){
	MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
		var systemData = db.collection('systemData');
		
		systemData.find({_id : ObjectID("53f13064b5a39cc69f00011b")}).toArray(function(err, data) {
			
			var interests = data[0]["interests"];  
			var options = {};
			options["interests"] = interests;
			renderProfilePages('profile_complete', req, res, options);
		});
	});
	
}

function renderProfilePages(page, req, res, options){
	if(req.user){
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
					var data = {username : account.username, firstName : account.firstname, lastName : account.lastname, profile : account.profile, email : account.email, zipCode : "", interests : []};
					//when you start - figure out how to loop through an object and add each element of the object to the data object
					
					for(var option in options){
						data[option] = options[option];
					}
					
					res.render(page, data);
				}
			});
		});
	}else{
		res.redirect('/login');
	}
}