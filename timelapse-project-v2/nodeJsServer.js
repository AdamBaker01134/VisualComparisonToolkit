/*
For use with node.js
Provides a simple framework for serving up a webpage from your local domain.
Port is specified in the last line: '.listen(30500)'
*/
var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (req, res) {
	var displayContentsHTML = function (err, contents) {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/html' });
			return res.end('404 Not Found');
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write(contents);
		return res.end();
	}

	var q = url.parse(req.url, true);

	// Specify the default 'homepage' for your server.
	if (q.pathname === '/') {
		fs.readFile('./timelapse.html', displayContentsHTML);
	} else {
		// If a specific page is specified, try to open it.
		var filename = '.' + q.pathname;
		fs.readFile(filename, displayContentsHTML);
	}

}).listen(30500);

