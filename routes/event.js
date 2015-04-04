var signup = require('../lib/signup');

function sendemails(new_volunteer, transporter){
	if(new_volunteer['age'] == '0'){
				// setup e-mail data with unicode symbols
				var mailOptions = {
				    from: 'Alexander Hadik <alex@getadvocate.co>', // sender address
				    to: new_volunteer['guard_email'], // list of receivers
				    subject: 'Serve Rhode Island Earthday Confirmation', // Subject line
				    text: 'Hello,\n'+new_volunteer['firstname']+' '+new_volunteer['lastname']+' ('+new_volunteer['email']+') has registered as a volunteer at Serve Rhode Island\'s Earth Day Park Clean Up. The event will be held on April 25th, at Roger Williams Park. As '+new_volunteer['firstname']+' indicated they are younger than 18 years old, they have provided your name and email address as their legal guardian. If you have any questions or concerns about this designation, please contact Maya Ambroise at mambroise@serverhodeisland.org.\n\nSincerely Serve Rhode Island', // plaintext body
				    html: '<p>Hello,</p><p>'+new_volunteer['firstname']+' '+new_volunteer['lastname']+' ('+new_volunteer['email']+') has registered as a volunteer at Serve Rhode Island\'s Earth Day Park Clean Up. The event will be held on April 25th, at Roger Williams Park. As '+new_volunteer['firstname']+' indicated they are younger than 18 years old, they have provided your name and email address as their legal guardian. If you have any questions or concerns about this designation, please contact Maya Ambroise at mambroise@serverhodeisland.org.</p><p>Sincerely Serve Rhode Island</p>' // html body
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
			    from: 'Alexander Hadik <alex@getadvocate.co>', // sender address
			    to: new_volunteer['email'], // list of receivers
			    subject: 'Serve Rhode Island Earthday Confirmation', // Subject line
			    text: 'Hello,\nThis is your confirmation email for volunteering at Serve Rhode Island\'s Earth Day Park Cleanup on April 25th. The event will be held in Roger Williams Park. You will receive an email in the days before the event indicating your assigned cleanup location.\nThanks for volunteering with Serve Rhode Island!\nServe Rhode Island', // plaintext body
			    html: '<p>Hello,</p><p>This is your confirmation email for volunteering at Serve Rhode Island\'s Earth Day Park Cleanup on April 25th. The event will be held in Roger Williams Park. You will receive an email in the days before the event indicating your assigned cleanup location.</p><p>Thanks for volunteering with Serve Rhode Island!</p><p>Serve Rhode Island</p>' // html body
			};
			transporter.sendMail(mailOptions, function(error, info){
			    if(error){
			        console.log(error);
			    }else{
			        console.log('Message sent: ' + info.response);
			    }
			});
}


exports.resend = function(req, res, transporter){
	sendemails({email : req.param("email"), firstname : req.param("firstname"), lastname : req.param("lastname")}, transporter);
	res.render('event_signup_success',{email : req.param("email"), firstname : req.param("firstname"), lastname : req.param("lastname")});
}

exports.signup = function(req, res){
	res.render('event_signup', {});
}

exports.submit = function(req, res, transporter){
	
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