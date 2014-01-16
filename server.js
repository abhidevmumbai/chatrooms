var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mime = require('mime'),
	cache = {},
	port = 3000;


/* Handle 404 errors */
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found');
	response.end();
}

/* Handle serving file data */
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

/* Serving static files form cache if present else read them from disk */
function serveStatic(response, cache, absPath) {
	// Check if present in cache
	if(cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			// Check if file exists
			if(exists) {
				// Serve file read from disk
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

/*****
	Create HTTP server, using anonymous function to define per-request behavior 
*****/
var server = http.createServer(function(request, response) {
	var filePath = false;

	// Determine HTML file to be served by default
	switch(request.url) {
		case '/': filePath = 'public/index.html';
		break;
		default: filePath = 'public' + request.url;
		break;
	}
	// Translate URL path to relative file path
	var absPath = './' + filePath;

	// Serve the static file
	serveStatic(response, cache, absPath);
});

server.listen (port, function() {
	console.log('Server is listening on port :'+ port);
});

/*****
	Setting up the socket.io chat server
*****/
var chatServer = require('./lib/chat_server');
chatServer.listen(server);