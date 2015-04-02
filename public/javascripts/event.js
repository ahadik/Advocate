var groups;
var group_split = [];

function isNumber(val){
	return !isNaN(+val) && isFinite(val);
}

//wordA is less than or equal to wordB in length. Both are lists of characters
function word_subset(wordA, wordB){
	if(wordA.length == 0){
		return 0;
	}
	for(var i=0; i<wordA.length; i++){
		if (wordA[i] != wordB[i]){
			return 0;
		}
	}
	return 1;
}

function phone_validate(ref, val){
	$(ref).removeClass('bad_input');
	var phone_num = val;
	phone_num = phone_num.replace(/\D/g,'');
	if((phone_num.length == 11) && (phone_num[0] == '1')){
		phone_num = phone_num.slice(1);
	}
	if(phone_num.length != 10){
		$(ref).addClass('bad_input');
		return val;
	}
	return phone_num.slice(0,3)+'-'+phone_num.slice(3,6)+'-'+phone_num.slice(6,10);
}

function validate(){
	var result = false;
	var inputs = $(':input');
	for(var i=0; i<inputs.length; i++){
		$(this).removeClass('bad_input');
		//console.log($(inputs[i]).attr('type'));
		var input = $(inputs[i]);
		if((input.attr('type') == 'text') || (input.attr('type') == 'email') || (input.attr('type') == 'search')){
			if (input.val().length == 0){
				input.addClass('bad_input');
			}
		}
		
		if(input.attr('name') == 'phone'){
			
		}
		
	}
}

function search_and_show(term){
	
	var match_groups = [];
	var term_list = term.toLowerCase().split(' ');
	for(var i=0; i<group_split.length; i++){
		var match=0;
		for(var k=0; k<group_split[i].length; k++){
			for(var j=0; j<term_list.length; j++){

				if (term_list[j].length <= group_split[i][k].length){
					match+=word_subset(term_list[j], group_split[i][k]);
				}
			}
		}

		if (match/term_list.length > 0){
			match_groups.push({group: groups[i], score: match});
		}
	}
	var groups_sorted = match_groups.sort(function(a, b) {return b.score - a.score});
	
	$('#group_auto').html('');
	$('#group_auto').css({top: $('#groups').position().top+140+'px', left: $('#groups').css('margin-left')});
	$('#group_auto').show();
	for(var i=0; i<match_groups.length; i++){
		$('#group_auto').append('<div class="search_result">'+
		'<p class="auto_name">'+match_groups[i].group.name+'</p>'+
		'<p class="auto_num">'+match_groups[i].group.members+' members</p>'+
		'</div>');
		$('#group_auto').children().last().data('name', match_groups[i].group.name);
		if (i == 2){
			break;
		}
	}
	
}


function verify_send(){
	$('p.confirmation_text').html('A confirmation email has been sent to</br> '+$("input[name='email']").val()+'.');
	$('#form_body').fadeOut();
	$('#confirmation').fadeIn();
}

function toggleCheckbox(box){
	if(box.is(':checked')){
		box.prop('checked', false);
	}else{
		box.prop('checked', true);
	}
}

$(document).ready(function(){	
	
	$('input[name="phone"],input[name="emergency_phone"]').blur(function(){
		$(this).val(phone_validate(this, $(this).val().toString()));
	});
	
	$('#group_auto').hide().css({top: $('#groups').position().top+140+'px', left: $('#groups').css('margin-left')});
	$('#confirmation').hide();
	$("input[name='age']").change(function(){
		var age = $("input[name='age']:checked").val();
		if(age == 0){
			$('#guardian_info').show();
		}else{
			$('#guardian_info').hide();
		}
	});
	var allowed = 1;
	$('#group_auto').mousedown(function(){
		allowed = 0;
	});
	
	$('#group_auto').on('click', '.search_result', function(){
		$("#group_search input").val($(this).data().name);
		$('#group_auto').html('');
		$('#group_auto').hide();
	});
	
	$('.tool').click(function(){
		$(this).toggleClass('selected unselected');
		$('.checked', this).toggleClass('show noshow');
		toggleCheckbox($('input[name="tools"]', this));
		$('input[name="tools"]')
	});
	
	$.getJSON('/groups.js', function(data){
		groups = data;
		for (var i=0; i<groups.length; i++){
			group_split[i] = groups[i].name.toLowerCase().split(/[ -]/);
		}
	});
	
	$('#group_search input').keyup(function(){
		search_and_show($('#group_search input').val());
	});
	
	$('#group_search input').blur(function(){
		if (allowed){
			$('#group_auto').html('');
			$('#group_auto').hide();
		}
		allowed = 1;
	});
	
	$('.check_box').click(function(event){
		$(this).toggleClass('checked_box');
		toggleCheckbox($('.check_box_inner', this));
	});
	
	$('.form_more').click(function(){
		var form_content = $('.form_extended_info', $(this).parent());
		var extend = false;
		if($(this).parent().attr('id') == 'media'){
			extend = form_content.toggleClass('media_extended').hasClass('media_extended');
		}else if($(this).parent().attr('id') == 'liability') {
			extend = form_content.toggleClass('liability_extended').hasClass('liability_extended');
		}
		
		if(extend){
			$('p', this).html('less');
		}else{
			$('p', this).html('more');
		}
	});
	$('#accommodation_check').click(function(){
		
		if( $('input[name="accommodations"]').is(':checked')){
			$('#accommodation_info').show();
		}else{
			$('#accommodation_info').hide();
		}
	});
});