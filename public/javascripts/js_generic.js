var toggleIndicator = 0;
var dropdownIndicator = {'settingsDropdown' : 0, 'notifDropdown' : 0};

$(".overlay").hide();

$(document.body).click(function(){
	if(dropdownIndicator['settingsDropdown']){
		toggleDropdown('settingsDropdown');
	}
	if(dropdownIndicator['notifDropdown']){
		toggleDropdown('notifDropdown');
	}
});

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

function toggleDropdown(id){
	$('#'+id).fadeToggle("fast", "linear", function(){
		if(dropdownIndicator[id]){
			dropdownIndicator[id]=0;
		}else{
			dropdownIndicator[id]=1;
		}
	});
}