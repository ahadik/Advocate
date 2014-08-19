var socket = io.connect();
var formApp = new Form(socket);

socket.on('saveStatus', function(status){
	if(status.result){
		document.getElementById("saveButton").className = "buttonize blue centerBox";
		document.getElementById("saveButton").innerHTML = "SAVED";		
	}else{
		console.log("bad shit happened");
	}
});

//INPUT: the name of the form of interst, and the proper callback function to handle the data included in the form
//OUTPUT: Basic function to be called from any form in Advocate to be submitted by Socket.io (no page reload). This function performs HTML5 validation on all fields marked to be validated, and if it fails, the form is submitted, but will be prevented from submission by HTML5, triggering HTML5 form validation styling.
function formSubmission(formName, inputNames, callback){
	//Get array of all DOM elements marked for validation
	var interestform = $('.validateInterest');
	var validBool = true;
	//THIS NEEDS TO BE CHANGED - should loop through all elements marked for validation
	for(i=0; i<interestform.length; i++){
		//if any element does not pass validity, set validBool to false
		if(!interestform[i].checkValidity()){
			validBool = false;
		}
	}
	//If all elements passed validation
	if (validBool) {
		// If the form is invalid, submit it. The form won't actually submit;
		// this will just cause the browser to display the native HTML5 error messages.
		
		//Call the provided callback with the form name and the formApp object
		
		var fn = window[callback]; 
		/*
		if(typeof fn === 'function') {
			fn(formApp, formName, inputNames);
		}else{
			console.error("This callback is not a function");
		}
		*/
		callback(formApp, formName, inputNames);
		//processUserInput(formApp, socket);
  	}
  	return false;
}


//INPUT: name of the form
//OUTPUT: retrieve data from interest form and prepare it for broadcasting
function processInterestInput(formApp, formName) {
	var orgtype = $('input[name="organization"]:checked').val();
	var orgname = $('#orgname').val();
	var emailAddress = $('#emailAddress').val();
	var systemMessage;

	//call the sendMessage function with the data input and the callback function to toggle the dialogue and clear the fields
	formApp.sendMessage(orgtype, orgname, emailAddress, function(){
		toggleDialogue();
		clearFields();
	});
}

//INPUT: formApp object and name of form
//OUTPUT: process data from profile update and submit it for broadcasting
function updateUserProfile(formApp, formName, inputNames){
	//Get an array of selected interests and the input ZIP code
	var interests = getCheckedValues(formName, inputNames[0]);
	var zip = $('input[name="zipCode"]').val();
	
	//Submit data through updateProfile broadcast function
	formApp.updateProfile(interests, zip);
}

//Clear all fields in the interest form
function clearFields(){
	$('input[name="organization"]:checked').attr('checked',false);
	$('#orgname').val('');
	$('#emailAddress').val('');
}

//Given a form name, 
function getCheckedValues(formName, inputName){
	var options = [];
	for(option in document[formName][inputName]){
		if(document[formName][inputName][option].checked){
			options.push(document[formName][inputName][option].value);
		}
	}
	return options;
}

function checkUsername(){
	//DO SHIT HERE
}

function completionNotification(url){
	formApp.updateProfileEntry(url);
}