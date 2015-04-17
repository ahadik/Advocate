var mongoose = require('mongoose');

var Schema=mongoose.Schema;

var eventSchema=new Schema({
	name : String,
	volunteerID : String
});


exports.Event = mongoose.model('RegEvent', eventSchema);

exports.addEvent = function(eventInfo, callback){
	var newEvent = new exports.Event(eventInfo);
	
	newEvent.save(function(err) {
		if (err) {
			console.log("ERROR creating event");
			res.end('Error creating event');
			return false;
		}
	});
	callback();
	return true;
}