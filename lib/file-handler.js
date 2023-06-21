/**
 * @file development webserver file handler
 *
 * @author noodep
 * @version 0.26
 */


import path from 'path';
import fs from 'fs';

const DEFAULT_INDEX = 'index.html';
const DEFAULT_MIME_TYPE = 'text/plain';

const MIME_TYPES = {
	'.txt': 'text/plain',
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript'
}

export default class FileHandler {
	constructor({ mime_types = {} } = {}) {
		this._mime_types = mime_types;
	}

	handle(root, pathname, response) {
		return FileHandler.qualify(root, pathname)
			.then(FileHandler.checkAccess)
			.then(this.sendFile.bind(this, response));
	}

	static qualify(root, pathname) {
		return new Promise((resolve, reject) => {
			let full_path = path.join(root, pathname);
			fs.stat(full_path, (error, stats) => {
				if(error) {
					reject(error);
					return;
				}

				if(stats.isDirectory()) {
					full_path = path.join(full_path, DEFAULT_INDEX);
				}

				resolve(full_path);
			});
		});
	}

	static checkAccess(pathname) {
		return new Promise((resolve, reject) => {
			fs.access(pathname, fs.F_OK | fs.R_OK, (error) => {
				if(error) {
					reject(error);
					return;
				}
				resolve(pathname);
			});
		});
	}

	sendFile(response, pathname) {
		const stream = fs.createReadStream(pathname);
		const extension = path.extname(pathname);
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
