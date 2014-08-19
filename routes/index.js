/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log("CONNECT");
	if(req.user){
		console.log("LOGGED IN USER: "+JSON.stringify(req.user));
	}
  res.render('index', { user : req.user });
};