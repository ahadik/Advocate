var toggleIndicator = 0;


$(".overlay").hide();

function preventHide(){
	toggleIndicator=2;
}

function toggleDialogue(){
	if(!toggleIndicator){
		$( ".overlay" ).fadeIn( "slow");
		toggleIndicator=1;
	}else if(toggleIndicator==2){
		toggleIndicator=1;
	}else{
		$( ".overlay" ).fadeOut( "slow");
		toggleIndicator=0;
	}
}