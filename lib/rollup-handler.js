'use strict';

const ROLLUP = require('rollup');
const INCLUDE_PATHS = require('rollup-plugin-includepaths');
const PATH = require('path');
const FS = require('fs');

const IP_OPTIONS = {
	include: {},
	paths: ['.'],
	external: [],
	extensions: ['.js']
};

class RollupHandler {
	constructor({ include_paths = IP_OPTIONS }) {
		this._include_path_options = include_paths;
	}

	handle(root, path, response) {
		const atoms = path.split('+');
		const entry_point = PATH.join(root, atoms[0]);

		console.log('Bundling javascript entry point :', entry_point);

		return ROLLUP.rollup({
			entry: entry_point,
			plugins: [INCLUDE_PATHS(this._include_path_options)]
		}).then((bundle) => {
			const result = bundle.generate();
			response.writeHead(200, {
				'Content-Type': 'application/javascript'
			});
			response.write(result.code);
			response.end();
		});
	}
}

module.exports = RollupHandler

