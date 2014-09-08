//Given a ZIP code, create a location object with city, state, and lat/long
function createLocationfromZIP(zipCode, callback){
	var location = {};
	//use ZIP for ziptastic API request to get city and state
	$.getJSON('http://zip.getziptastic.com/v2/US/'+zipCode, function(data){
		//use found city and state to get latitude and longitude
		location.city = data.city;
		location.state = data.state_short;
		
		geofromZIP(zipCode, function(latLong){
			location.latitude = latLong[0];
			location.longitude = latLong[1];
			callback(location);
		});
	});
}

//Given a city and a state, create a location object with city, state, and lat/long
function createLocationfromCityState(city, state, callback){
	geofromCityState(city, state, function(latLong){
		return {city : city, state : state, latitude : latLong[0], longitude : latLong[1]};
	});
}

//Given a city and state, return the latitude and longitude
function geofromCityState(city, state, callback){
	$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='+city+',+'+state+'&key=AIzaSyCP9syBFfHu5zfVSavGJLWS3f8bzL5mKMI', function(data){
		var latLong = [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng];
		callback(latLong);
	});
}

//Given a ZIP, return the latitude and longitude (more specific than city/state)
function geofromZIP(zip, callback){
	$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address='+zip+'&key=AIzaSyCP9syBFfHu5zfVSavGJLWS3f8bzL5mKMI', function(data){
		var latLong = [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng];
		callback(latLong);
	});
}

function geofromAddress(zip, street, callback){
	var address = street.split(' ');
	var addrRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
	for(word in address){
		addrRequest+=address[word]+',+';
	}
	addrRequest+=zip+'&key=AIzaSyCP9syBFfHu5zfVSavGJLWS3f8bzL5mKMI';
	
	$.getJSON(addrRequest, function(data){
		var latLong = [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng];
		callback(latLong);
	});
}