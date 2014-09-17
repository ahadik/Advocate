var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , ObjectID = require('mongodb').ObjectID;
var dBase = require('../lib/db');

exports.accountView = function(req, res, userData, organizations, notifs){
	renderFullAccounts('account', req, res, {}, userData, organizations, notifs);
}

exports.marketview = function(req, res, userData, events, organizations, notifs){
	
	events.find({}).toArray(function(err, events){
		if(err){return console.error(err);}
		var eventOption = [];
		for(event in events){
			var eventObject = {};
			eventObject['title'] = events[event].title;
			eventObject['description'] = events[event].doWhat;
			eventObject['city'] = events[event].city;
			eventObject['state'] = events[event].state;
			eventObject['cover'] = events[event].cover;
			eventObject['id'] = events[event].id;
			eventObject['dates'] = {};
			eventObject['openings'] = 0;
			eventObject['volunteered']=0;
			
			for(date in events[event].dates){
				
				var dateArray = events[event].dates[date].date.toDateString().split(" ");
				//if the month has already been added
				if(eventObject.dates[dateArray[1]]){
					eventObject.dates[dateArray[1]].days.push(dateArray[2]);
				}else{
					//if the month hasn't been added yet
					eventObject.dates[dateArray[1]] = {days : [dateArray[2]]};
				}
				for(slot in events[event].dates[date].slots){
					eventObject.openings += parseInt(events[event].dates[date].slots[slot].maxVolunteers);
					eventObject.volunteered += events[event].dates[date].slots[slot].volunteers.length;
				}
			}
			eventOption.push(eventObject);
		}
		
		var options = {auth : true, events : eventOption};
		exports.renderProfilePages('marketplace', req, res, options, userData, organizations, notifs);
	});	
}

exports.renderEvent = function(req, res, userData, organizations, notifs, events){
	var urlelements = req.url.split('/');
	var id = urlelements[urlelements.length-1];
	events.find({id : id}).toArray(function(err, events){
		
		var event =events[0];
		
		var eventObject = {};
		eventObject['title'] = event.title;
		eventObject['description'] = event.doWhat;
		eventObject['bringing'] = event.bringWhat;
		eventObject['street'] = event.street;
		eventObject['city'] = event.city;
		eventObject['state'] = event.state;
		eventObject['cover'] = event.cover;
		eventObject['id'] = event.id;
		eventObject['dates'] = {};
		eventObject['openings'] = 0;
		eventObject['volunteered']=0;
		
		for(date in event.dates){
			
			var dateArray = event.dates[date].date.toDateString().split(" ");
			//if the month has already been added
			if(eventObject.dates[dateArray[1]]){
				eventObject.dates[dateArray[1]].days.push(dateArray[2]);
			}else{
				//if the month hasn't been added yet
				eventObject.dates[dateArray[1]] = {days : [dateArray[2]]};
			}
			for(slot in event.dates[date].slots){
				eventObject.openings += parseInt(event.dates[date].slots[slot].maxVolunteers);
				eventObject.volunteered += event.dates[date].slots[slot].volunteers.length;
			}
		}
		var options = {auth : true, event : eventObject};
		exports.renderProfilePages('eventpage', req, res, options, userData, organizations, notifs);
	});
}

exports.accountComplete = function(req, res, systemData, userData, organizations, notifs){
	systemData.find({_id : ObjectID(process.env.INTEREST_ID)}).toArray(function(err, data) {
		var interests = data[0]["interests"];  
		var options = {auth : true};
		options["interests"] = interests;
		renderFullAccounts('register_complete', req, res, options, userData, organizations, notifs);
	});
}

exports.createOrg = function(req, res, userData, organizations, notifs){
	if(req.isAuthenticated()){
		exports.renderProfilePages('org_create', req, res, {auth : true}, userData, organizations, notifs);
	}else{
		res.redirect('/login?redirect='+require('url').parse(req.url, true).pathname.substring(1));
	}
}

exports.createEvent = function(req, res, systemData, userData, organizations, notifs){
	if(req.isAuthenticated()){
		systemData.find({_id : ObjectID(process.env.INTEREST_ID)}).toArray(function(err, data) {
			exports.renderProfilePages('event_create', req, res, {auth : true, interests : data[0]["interests"]}, userData, organizations, notifs);
		});
	}else{
		res.redirect('/login?redirect='+require('url').parse(req.url, true).pathname.substring(1));
	}
}

exports.eventView = function(req, res, userData, notifs, events, organizations){
	if(req.isAuthenticated()){
		//we have to get the internal id of the active organization
		userData.find({userID : req.user.userID}).toArray(function(err, users){
			if(err){
				return console.error(err);
			}
			var orgInternal = users[0].accounts[users[0].active.id];
			
			events.find({org : orgInternal}).toArray(function(err, events){
				if(err){return console.error(err);}
				var eventOption = [];
				for(event in events){
					var eventObject = {};
					eventObject['title'] = events[event].title;
					eventObject['description'] = events[event].doWhat;
					eventObject['city'] = events[event].city;
					eventObject['state'] = events[event].state;
					eventObject['cover'] = events[event].cover;
					eventObject['id'] = events[event].id;
					eventObject['dates'] = {};
					eventObject['openings'] = 0;
					eventObject['volunteered']=0;
					for(date in events[event].dates){
						
						var dateArray = events[event].dates[date].date.toDateString().split(" ");
						//if the month has already been added
						if(eventObject.dates[dateArray[1]]){
							eventObject.dates[dateArray[1]].days.push(dateArray[2]);
						}else{
							//if the month hasn't been added yet
							eventObject.dates[dateArray[1]] = {days : [dateArray[2]]};
						}
						for(slot in events[event].dates[date].slots){
							eventObject.openings += parseInt(events[event].dates[date].slots[slot].maxVolunteers);
							eventObject.volunteered += events[event].dates[date].slots[slot].volunteers.length;
						}
					}
					eventOption.push(eventObject);
				}
				
				var options = {auth : true, events : eventOption};
				exports.renderProfilePages('event_view', req, res, options, userData, organizations, notifs);
			});
		});
	}else{
		res.redirect('/login?redirect='+require('url').parse(req.url, true).pathname.substring(1));
	}
}

