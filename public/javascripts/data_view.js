var groups;
$.getJSON('/groups.js', function(data){
		groups = data;
	});
	
function full_table(table){
	$('tr').show();
	$('.filter_option').removeClass('filter_selected');
	$(this).addClass('filter_selected');
}

$(document).ready(function(){
	$('.filter_select').click(function(){
		//set up the filter object
		filters.group = $(this).attr('group').split(',');
		//filter using the filter object
		filter($('#volunteer_data'),'tr');
		$('tr.header', $('#volunteer_data')).show();
		$('.filter_option').removeClass('filter_selected');
		$(this).addClass('filter_selected');
	});
});