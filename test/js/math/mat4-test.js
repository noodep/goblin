'use strict';

import Mat4 from '../../../src/math/mat4.js';

export default class Mat4Test {

	static runAll() {
		console.log(`%c----- Testing src/math/mat4.js -----`,'color:blue;');
		console.time('Perf');

		Mat4Test.testDefaultConstruction();
		Mat4Test.testIndentityConstruction();

		console.timeEnd('Perf');
		console.log(`%c------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const m = new Mat4();
		console.assert(
			m._m[0] == 0.0 && m._m[1] == 0.0 && m._m[2] == 0.0 && m._m[3] == 0.0 &&
			m._m[4] == 0.0 && m._m[5] == 0.0 && m._m[6] == 0.0 && m._m[7] == 0.0 &&
			m._m[8] == 0.0 && m._m[9] == 0.0 && m._m[10] == 0.0 && m._m[11] == 0.0 &&
			m._m[12] == 0.0 && m._m[13] == 0.0 && m._m[14] == 0.0 && m._m[15] == 0.0,
			'Default construction does not return a null matrix.'
		);
	}

	static testIndentityConstruction() {
		const m = Mat4.identity();
		console.assert(
			m._m[0] == 1.0 && m._m[1] == 0.0 && m._m[2] == 0.0 && m._m[3] == 0.0 &&
			m._m[4] == 0.0 && m._m[5] == 1.0 && m._m[6] == 0.0 && m._m[7] == 0.0 &&
			m._m[8] == 0.0 && m._m[9] == 0.0 && m._m[10] == 1.0 && m._m[11] == 0.0 &&
			m._m[12] == 0.0 && m._m[13] == 0.0 && m._m[14] == 0.0 && m._m[15] == 1.0,
			'Identity construction does not return a matrix set to identity.'
		);
	}
}
