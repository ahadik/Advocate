var mongoose = require('mongoose');

var Schema=mongoose.Schema;

var volunteerSchema=new Schema({
	added : { type: Date, default: Date.now },
	firstName : String,
	lastName : String,
	age : Number,
	address : String,
	zip : String,
	phone : String,
	email : String
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
	var newVolunteer = new Volunteer(volunteerInfo);
		
	newVolunteer.save(function(err) {
		if (err) {
			console.log("ERROR!");
		}
	});
}

exports.addGroup = function(groupInfo){
	var newGroup = new exports.Group(groupInfo);
	
	newGroup.save(function(err) {
		if (err) {
			console.log("ERROR!");
		}
	});
}