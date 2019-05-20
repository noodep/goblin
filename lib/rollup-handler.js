'use strict';

const ROLLUP = require('rollup');
const PATH = require('path');
const FS = require('fs');

class RollupHandler {
	constructor(options) {
		this._options = options;
	}

	handle(root, path, response) {
		const atoms = path.split('+');
		const entry_point = PATH.join(root, atoms[0]);

		console.log('Bundling javascript entry point :', entry_point);

		const in_options = Object.assign({input: entry_point}, this._options);
		const out_options = {format: 'es'};


		return ROLLUP.rollup(in_options)
			.then(bundle => bundle.generate(out_options))
			.then(({ output }) => this._writeResponse(response, output[0]));
	}

	_writeResponse(response, result) {
		response.writeHead(200, { 'Content-Type': 'application/javascript' });
		response.write(result.code);
		response.end();
	}
}

module.exports = RollupHandler

