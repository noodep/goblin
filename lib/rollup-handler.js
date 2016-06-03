'use strict';

const ROLLUP = require('rollup');
const PATH = require('path');
const FS = require('fs');

class RollupHandler {
	constructor() {}

	static handle(root, path, response) {
		const atoms = path.split('+');
		const entry_point = PATH.join(root, atoms[0]);

		console.log('Bundling javascript entry point :', entry_point);

		return ROLLUP.rollup({
			entry: entry_point
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

