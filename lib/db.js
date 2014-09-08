var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt-nodejs');


exports.checkAuth = function(req, res, callback){
	if(req.user){
		MongoClient.connect(process.env.MONGOHQ_DB, function(err, db){
	
			var userID = exports.getUserID(req);
					
			var userData = db.collection('userData');
			userData.find({userID : userID}).toArray(function(err, users){
				if(!users){
					console.error("no users found for this ID!");
				}else if(users.length > 1){
					console.error("Multiple entries found for this ID!");
				}else{
					var orgs = db.collection('organizations');
					
					orgs.find({orgID : {$in : users[0].accounts}}).toArray(function(err, organizations){
						var user = {accounts : []};
						//build a hash of organization with key as id and value as organization object
						var orgHash = {};
						for(org in organizations){
							var idhash = bcrypt.hashSync(organizations[org].orgID);
							user.accounts.push({name : organizations[org].orgname, profile : organizations[org].profile, id : idhash});
							orgHash[organizations[org].orgID] = organizations[org];
						}
						
						if(users[0].active.type == 'personal'){
							//if the active account is personal, populate user object with data from personal account object
							console.log(users[0]);
							user['username'] = users[0].username;
							user['name'] = users[0].firstname+' '+users[0].lastname;
							user['profile'] = users[0].profile;
							user['active'] = users[0].active;
							user['notifs'] = users[0].notifs;
						}else if(users[0].active.type == 'org'){
							//if the active account is an org, populate the object with data from db request
							//we assume the active attribute has an id object for the organization account
							var org = orgHash[users[0].active.id];
							user['username'] = org.orgname;
							user['name'] = org.orgname;
							user['profile'] = org.profile;
							user['active'] = users[0].active;
							user['notifs'] = org.notifs;
						}
						
						
						callback(true, user);
					});
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

exports.getUser = function(req){
	if(req.user.twitter){
		return req.user.twitter;
	}else if(req.user.local){
		return req.user.local;
	}else{
		console.error("User not authenticated by local or Twitter strategy");
	}
}

exports.getUserID = function(user){
	if(user.twitter && user.twitter.id){
		return user.twitter.id;
	}else if(user.local && user.local.id){
		return user.local.id;
	}else{
		console.error("User not authenticated by local or Twitter strategy");
	}
}

//Generate an unique random id. Random permutations are created until one is made that does not collide with an existing ID in orgs
exports.makeid = function(ids){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@%^*()";
	//generate the 10 character text variable while the text variable is already included in the orgs hash. this prevents duplicates by chance
	do {
	    for( var i=0; i < 15; i++ ){
		    text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	}while(Object.prototype.hasOwnProperty.call(ids, text));

    return text;
}