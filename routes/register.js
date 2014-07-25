var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');

exports.form = function(req, res){
	formServer.report(function(data){
		res.render('register', {});
	})
};