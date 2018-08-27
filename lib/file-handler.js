/**
 * @file Dev webserver file handler.
 *
 * @author noodep
 * @version 0.19
 */

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
	constructor({ mime_types = {} } = {}) {
		this._mime_types = mime_types;
	}

	handle(root, path, response) {
		return FileHandler.qualify(root, path)
			.then(FileHandler.checkAccess)
			.then(this.sendFile.bind(this, response));
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

	sendFile(response, path) {
		const stream = FS.createReadStream(path);
		const extension = PATH.extname(path);
		const mime_type = this._getContentType(extension);

		response.writeHead(200, {
			'Content-Type': mime_type
		});

		stream.pipe(response);
	}

	_getContentType(extension) {
		return this._mime_types[extension] || MIME_TYPES[extension] || DEFAULT_MIME_TYPE;
	}

}

module.exports = FileHandler;

