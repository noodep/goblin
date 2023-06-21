/**
 * @file basic webserver
 *
 * @author noodep
 * @version 0.26
 */

import http from 'http';
import https from 'https';
import path from 'path';
import url from 'url';

const DEFAULT_ROOT_DIRECTORY = process.cwd();
const DEFAULT_PORT = 8888;

const makeServer = BaseClass => class S extends BaseClass {

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
		const request_url = url.parse(request.url);
		const pathname = request_url.pathname;
		const now = new Date();

		console.log(`${now.toString()} : ${request_url.path}`);

		let handler = this._default_handler;

		for(let route of this._routes) {
			if(route.regexp.test(pathname)) {
				handler = route.handler;
				break;
			}
		};

		handler.handle(this._root, pathname, response, request)
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

export const Server = makeServer(http.Server);
export const SSLServer = makeServer(https.Server);
