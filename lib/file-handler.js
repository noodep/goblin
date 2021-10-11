/**
 * @file Dev webserver file handler.
 *
 * @author noodep
 * @version 0.21
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

	sendFile(request, response, path, size) {
		const extension = PATH.extname(path);
		const mime_type = this._getContentType(extension);

		const headers = {
			'Content-Type': mime_type
		};

		let stream, status;

		if (request.headers.range) {
			const range = request.headers.range;
			const RANGE_REGEX = /bytes=(\d+)-(\d+)*/;
			const matches = range.match(RANGE_REGEX);
			const start = parseInt(matches[1]) || 0;
			//let end = parseInt(matches[2]) || start +  16777216;
			let end = parseInt(matches[2]) || start +  67108864;
			if(end >= size)
				end = size-1;

			headers['Accept-Ranges'] = 'bytes';
			headers['Content-Length'] = end - start + 1;
			headers['Content-Range'] = `bytes ${start}-${end}/${size}`

			stream = FS.createReadStream(path, {start: start, end: end});
			status = 206;
		} else {

			headers['Content-Length'] = size;
			stream = FS.createReadStream(path);
			status = 200;
		}

		console.log(headers);

		response.writeHead(status, headers);
		stream.pipe(response);
	}

	_getContentType(extension) {
		return this._mime_types[extension] || MIME_TYPES[extension] || DEFAULT_MIME_TYPE;
	}

}

module.exports = FileHandler;
