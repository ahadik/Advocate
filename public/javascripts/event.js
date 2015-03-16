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
	}
	
}


function verify_send(){
	$('p.confirmation_text').html('A confirmation email has been sent to</br> '+$("input[name='email']").val()+'.');
	$('#form_body').fadeOut();
	$('#confirmation').fadeIn();
}

$(document).ready(function(){	
	$('#group_auto').hide().css({top: $('#groups').position().top+140+'px', left: $('#groups').css('margin-left')});
	$('#confirmation').hide();
	$("input[name='age']").blur(function(){
		var age = $("input[name='age']").val();
		
		if (isNumber(age)){
			$("input[name='age']").removeClass('bad_input');
			if(age < 18){
				$('#conditional_info').show();
			}else{
				$('#conditional_info').hide();
			}
		}else{
			$("input[name='age']").addClass('bad_input');
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
	
});