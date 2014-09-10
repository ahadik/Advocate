/*
 * GET home page.
 */

exports.index = function(req, res, userData, organizations, notifs){
	if(req.isAuthenticated()){
		exports.renderProfilePages('main', req, res, {auth : true}, userData, organizations, notifs);
	}else{
		res.render('main', {auth: false});
	}
};