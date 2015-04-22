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
	
	var matched_elements = $(obj,ref);
	for(var filter in filters){
		var filter_combo = '';
		for(var i=0;i<filters[filter].length; i++){
			filter_combo += obj+'['+filter+' = "'+filters[filter][i]+'"], ';
		}
		filter_combo = filter_combo.slice(0,-2);
		filtered_results = $(filter_combo, ref);
		var temp_elements = [];
		for (var j=0; j<filtered_results.length; j++){
			if ($.inArray(filtered_results[j], matched_elements) != -1){
				temp_elements.push(filtered_results[j]);
			}
		}
		matched_elements = temp_elements;
	}
	
	$(matched_elements).show();
}

function full(obj, ref, selector){
	$(obj).show();
	$(selector).removeClass('filter_selected');
	$(this).addClass('filter_selected');
}