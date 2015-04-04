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



exports.addVolunteer = function(volunteerInfo){
	var newVolunteer = new exports.Volunteer(volunteerInfo);
		
	newVolunteer.save(function(err) {
		if (err) {
			console.log("ERROR!");
			return false;
		}
	});
	return true;
}

exports.addGroup = function(groupInfo){
	var newGroup = new exports.Group(groupInfo);
	
	newGroup.save(function(err) {
		if (err) {
			console.log("ERROR!");
			return false;
		}
	});
	return true;
}

exports.updateGroup = function(groupName){
	exports.Group.findOne({name : groupName}, function(err,doc){
		if(err){
			cosnole.log("ERROR: Update group");
			return false;
		}
		if (doc != null){
			doc.members = doc.members+1;
			doc.save();
		}else{
			return exports.addGroup({name : groupName, members : 1});
		}
	});
}