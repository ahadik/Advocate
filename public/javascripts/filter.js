var filters = {
}

function collect(){
	var parameters=[];
	var values = [];
	for(var filter in filters){
		parameters.push(filter);
		values.push(filters[filter]);
	}
	return [parameters,values];
}

function filter(ref, obj){
	$(obj, ref).hide();
	var filter_combo = '';
	
	for(var filter in filters){
		for(var i=0;i<filters[filter].length; i++){
			filter_combo += obj+'['+filter+' = "'+filters[filter][i]+'"], ';
		}
	}
	filter_combo = filter_combo.slice(0,-2);
	$(filter_combo, ref).show();
}

function full(obj, ref, selector){
	$(obj).show();
	$(selector).removeClass('filter_selected');
	$(this).addClass('filter_selected');
}