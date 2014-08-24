
var dropdownIndicator = {'settingsDropdown' : 0, 'notifDropdown' : 0};
var bodyElem = document.body;
bodyElem.onclick = function(){
	if(dropdownIndicator['settingsDropdown']){
		toggleDropdown('settingsDropdown');
	}
	if(dropdownIndicator['notifDropdown']){
		toggleDropdown('notifDropdown');
	}
};

settingsDd = document.getElementById('settingsDropdown');
notifDd = document.getElementById('notifDropdown');
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