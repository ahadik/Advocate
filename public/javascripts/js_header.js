
var dropdownIndicator = {'settingsDropdown' : 0, 'notifDropdown' : 0, 'orgDropdown' : 0};
var bodyElem = document.body;
window.onclick = function(){
	if(dropdownIndicator['settingsDropdown']){
		toggleDropdown('settingsDropdown');
	}
	if(dropdownIndicator['notifDropdown']){
		toggleDropdown('notifDropdown');
	}
	if(dropdownIndicator['orgDropdown']){
		toggleDropdown('orgDropdown');
	}
};

settingsDd = document.getElementById('settingsDropdown');
notifDd = document.getElementById('notifDropdown');
orgDd = document.getElementById('orgDropdown');
if(orgDd){
	orgDd.addEventListener("click", stopEvent, false);
}
settingsDd.addEventListener("click", stopEvent, false);
notifDd.addEventListener("click", stopEvent, false);


function stopEvent(ev) {
	ev.stopPropagation();
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