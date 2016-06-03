'use strict';

const HTTP = require('http');
const PATH = require('path');
const URL = require('url');

const FILE_HANDLER = require('./file-handler.js')
const ROLLUP_HANDLER = require('./rollup-handler.js')

const DEFAULT_ROOT_DIRECTORY = process.cwd();
const DEFAULT_PORT = 8888;

class Server extends HTTP.Server {

	constructor(root_dir = DEFAULT_ROOT_DIRECTORY, port = DEFAULT_PORT) {
		super();
		this._root = root_dir;
		this._port = parseInt(port, 10);
		this._routes = new Array();
		this.on('request', this._requestHandler);
	}

	start() {
		this.listen(this._port);
		console.log(`WebServer listening on port ${this._port}.`);
	}

	addRoute(regexp, handler) {
		if(regexp == '*') {
			this._default_handler = handler;
			return;
		}

		this._routes.push({
			regexp: new RegExp(regexp),
			handler: handler
		});
	}

	_requestHandler(request, response) {
		const url = URL.parse(request.url);
		const path = url.pathname;
		const now = new Date();

		console.log(`${now.toString()} : ${path}`);

		let handler = this._default_handler;

		for(let route of this._routes) {
			if(route.regexp.test(path)) {
				handler = route.handler;
				break;
			}
		};

		handler.handle(this._root, path, response)
			.catch((error) => { Server.write404(error, response) });
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
server.addRoute('*', FILE_HANDLER);
server.addRoute('^.*.js?$', ROLLUP_HANDLER);
server.start();

