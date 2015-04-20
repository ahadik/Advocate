var mongoose = require('mongoose');

var Schema=mongoose.Schema;

var volunteerSchema=new Schema({
	added : { type: Date, default: Date.now },
	firstname : String,
	lastname : String,
	phone : String,
	emergency_phone : String,
	address : String,
	zip : String,
	email : String,
	eventID : String,
	status : Number,
	time_in : Date,
	time_out : Date,
	age : Number,
	group : String,
	guard_name : String,
	guard_email : String,
	tools : [String],
	media : Boolean,
	liability : Boolean,
	accommodations : {type: Boolean, default: false},
	accommodatation_details : String
});

var groupSchema = new Schema({
	name: String,
	members: Number
});

volunteerSchema.methods.readValues= function() {
	console.log("Adding: "+this.added.toDateString());
	console.log("First Name: "+this.firstName);
	console.log("Last Name: "+this.lastName);
	console.log("Age: "+this.age.toString());
	console.log("Address: "+this.address);
	console.log("ZIP: "+this.zip);
	console.log("Phone: "+this.phone);
	console.log("Email: "+this.email);
};

exports.Volunteer = mongoose.model('Volunteer',volunteerSchema);
exports.Group = mongoose.model('Group', groupSchema);



exports.addVolunteer = function(volunteerInfo, callback){
	
	var newVolunteer = new exports.Volunteer(volunteerInfo);
		
	newVolunteer.save(function(err) {
		if (err) {
			console.log("ERROR!");
			res.render('event_signup_failure');
			return false;
		}
		//update group
		return callback();
	});
}

exports.addGroup = function(groupInfo, callback){
	var newGroup = new exports.Group(groupInfo);
	
	newGroup.save(function(err) {
		if (err) {
			console.log("ERROR!");
			res.render('event_signup_failure');
			return false;
		}
		return callback();
	});
	return true;
}

exports.updateGroup = function(groupName, callback){
	exports.Group.findOne({name : groupName}, function(err,doc){
		if(err){
			console.log("ERROR: Update group");
			res.render('event_signup_failure');
			return false;
		}
		if (doc != null){
			doc.members = doc.members+1;
			doc.save();
			return callback();
		}else{
			console.log("ADDING GROUP");
			return exports.addGroup({name : groupName, members : 1}, callback);
		}
	});
}