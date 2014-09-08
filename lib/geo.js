var http = require('http');
var request = require('request');

//Given a ZIP code, create a location object with city, state, and lat/long
exports.createLocationfromZip = function(zipCode, callback){
	var location = {};
	
	request('http://zip.getziptastic.com/v2/US/'+zipCode, function(error, response, body){

		
		var data = JSON.parse(body);
		//set the city and state objects of the location object using the city and state retrieved from ZIP API
		location.city = data.city;
		location.state = data.state_short;
		
		//get lat and long and set it as elements in location object
		var latLong = geofromZIP(zipCode, function(latLong){
			location.latitude = latLong[0];
			location.longitude = latLong[1];
			//return location object
			callback(location);
		});		
	});
}

//Given a city and a state, create a location object with city, state, and lat/long
exports.createLocationfromCityState = function(city, state, callback){
	geofromCityState(city, state, function(latLong){
			var location = {city : city, state : state, latitude : latLong[0], longitude : latLong[1]};
			console.log(location);
			callback(location);
	});
}

exports.createLocationfromAddress = function(city, state, zip, street){
	geofromAddress(zip, street, function(latLong){
		var location = {city : city, state : state, street : street, latitude : latLong[0], longitude : latLong[1]};
	})
}

//Given a city and state, return the latitude and longitude
function geofromCityState(city, state, callbackFunc){
	console.log(city);
	console.log(state);
	request('https://maps.googleapis.com/maps/api/geocode/json?address='+city+',+'+state+'&key=AIzaSyCP9syBFfHu5zfVSavGJLWS3f8bzL5mKMI', function(error, response, body) {
		var latLong = new Array(2);
		var geoData = JSON.parse(body);
		latLong[0] = geoData.results[0].geometry.location.lat;
		latLong[1] = geoData.results[0].geometry.location.lng;
		callbackFunc(latLong);
	});

	var options = {
		host : 'https://maps.googleapis.com',
		path : '/maps/api/geocode/json?address='+city+',+'+state+'&key=AIzaSyCP9syBFfHu5zfVSavGJLWS3f8bzL5mKMI'
	}
}

//Given a ZIP, return the latitude and longitude (more specific than city/state)
function geofromZIP(zip, callback){
	request('https://maps.googleapis.com/maps/api/geocode/json?address='+zip+'&key=AIzaSyCP9syBFfHu5zfVSavGJLWS3f8bzL5mKMI', function(error, response, body){
			var data = JSON.parse(body);
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
	request(addrRequest, function(error, response, body){
		var data = JSON.parse(body);
		var latLong = [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng];
		callback(latLong);
	});
}