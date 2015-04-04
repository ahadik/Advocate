var signup = require('../lib/signup');

exports.signup = function(req, res){
	res.render('event_signup', {});
}

exports.submit = function(req, res){
	
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
			res.render('event_signup_success',{email : new_volunteer['email']});
			return true;
		});
	});
};