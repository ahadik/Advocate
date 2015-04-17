var socket = io();
socket.on('update', function(data){
	console.log(data);
});

function get_master_volunteers(event_id){
	$.getJSON('/volunteers.js?id='+event_id, function(data){
		groups = data;
		for (var i=0; i<groups.length; i++){
			group_split[i] = groups[i].name.toLowerCase().split(/[ -]/);
		}
	});
}

$(document).ready(function(){
	
});