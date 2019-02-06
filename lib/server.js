/**
 * @file Development webservers.
 *
 * @author noodep
 * @version 0.15
 */

'use strict';

const HTTP = require('http');
const HTTPS = require('https');
const PATH = require('path');
const URL = require('url');

const DEFAULT_ROOT_DIRECTORY = process.cwd();
const DEFAULT_PORT = 8888;

const Server = BaseClass => class S extends BaseClass {

	constructor(root_dir = DEFAULT_ROOT_DIRECTORY, port = DEFAULT_PORT, options) {
		super(options);
		this._root = root_dir;
		this._port = parseInt(port, 10);
		this._routes = new Array();
		this.on('request', this._requestHandler);
	}

	start() {
		this.listen(this._port);
		console.log(`WebServer listening on port ${this._port}.`);
	}

	stop() {
		console.log('Shutting down...');
		this.close();
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

		console.log(`${now.toString()} : ${url.path}`);

		let handler = this._default_handler;

		for(let route of this._routes) {
			if(route.regexp.test(path)) {
				handler = route.handler;
				break;
			}
		};

		handler.handle(this._root, path, response, request)
			.catch((error) => { S.write404(error, response) });
	}

	static write404(error, response) {
		console.log(`Error : ${error}.`);

		response.writeHead(404, {
			'Content-Type': 'text/html'
		});
		response.write('<h1>Invalid request.<h1>');
		response.end();
	}
}

module.exports = {
	Server: Server(HTTP.Server),
	SSLServer: Server(HTTPS.Server)
};

