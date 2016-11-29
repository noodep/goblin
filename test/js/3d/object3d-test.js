'use strict';

import Object3D from 'src/3d/object3d.js';

export default class Object3DTest {

	static runAll() {
		console.log(`%c----- Testing src/math/object3d.js -----`,'color:blue;');
		console.time('Perf');

		Object3DTest.testDefaultConstruction();

		console.timeEnd('Perf');
		console.log(`%c----------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const r = new Object3D();
		console.assert(r.id != '', 'Default construction does not work.');
	}
}

