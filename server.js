var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var port = Number(process.env.PORT || 5000);
var root = __dirname;
var formServer = require('./lib/form_server');
var entries = [];


var server = http.createServer(function(req, res){
	var url = parse(req.url);
	var path = join(root, url.pathname);
	if(url.pathname == '/'){
		path = join(root, '/index.html');
	}
	
	if(url.pathname == '/submits'){
		res.statusCode = 200;
		res.setHeader('Content-Type:', 'text/html');
		formServer.report(function(data){
		
			var dataHTML = "<html>" +
							"<head>"+
							"<title>Advocate Form Submissions</title>"+
							"<link rel=\"stylesheet\" href=\"public/backend_style.css\" title=\"Advocate Backend Styling\" type=\"text/css\" media=\"screen\" charset=\"utf-8\">"+
							"</head>" +
							"<body>"+
							"<h1>Advocate</h1>"+
							"<h2>Interest Form Submissions</h2>"+
							"<table><thead><tr><td>Organization Type</td><td>Organization Name</td><td>Contact Email</td></tr></thead><tbody>";
			for (row in data){
				dataHTML+="<tr><td>"+data[row].orgtype+"</td>";
				dataHTML += "<td>"+data[row].orgname+"</td>";
				dataHTML += "<td><a href=\"mailto:"+data[row].email+"\">"+data[row].email+"</a></td></tr>";
			}
			
			dataHTML+="</tbody></table>"+
						"</body>"+
						"</html>";
						
			res.end(dataHTML);
		});
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

formServer.listen(server);