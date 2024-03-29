var socket = io();

var in_swipe = false;

function revert_swipe(data){
	var volunteer_wrapper = $('.volunteer_wrapper[uniqueid="'+data.uniqueid+'"]');
	var volunteer = $('.volunteer', volunteer_wrapper);
}

socket.on('invalid_status', function(data){
	console.log('Invalid status ('+data.status+') for uniqueid: '+data.uniqueid);
});

socket.on('db_error', function(data){
	console.log('Error submitting status change ('+data.status+') for user with id: '+data.uniqueid);
	revert_swipe(data);
});

socket.on('null_id', function(data){
	console.log('Volunteer id: '+data.uniqueid+' was not found in the database!');
	revert_swipe(data);
});

//only filter the data if there is no swipe action active
function trigger_filter(){
	if (in_swipe){
		setTimeout(trigger_filter(), 1000);
		return false;
	}else{
		filter($('#volunteers'), 'div.volunteer_wrapper');
		return true;
	}
}

socket.on('swipe_update', function(data){
	
	var volunteer_wrapper = $('.volunteer_wrapper[uniqueid="'+data.uniqueid+'"]');
	var volunteer = $('.volunteer', volunteer_wrapper);
	volunteer_wrapper.attr('status', data.status);
	if(data.status=="1"){
		$('.action', volunteer_wrapper).removeClass('check_in').addClass('check_out');
	}else{
		$('.action', volunteer_wrapper).removeClass('check_out').addClass('check_in');
	}
	trigger_filter();
	volunteer_wrapper.addClass('expand');
	
});

function reload_volunteers(volunteers){
	for (var i=0; i<volunteers.length; i++){
		$('.volunteers[uniqueid="'+volunteers[i]._id+'"]').attr('status', volunteers[i].status);
	}
	reclass_volunteers();
}

socket.on('swipe_success', function(data){
	var swiped_vol = data.swiped;
	var volunteers = data.vols;
	var volunteer_wrapper = $('.volunteer_wrapper[uniqueid="'+swiped_vol.uniqueid+'"]');
	var volunteer = $('.volunteer', volunteer_wrapper);
	reload_volunteers(volunteers);
	volunteer_wrapper.addClass('collapse');
	volunteer_wrapper.attr('status', swiped_vol.status);
});

function emit_swipe(curr_status, uniqueid){
	var status = null;
	if(curr_status == '0'){
		status = '1';
	}else if(curr_status == '1'){
		status = '0';
	}else if(curr_status == '2'){
		status = '1';
	}else{
		return false;
	}
	socket.emit('swipe', {curr_status : curr_status, status : status, uniqueid: uniqueid});
	return true;
}

function check_in(ref){
	$('.bubble', ref).removeClass('bubble_red').addClass('bubble_green');
}

function check_out(ref){
	$('.bubble', ref).removeClass('bubble_green').addClass('bubble_red');
}

function get_master_volunteers(event_id){
	$.getJSON('/volunteers.js?id='+event_id, function(data){
		return data;
	});
}

function toggle_groups(){
	var dropdown = $('#group_dropdown');
	if(dropdown.hasClass('retracted')){
		dropdown.removeClass('retracted').addClass('extended');
		dropdown.height($(window).height()-108);
	}else{
		dropdown.removeClass('extended').addClass('retracted');
		dropdown.height("0px");
	}
	
}

function reclass_volunteers(){
	//make sure volunteers that come in as checked in are marked as such
	var checked_in_wrappers = $('.volunteer_wrapper[status="1"]');
	var checked_in_volunteers = $('.volunteer', checked_in_wrappers);
	$('.action', checked_in_wrappers).removeClass('check_in').addClass('check_out');
}

$(document).ready(function(){
	filters.status = $('.nav_sect[status="0"]').attr('status').split(',');
	filter($('#volunteers'), 'div.volunteer_wrapper');
	//make sure volunteers that come in as checked in are marked as such
	reclass_volunteers();
	var checked_in_wrappers = $('.volunteer_wrapper[status="1"]');
	$('.action', checked_in_wrappers).removeClass('check_in').addClass('check_out');
	var volunteers = $('meta[name="event"]').attr('key');
	var width = $(window).width();
	$('.volunteer').draggable({
		axis: 'x',
		create: function( event, ui ) {},
		start : function(event, ui) {},
		drag: function(event, ui) {},
		stop: function(event, ui){},
		containment: [0, 0, width, 0],
		scroll : false
	});
	
	$('#volunteers').scroll(function(){
		$('.info_show').removeClass('info_show').addClass('info_no_show');
		$('.info_active').removeClass('info_active').addClass('info_inactive');
	});
	
	$('.bubble').bind('webkitAnimationEnd',function(){ 
		$(this).removeClass('bubble_show');
		var volunteer_wrapper = $($($(this).parent()).parent());
		var status = volunteer_wrapper.attr('status');
		if(status == '1'){
			$($(this).parent()).addClass('checked_in');
		}else{
			$($(this).parent()).removeClass('checked_in'); 
		}
		trigger_filter();
	});
	
	$('.volunteer_wrapper').bind('webkitAnimationEnd', function(){
		$(this).removeClass('collapse');
		var volunteer_wrapper = $($($(this).parent()).parent());
		var status = volunteer_wrapper.attr('status');
		if(status == '1'){
			$('.action',this).removeClass('check_out').addClass('check_in');
		}else{
			$('.action',this).removeClass('check_in').addClass('check_out');
			$('.volunteer', this).css({left : 0});
		}
		trigger_filter();
	});
	
	$('.info_icon').click(function(){
		var status = $(this).closest('.volunteer_wrapper').hasClass('info_show');
		$('.info_icon').removeClass('info_active').addClass('info_inactive');
		$('.info_show').removeClass('info_show').addClass('info_no_show');
		
		if(!status){
			$($(this).closest('.volunteer_wrapper')).removeClass('info_no_show').addClass('info_show');
			$(this).addClass('info_active');
		}else{
			$($(this).closest('.volunteer_wrapper')).removeClass('info_show').addClass('info_no_show');
		}
	});
	
	$('.nav_sect').click(function(){
		$('.nav_sect').removeClass('nav_selected');
		$(this).addClass('nav_selected');
		filters.status = $(this).attr('status').split(',');
		filter($('#volunteers'), 'div.volunteer_wrapper');
	});
	
	$('#group_drop').change(function(){
		filters.group = $('#group_drop').val().split(',');
		filter($('#volunteers'), 'div.volunteer_wrapper');
	});
	
	$('.group_item').click(function(){
		$('#group_sort_title h2').html($(this).html());
		$('.group_item').css({'font-weight': 'normal'});
		$(this).css({'font-weight': 'bold'});
		filters.group = $(this).attr('group').split(',');
		filter($('#volunteers'), 'div.volunteer_wrapper');
		toggle_groups();
	});
	$('#group_sort_title').click(function(){
		toggle_groups();
	});
	
	$(".volunteer").on("dragstart", function( event, ui ) {
		in_swipe = true;
		$('.list_item').not(this).animate({
			left: '0px'
		},100);
	});
	
	$( ".volunteer").on("dragstop", function( event, ui ) {
		in_swipe = false;
		if(ui.position.left > width*(1/3)){
			$(this).animate({
				left : width+"px"
			}, 100);
			var status = $($(this).parent()).attr('status');
			if(status=="1"){
				check_out(this);
			}else{
				check_in(this);
			}
			var volunteer = $($(this).parent());
			emit_swipe(volunteer.attr('status'), volunteer.attr('uniqueid'));
		}else{
			$(this).animate({
				left : "0px"
			}, 100);
		}
	});
});