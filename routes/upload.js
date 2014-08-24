var crypto = require('crypto');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

exports.sign = function(req, res, S3_BUCKET){
	var object_name = req.query.s3_object_name;
	
    //var object_name = req.query.s3_object_name;
    var mime_type = req.query.s3_object_type;

    var now = new Date();
    var expires = Math.ceil((now.getTime() + 100000)/1000); // 100 seconds from now
    var amz_headers = "x-amz-acl:public-read";

    var put_request = "PUT\n\n"+mime_type+"\n"+expires+"\n"+amz_headers+"\n/"+S3_BUCKET+"/"+object_name;

    var signature = crypto.createHmac('sha1', AWS_SECRET_KEY).update(put_request).digest('base64');
    signature = encodeURIComponent(signature.trim());
    signature = signature.replace('%2B','+');

	console.log("OBJECT NAME: "+object_name);

    var url = 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+object_name;

    var credentials = {
        signed_request: url+"?AWSAccessKeyId="+AWS_ACCESS_KEY+"&Expires="+expires+"&Signature="+signature,
        url: url
    };
    res.write(JSON.stringify(credentials));
    res.end();
}

exports.submit_form = function(req, res){
    username = req.body.username;
    full_name = req.body.full_name;
    avatar_url = req.body.avatar_url;
    //res.redirect('/');
	// update_account(username, full_name, avatar_url); // TODO: create this function
    // TODO: Return something useful or redirect
}