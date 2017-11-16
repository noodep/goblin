'use strict';

const ROLLUP = require('rollup');
const PATH = require('path');
const FS = require('fs');

class RollupHandler {
	constructor({ plugins = [] }) {
		this._plugins = plugins;
	}

	handle(root, path, response) {
		const atoms = path.split('+');
		const entry_point = PATH.join(root, atoms[0]);

		console.log('Bundling javascript entry point :', entry_point);

		const in_options = {
			input: entry_point,
			plugins: this._plugins,
		};
		const out_options = {
			format: 'es'
		};


		return ROLLUP.rollup(in_options)
			.then(bundle => bundle.generate(out_options))
			.then(result => this._writeResponse(response, result));
	}

	_writeResponse(response, result) {
		response.writeHead(200, { 'Content-Type': 'application/javascript' });
		response.write(result.code);
		response.end();
	}
}

module.exports = RollupHandler

