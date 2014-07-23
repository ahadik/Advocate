function processUserInput(formApp, socket) {
	var orgtype = $('input[name="organization"]:checked').val();
	var orgname = $('#orgname').val();
	var emailAddress = $('#emailAddress').val();
	var systemMessage;

	formApp.sendMessage(orgtype, orgname, emailAddress);
}

var socket = io.connect();


var formApp = new Form(socket);

	
function formSubmission(){

	var interestform = $('.validateInterest');
	var validBool = true;
	
	for(i=0; i<5; i++){
		if(!interestform[i].checkValidity()){
			validBool = false;
		}
	}
	if (validBool) {
		// If the form is invalid, submit it. The form won't actually submit;
		// this will just cause the browser to display the native HTML5 error messages.
		processUserInput(formApp, socket);
		toggleDialogue();
		clearFields();
  	}
  	return false;
}

function clearFields(){
	$('input[name="organization"]:checked').attr('checked',false);
	$('#orgname').val('');
	$('#emailAddress').val('');
}
