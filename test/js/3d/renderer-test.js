'use strict';

import Renderer from '../../../src/3d/renderer.js';

export default class RendererTest {

	static runAll() {
		console.log(`%c----- Testing src/math/renderer.js -----`,'color:blue;');
		console.time('Perf');

		RendererTest.testDefaultConstruction();

		console.timeEnd('Perf');
		console.log(`%c----------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const r = new Renderer();
		console.assert(r.id != '', 'Default construction does not work.');
	}
}

