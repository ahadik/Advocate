var groups;
$.getJSON('/groups.js', function(data){
		groups = data;
	});

function filter_table(table, parameter, values){
	$('tr', table).hide();
	$('tr.header', table).show();
	var filter = '';
	for (var i = 0; i<values.length; i++){
		filter += 'tr['+parameter+' = "'+values[i]+'"], ';
	}
	filter = filter.slice(0,-2);
	$(filter, table).show();
}

function full_table(table){
	$('tr').show();
	$('.filter_option').removeClass('filter_selected');
	$(this).addClass('filter_selected');
}

$(document).ready(function(){
	$('.filter_select').click(function(){
		filter_table($('#volunteer_data'), 'group', [$(this).attr('group')]);
		$('.filter_option').removeClass('filter_selected');
		$(this).addClass('filter_selected');
	});
});