var socket = io();

socket.on('update', function(data){
	console.log(data);
});

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

$(document).ready(function(){
	var volunteers = $('meta[name="event"]').attr('key');
	
	$('.volunteer').draggable({
		axis: 'x',
		create: function( event, ui ) {},
		start : function(event, ui) {},
		drag: function(event, ui) {},
		stop: function(event, ui){},
		containment: [-48, 0, 0, 0]
	});
	
	$('.bubble').bind('webkitAnimationEnd',function(){ 
		$(this).removeClass('bubble_show'); 
		var status = $($($(this).parent()).parent()).attr('status');
		if(status == 1){
			$($(this).parent()).addClass('checked_in'); 
		}else{
			$($(this).parent()).removeClass('checked_in'); 
		}
		
	})
	
	$('.group_item').click(function(){
		$('#group_sort_title h2').html($(this).html());
		$('.group_item').css({'font-weight': 'normal'});
		$(this).css({'font-weight': 'bold'});
		filters.group = $(this).attr('group').split(',');
		filter($('#volunteers'), 'div.volunteer_wrapper', 'group', $(this).attr('group'));
		toggle_groups();
	});
	$('#group_sort_title').click(function(){
		toggle_groups();
	});
	
	$(".volunteer").on("dragstart", function( event, ui ) {
		$('.list_item').not(this).animate({
			left: '0px'
		},100);
	});
	$( ".volunteer").on("dragstop", function( event, ui ) {
		if(ui.position.left < -30){
			$(this).animate({
				left : "-48px"
			}, 100);
			var status = $($(this).parent()).attr('status');
			if(status==1){
				$('.bubble', this).removeClass('bubble_green').addClass('bubble_red');	
				$($(this).parent()).attr('status', "0");
			}else{
				$('.bubble', this).removeClass('bubble_red').addClass('bubble_green');
				$($(this).parent()).attr('status', "1");
			}
			
			$('.bubble', this).addClass('bubble_show');
			$(this).animate({
				left : "0px"
			}, 100, function(){
				if(status==0){
					$($(this).prev()).removeClass('check_in').addClass('check_out');
				}else{
					$($(this).prev()).removeClass('check_out').addClass('check_in');
				}
			});
		}else{
			$(this).animate({
				left : "0px"
			}, 100);
		}
	});
	
});