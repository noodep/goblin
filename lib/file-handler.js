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

	static handle(root, path, response) {
		// If requests is a directory, look for DEFAULT_INDEX file
		if(path.endsWith('/'))
			path = PATH.join(path, DEFAULT_INDEX);

		path = PATH.join(root, path);

		console.log(path);
		return FileHandler.checkAccess(path)
			.then(() => { FileHandler.sendFile(path, response); });
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

}

module.exports = FileHandler;

