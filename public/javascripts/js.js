var headerImg = document.getElementById("headerGraphic");
var header = document.getElementById("header");

var $winwidth;
var $winheight;
var toggleIndicator = 0;

$(".overlay").hide();

if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    $winwidth = window.innerWidth;
    $winheight = window.innerHeight;
} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    $winwidth = document.documentElement.clientWidth;
    $winheight = document.documentElement.clientHeight;
} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    $winwidth = document.body.clientWidth;
    $winheight = document.body.clientHeight;
}

headerImg.style.height = $winwidth*.46875+"px";
header.style.height = $winwidth*.46875+10+"px";

function preventHide(){
	toggleIndicator=2;
}

function toggleDialogue(){

	console.log("toggleDialogue");

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

function twitterLogin(){
	location.href="/auth/twitter";
}