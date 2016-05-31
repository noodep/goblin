'use strict';

const ROLLUP = require('rollup');
const FS = require('fs');

class RollupHandler {
	constructor() {}

	static handle(path, response) {
		console.log('rolluped :', path);
		return Promise.resolve(true);
	}
}

module.exports = RollupHandler;