var path = require('path');
var fs = require('fs');
var join = path.join;
var formServer = require('../lib/form_server');

exports.list = function(req, res){ res.render('photos', {
  title: 'Photos',
  photos: photos });
};


exports.form = function(req, res){
	formServer.report(function(data){
		res.render('backend/registrations', {
			title: 'Advocate Interest Submissions',
			registrations: data
		});
	})
};

exports.submit = function (dir) {
  return function(req, res, next){
    var img = req.files.photo.image;
    var name = req.body.photo.name || img.name;
    var path = join(dir, img.name);

    fs.rename(img.path, path, function(err){
      if (err) return next(err);

      Photo.create({
        name: name,
        path: img.name
      }, function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  };
};

exports.download = function(dir){
  return function(req, res, next){
    var id = req.params.id;
    Photo.findById(id, function(err, photo){
      if (err) return next(err);
      var path = join(dir, photo.path);
      res.download(path, photo.name+'.jpeg');
    });
  };
};
