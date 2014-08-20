function findCityState(){
	if($('#zipCode').val().length==5){
		createLocationfromZIP($('#zipCode').val(), function(location){
			$('#geoLocation').html('<h2>Location:</h2><p>'+location.city+'</p>\n<p>'+location.state+'</p>');
		});
	}
}