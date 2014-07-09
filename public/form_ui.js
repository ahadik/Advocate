function processUserInput(formApp, socket) {
	var orgtype = $('input[name="organization"]:checked').val();
	var orgname = $('#orgname').val();
	var emailAddress = $('#emailAddress').val();
	var systemMessage;

	formApp.sendMessage(orgtype ,orgname,emailAddress);
	
	$('input[name="organization"]:checked').attr('checked',false);
	$('#orgname').val('');
	$('#emailAddress').val('');
}

var socket = io.connect();


	var formApp = new Form(socket);
	
		
	function formSubmission(){
		processUserInput(formApp, socket);
		toggleDialogue();
		return false;
	}
