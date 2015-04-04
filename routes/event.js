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
	
	//add the group 
	var group_name = req.body['group'];
	if(!signup.updateGroup(group_name)){
		valid_entry = false;
	}
	
	if(valid_entry){
		if(signup.addVolunteer(new_volunteer)){
			res.render('event_signup_success',{email : new_volunteer['email']});
		}else{
			res.render('event_signup_failure');
		}
	}else{
		res.render('event_signup_failure');
	}
	
};