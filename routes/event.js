var signup = require('../lib/signup');
var event = require('../lib/event');
var crypto = require('crypto');

function sendemails(new_volunteer, transporter){
	if(new_volunteer['age'] == '0'){
				// setup e-mail data with unicode symbols
				var mailOptions = {
				    from: 'Serve Rhode Island <volunteer@serverhodeisland.org>', // sender address
				    to: new_volunteer['guard_email'], // list of receivers
				    subject: 'Serve Rhode Island Earthday Confirmation', // Subject line
				    text: 'Hello,\n'+new_volunteer['firstname']+' '+new_volunteer['lastname']+' ('+new_volunteer['email']+') has registered as a volunteer at Serve Rhode Island\'s Earth Day Park Clean Up. The event will be held on April 25th, at Roger Williams Park. As '+new_volunteer['firstname']+' indicated they are younger than 18 years old, they have provided your name and email address as their legal guardian. If you have any questions or concerns about this designation, please contact Maya Ambroise at mambroise@serverhodeisland.org.\n\nSincerely,\nServe Rhode Island', // plaintext body
				    html: '<p>Hello,</p><p>'+new_volunteer['firstname']+' '+new_volunteer['lastname']+' ('+new_volunteer['email']+') has registered as a volunteer at Serve Rhode Island\'s Earth Day Park Clean Up. The event will be held on April 25th, at Roger Williams Park. As '+new_volunteer['firstname']+' indicated they are younger than 18 years old, they have provided your name and email address as their legal guardian. If you have any questions or concerns about this designation, please contact Maya Ambroise at mambroise@serverhodeisland.org.</p><p>Sincerely,</p><p>Serve Rhode Island</p>' // html body
				};
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        console.log(error);
				    }else{
				        console.log('Message sent: ' + info.response);
				    }
				});
			}
			
			var mailOptions = {
			    from: 'Serve Rhode Island <volunteer@serverhodeisland.org>', // sender address
			    to: new_volunteer['email'], // list of receivers
			    subject: 'Your Confirmation for Serve Rhode Island\'s Earth Day', // Subject line
			    text: 'Hello,\nThis is your confirmation email for volunteering at Serve Rhode Island\'s Earth Day Park Cleanup on April 25th. The event will be held in Roger Williams Park. You\'ll receive an email in the days before the event indicating your assigned cleanup location.\nFor any questions, please email us at volunteer@serverhodeisland.org.\nWe\'ll see you there!\nServe Rhode Island', // plaintext body
			    html: '<p>Hello,</p><p>This is your confirmation email for volunteering at Serve Rhode Island\'s Earth Day Park Cleanup on April 25th. The event will be held in Roger Williams Park. You\'ll receive an email in the days before the event indicating your assigned cleanup location.</p><p>For any questions, please email us at volunteer@serverhodeisland.org.</p><p>We\'ll see you there!</p><p>Serve Rhode Island</p>' // html body
			};
			transporter.sendMail(mailOptions, function(error, info){
			    if(error){
			        console.log(error);
			    }else{
			        console.log('Message sent: ' + info.response);
			    }
			});
}


exports.create_event = function(req, res){
	if(req.query.name != null){
		event.addEvent({name: req.query.name, volunteerID : crypto.randomBytes(16).toString('hex')}, function(){
			res.end('Event Added');
		});
	}
	
}

exports.resend = function(req, res, transporter){
	sendemails({email : req.param("email"), firstname : req.param("firstname"), lastname : req.param("lastname")}, transporter);
	res.render('event_signup_success',{email : req.param("email"), firstname : req.param("firstname"), lastname : req.param("lastname")});
}

exports.signup = function(req, res){
	res.render('event_signup', {});
}


exports.view = function(req, res){
	var password = req.body['password'];
	if (password == 'earthday2015'){
		event.Event.find({name : "Earth Day"}, function(err, events){
			if(err || events.length != 1){
				res.end('Error finding matching event!');
			}else{
				signup.Volunteer.find({}).sort({added: -1}).exec(function(err, volunteers){
					signup.Group.find({}, function(err, groups){
						res.render('event_signup_view', {volunteers : volunteers, groups : groups, event : {id : id}});
					});
				});
			}
		});		
	}else{
		res.render('event_signup_login', {});
	}
}



exports.submit = function(req, res, transporter, eventID){
	
	var valid_entry = true;
	var new_volunteer = {};
	for (var key in req.body){
		if(key == 'media'){
			if (req.body[key] == 'media'){
				new_volunteer[key] = true;
			}else{
				new_volunteer[key] = false;
				valid_entry = false;
			}
		}else if(key == 'liability'){
			if (req.body[key] == 'liability'){
				new_volunteer[key] = true;
			}else{
				new_volunteer[key] = false;
				valid_entry = false;
			}
		}else if(key == 'accommodations'){
			new_volunteer[key] = true;
		}else{
			new_volunteer[key] = req.body[key];
		}
	}
	
	new_volunteer['status'] = 0;
	new_volunteer['eventID'] = eventID;
	console.log(eventID);
	console.log(new_volunteer);
	
	if(!valid_entry){
		res.render('event_signup_failure', {});
		return false;
	}
	
	signup.addVolunteer(new_volunteer, function(){
		signup.updateGroup(new_volunteer['group'], function(){
			sendemails(new_volunteer, transporter);
			res.render('event_signup_success',new_volunteer);
			return true;
		});
	});
};


//CHECKIN
exports.checkin = function(req,res, groups){
	event.Event.find({name : "Earth Day"}, function(err, events){
		if(events.length == 0){
			res.end('No matching events');
		}else if(events.length > 1){
			res.end('Multiple matching events');
		}else{
			signup.Volunteer.find({eventID : events[0].volunteerID}).sort({name : 1}).exec(function(err,volunteers){
				if(err){
					console.log('Error fetching volunteers from database!');
					res.end();
				}else{
					res.render('checkin', {eventID : events[0]._id.toString(), groups : groups, volunteers : volunteers});
				}
			});
			
		}
	});
}