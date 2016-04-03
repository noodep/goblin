'use strict';

const HTTP = require('http');
const PATH = require('path');
const URL = require('url');
const FS = require('fs');

const DEFAULT_ROOT_DIRECTORY = process.cwd();
const DEFAULT_PORT = 8888;
const DEFAULT_INDEX = 'index.html';
const DEFAULT_MIME_TYPE = 'text/plain';

const MIME_TYPES = {
	'.txt': 'text/plain',
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript'
}

class Server extends HTTP.Server {

	constructor(root_dir = DEFAULT_ROOT_DIRECTORY, port = DEFAULT_PORT) {
		super();
		this._root = root_dir;
		this._port = parseInt(port, 10);
		this.on('request', this._requestHandler);
	}

	start() {
		this.listen(this._port);
		console.log(`WebServer listening on port ${this._port}.`);
	}

	_requestHandler(request, response) {
		let url = URL.parse(request.url);
		let path = PATH.join(this._root, url.pathname);
		let now = new Date();

		// If requests is a directory, look for DEFAULT_INDEX file
		if(path.endsWith('/'))
			path = PATH.join(path, DEFAULT_INDEX);

		console.log(`${now.toString()} : ${path}`);

		Server.checkAccess(path)
			.then(() => { Server.sendFile(path, response); })
			.catch((error) => { Server.write404(error, response) });
	}

	static checkAccess(path) {
		return new Promise((resolve, reject) => {
			FS.access(path, FS.F_OK | FS.R_OK, (error) => {
				if(error)
					reject();

				resolve();
			});
		});
	}

	static sendFile(path, response) {
		let stream = FS.createReadStream(path);
		let mime_type = PATH.extname(path);

		response.writeHead(200, {
			'Content-Type': MIME_TYPES[mime_type] || DEFAULT_MIME_TYPE
		});

		stream.pipe(response);
	}

	static write404(error, response) {
		console.log(`Error : ${error}.`);

		response.writeHead(404, {
			'Content-Type': 'text/html'
		});
		response.write('<h1>File not found.<h1>');
		response.end();
	}

}

const server = new Server(process.argv[2], process.argv[3]);
server.start();

