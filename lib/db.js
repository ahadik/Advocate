var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var ObjectID = require('mongodb').ObjectID;


exports.checkAuth = function(req, res, callback){
	if(req.user){
		MongoClient.connect(process.env.MONGOHQ_DB, function(err, db){
	
			var userID;
			//if the source attribute exists, this is a twitter account with the userData object supplied as the header
			if(req.user.source){
				userID = req.user.userID;
			//otherwise it's a normal account
			}else{
				userID = req.user._id.toString();
			}
					
			var userData = db.collection('userData');
			userData.find({userID : userID}).toArray(function(err, users){
				if(!users){
					console.error("no users found for this ID!");
				}else if(users.length > 1){
					console.error("Multiple entries found for this ID!");
				}else{
				
					callback(true, users[0]);
				}
			});
		});
	}else{
		callback(false);
	}
}

function getUserData(req, res){
	if(req.user){
		MongoClient.connect(process.env.MONGOHQ_DB, function(err, db) {
			var userData = db.collection('userData');
			var userID;
			
			if(req.user.source){
				userID = req.user.userID;
			}else{
				userID = req.user._id.toString();
			}
			
			userData.find({userID: userID}).toArray(function(err, users) {
				//if there's no users, then something went wrong up above, so we return null resulting in a redirect to /login
				if( err || !users){
					console.log("No users found");
					return done(null, null);
					//if there's more than one user with this user name, we done fucked up somewhere and we return null again
					//really this should redirect the user to a warning and generate a log sent to our backend dashboard to look into the issue
				} else if(users.length > 1){
					console.log("Multiple users found - something's fucked up!");  
					return done(null, null);
					//if we've made it this far, all is good and we can log the account details and return the account object from the database
				} else{
					
				}
			});
		});
	}else{
		return false;
	}
}