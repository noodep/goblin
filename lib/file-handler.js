'use strict';

const PATH = require('path');
const FS = require('fs');

const DEFAULT_INDEX = 'index.html';
const DEFAULT_MIME_TYPE = 'text/plain';

const MIME_TYPES = {
	'.txt': 'text/plain',
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript'
}

class FileHandler {
	constructor() {
	}

	handle(root, path, response) {
		return FileHandler.qualify(root, path)
			.then(FileHandler.checkAccess)
			.then(FileHandler.sendFile.bind(null, response));
	}

	static qualify(root, path) {
		return new Promise((resolve, reject) => {
			let full_path = PATH.join(root, path);
			FS.stat(full_path, (error, stats) => {
				if(error) {
					reject(error);
					return;
				}

				if(stats.isDirectory()) {
					full_path = PATH.join(full_path, DEFAULT_INDEX);
				}

				resolve(full_path);
			});
		});
	}

	static checkAccess(path) {
		return new Promise((resolve, reject) => {
			FS.access(path, FS.F_OK | FS.R_OK, (error) => {
				if(error) {
					reject(error);
					return;
				}
				resolve(path);
			});
		});
	}

	static sendFile(response, path) {
		let stream = FS.createReadStream(path);
		let mime_type = PATH.extname(path);

		response.writeHead(200, {
			'Content-Type': MIME_TYPES[mime_type] || DEFAULT_MIME_TYPE
		});

		stream.pipe(response);
	}

}

module.exports = FileHandler;

