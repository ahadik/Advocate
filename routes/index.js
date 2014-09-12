var account = require('../routes/account.js');
exports.index = function(req, res, userData, organizations, notifs){
	if(req.isAuthenticated()){
		account.renderProfilePages('main', req, res, {auth : true}, userData, organizations, notifs);
	}else{
		res.render('main', {auth: false});
	}
};