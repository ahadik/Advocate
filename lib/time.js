var _MS_PER_DAY = 1000 * 60 * 60 * 24;

exports.dateDiffInDays = function(firstDate) {
  var currentDate = new Date;
  
  console.log(firstDate);
  
  var utc1 = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  var utc2 = Date.UTC(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

exports.calcTimes = function (){
	var dateData = {};
	var dayChoices = $('#timeSection .timeSelectDate').toArray();
	for(dayChoice in dayChoices){
		var date = $('h3', dayChoices[dayChoice]).html();
		
		var start = parseInt($('.selectorWrapper .selectstart select', dayChoices[dayChoice]).val());
		var end = parseInt($('.selectorWrapper .selectend select', dayChoices[dayChoice]).val());
		
		var rows = $('.blockRow', dayChoices[dayChoice]).toArray();
		for(row in rows){
			var blocks = $('.blockHalf', rows[row]).toArray();
			var selectedStart = 0.0;
			var selectedEnd = 0.0;
			var started = false;
			for(block in blocks){
				if($(blocks[block]).hasClass("hourBlockHighlight")){
					started=true;
					selectedEnd+=0.5;
				}else if(!started){
					selectedStart+=0.5;
					selectedEnd+=0.5;
				}
			}
			if(dateData.hasOwnProperty(date)){
				dateData[date].push([selectedStart+start, selectedEnd+start]);
			}else{
				dateData[date] = [[selectedStart+start, selectedEnd+start]];
			}
		}
	}
	return dateData;
}