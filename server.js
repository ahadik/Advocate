var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var port = Number(process.env.PORT || 5000);
var root = __dirname;
var entries = [];

var server = http.createServer(function(req, res){
	var url = parse(req.url);
	var path = join(root, url.pathname);
	if(url.pathname == '/'){
		path = join(root, '/index.html');
	}
	
	if(url.pathname == '/submits'){
		res.writeHead(200, {"Content-Type": "text/plain"});
		
		var data = "";
		for(entry in entries){
			data+=entries[entry].orgType+", "+entries[entry].orgName+", "+entries[entry].email+"\n";
		} 
		
		res.write(data);
		res.end();
	}else{	
		fs.stat(path, function(err, stat){
			if(err){
				
				if('ENOENT' == err.code) {
					res.statusCode = 404;
					res.end('Not Found');
				}else{
					res.statusCode = 500;
					res.end('Internal Server Error');
				}
			} else{
				res.setHeader('Content-Length', stat.size);
				var stream = fs.createReadStream(path);
				stream.pipe(res);
				stream.on('error', function(err){
					res.statusCode = 500;
					res.end('Internal Server Error');
				});
			}
		});
	}
});

server.listen(port, function(){
	console.log('Listening on port: ' + port);
});

var formServer = require('./lib/form_server');
formServer.listen(server, entries);