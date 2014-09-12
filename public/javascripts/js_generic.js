var toggleIndicator = 0;


$(".overlay").hide();
$("#register").hide();
$("#login").hide();

function preventHide(){
	toggleIndicator=2;
}

function toggleDialogue(modal){

	console.log("toggleDialogue");

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