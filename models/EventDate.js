var Slot = require('../models/Slot');

exports.EventDate = function(timePairs, date){
	this.date = date;
	this.slots = makeSlots(timePairs, date);
}

function makeSlots(timePairs, date){
	var slotArray = [];
	for(pair in timePairs){
		var slot = new Slot.Slot(timePairs[pair].start, timePairs[pair].end, timePairs[pair].volunteers);
		slotArray.push(slot);
	}
	return slotArray;
}