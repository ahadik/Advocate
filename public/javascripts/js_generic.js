var toggleIndicator = 0;
var videoIndicator = 0;

$(".overlay").hide();
$("#register").hide();
$("#login").hide();
$('#youTubeVideo').hide();

function preventHide(){
	toggleIndicator=2;
}

function toggleDialogue(modal){

	if(!toggleIndicator){
		$( modal ).fadeIn( "slow");
		toggleIndicator=1;
	}else if(toggleIndicator==2){
		toggleIndicator=1;
	}else{
		$( modal ).fadeOut( "slow");
		$('#register').fadeOut("slow");
		toggleIndicator=0;
	}
}

function registerModal(){
	toggleDialogue('#registerOver');
	$('#register').fadeIn("slow");
}

function loginModal(){
	toggleDialogue("#loginOver");
	$('#login').fadeIn("slow");
}


$('[placeholder]').focus(function() {
  var input = $(this);
  if (input.val() == input.attr('placeholder')) {
    input.val('');
    input.removeClass('placeholder');
  }
}).blur(function() {
  var input = $(this);
  if (input.val() == '' || input.val() == input.attr('placeholder')) {
    input.addClass('placeholder');
    input.val(input.attr('placeholder'));
  }
}).blur();

function swapVideo(){
	$('#youTubeOver').fadeOut(500, function(){
		$('#youTubeVideo').fadeIn(500);
		videoIndicator = 1;
	});
}

$('body').click(function(){
	if(videoIndicator){
		$('#youTubeVideo').fadeOut(500, function(){
			$('#youTubeOver').fadeIn(500);
			videoIndicator = 0;
		});
	}
});