exports.switchAccounts = function(req, res, userData, orgData){
	if(req.isAuthenticated()){
		var urlQuery = require('url').parse(req.url, true);
		console.log(urlQuery);
		if(urlQuery.query.account){
			var userID = req.user.userID;
			userData.find({userID : userID}).toArray(function(err, users){
				if(!users){
					console.error("no users found for this ID!");
				}else if(users.length > 1){
					console.error("Multiple entries found for this ID!");
				}else{
					//if the requested ID doesn't match the ID of the user, then this is an organization
					if(urlQuery.query.account != users[0].userID){
						var orgID = users[0].accounts[urlQuery.query.account];
						orgData.find({orgID : orgID}).toArray(function(err, orgs){					
							var user = users[0];
							//you don't check against duplicate IDs at the moment!!
							var org = orgs[0];
							var activeObject = {name : org.orgname, type : 'org', id : urlQuery.query.account, profile : org.profile};
							userData.update(
								{userID : req.user.userID},
								{$set : {"active.name" : activeObject.name, "active.type" : activeObject.type, "active.id" : activeObject.id, "active.profile" : activeObject.profile}},
								function(err, docs){
									if(err){return console.log(err);}
									res.redirect(req.get('referer'));
								}
							);
						});	
					}else{
						//we're switching back to a personal account
						var userID = users[0].userID;
						var activeObject = {name : users[0].firstname+' '+users[0].lastname, type : 'personal', id : userID, profile : users[0].profile};
						userData.update(
							{userID : userID},
							{$set : {active : activeObject}},
							function(err, docs){
								if(err){return console.log(err);}
								res.redirect(req.get('referer'));
							}
						);
					}
					
				}
			});
		}else{
			console.error("no account provided for switch request");
		}
	}
}

//for rendering pages that need all sensitive info
function renderFullAccounts(page, req, res, options, userData, organizations, notifs){

	var userID = req.user.userID;
	userData.find({userID : userID}).toArray(function(err, users){
		
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
			//var data = {user : users[0]};
			var account = users[0];
			var data = {user : account};
			data.user.active.name = "";
			console.log(data);
			
			//extract a list of internal org IDs from the user object
			var orgIDs = [];
			for(var orgUniqueKey in account.accounts){
				orgIDs.push(account.accounts[orgUniqueKey]);
			}
			//Get all organizations by their internal ID
			organizations.find({orgID : {$in : orgIDs}}).toArray(function(err, orgArray){
				/*THERE'S A GOOD CHANCE SOMETHING MIGHT FUCK UP HERE*/
				var index = 0;
				for (orgEntry in orgArray){
					var orgID = Object.keys(account.accounts)[index];
					data.user.accounts.push({name : orgArray[orgEntry].orgname, profile : orgArray[orgEntry].profile, id : orgID});
					index++;
				}
				
				notifs.find({owner : data.user.userID}).toArray(function(err, notifs){
					data.user.notifs = notifs;
					for(var option in options){
						data[option] = options[option];
					}
					res.render(page, data);
				});
			});	
		}
	});
}

function getandFillNotifs(account, data, notifs, callback){
	//for every notification ID in the users notifs, retrieve it from the Notifs collection and send it
	var notifs = db.collection('notifs');
	
	notifs.find({owner : account.userID}).toArray(function(err, notifs){
		data.user.notifs = notifs;
	});
	
	callback();
}

//for rendering any page on the site for an authenticated user
exports.renderProfilePages = function(page, req, res, options, userData, organizations, notifs){
	if(req.isAuthenticated()){
	
		var userID = req.user.userID;
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
				var account = users[0];
				
				if(account.done){
					var data = {user : {username : account.username, userID : account.userID, name : account.firstname+' '+account.lastname, profile : account.profile, accounts : [], active : account.active, notifs : []}};
					//extract a list of internal org IDs from the user object
					var orgIDs = [];
					for(var orgUniqueKey in account.accounts){
						orgIDs.push(account.accounts[orgUniqueKey]);
					}
					//Get all organizations by their internal ID
					organizations.find({orgID : {$in : orgIDs}}).toArray(function(err, orgArray){
						/*THERE'S A GOOD CHANCE SOMETHING MIGHT FUCK UP HERE*/
						var index = 0;
						for (orgEntry in orgArray){
							var orgID = Object.keys(account.accounts)[index];
							data.user.accounts.push({name : orgArray[orgEntry].orgname, profile : orgArray[orgEntry].profile, id : orgID});
							index++;
						}
						
						notifs.find({owner : data.user.userID}).toArray(function(err, notifs){
							data.user.notifs = notifs;
							for(var option in options){
								data[option] = options[option];
							}
							
							res.render(page, data);
						});
					});
				}else{
					res.redirect('/profileComplete');
				}
				
			}
		});
	}else{
		res.redirect('/login?redirect='+require('url').parse(req.url, true).pathname.substring(1));
	}
}