/*
 * GET home page.
 */

exports.index = function(req, res){
	if(req.user){
		console.log("LOGGED IN USER: "+JSON.stringify(req.user));
	}
  res.render('index', { title: 'Express' });
};