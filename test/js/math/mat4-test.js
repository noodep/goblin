'use strict';

import {epsilon32Equals as ee, randomFloat32 as rf32} from '../test-utils.js';
import Mat4 from '/src/math/mat4.js';
import Vec3 from '/src/math/vec3.js';

export default class Mat4Test {

	static runAll() {
		console.log(`%c----- Testing /src/math/mat4.js -----`,'color:blue;');
		console.time('Perf');

		Mat4Test.testDefaultConstruction();
		Mat4Test.testIndentityConstruction();
		Mat4Test.testTranslate();
		Mat4Test.testTranslateX();
		Mat4Test.testTranslateY();
		Mat4Test.testTranslateZ();

		console.timeEnd('Perf');
		console.log(`%c------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const m = new Mat4();
		console.assert(
			matrixEquals(m,
				0.0,0.0,0.0,0.0,
				0.0,0.0,0.0,0.0,
				0.0,0.0,0.0,0.0,
				0.0,0.0,0.0,0.0
			),
			'Default construction does not return a null matrix.'
		);
	}

	static testIndentityConstruction() {
		const m = Mat4.identity();
		console.assert(
			matrixEquals(m,
				1.0,0.0,0.0,0.0,
				0.0,1.0,0.0,0.0,
				0.0,0.0,1.0,0.0,
				0.0,0.0,0.0,1.0
			),
			'Identity construction does not return a matrix set to identity.'
		);
	}

	static testTranslate() {
		const m = Mat4.identity();
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v = new Vec3(x,y,z);
		m.translate(v);
		console.assert(
			matrixEquals(m,
				1.0,0.0,0.0,x,
				0.0,1.0,0.0,y,
				0.0,0.0,1.0,z,
				0.0,0.0,0.0,1.0
			),
			'Translation by a vector failed.'
		);
	}

	static testTranslateX() {
		const m = Mat4.identity();
		const x = rf32();
		m.translateX(x);
		console.assert(
			matrixEquals(m,
				1.0,0.0,0.0,x,
				0.0,1.0,0.0,0.0,
				0.0,0.0,1.0,0.0,
				0.0,0.0,0.0,1.0
			),
			'Translation along X axis failed.'
		);
	}

	static testTranslateY() {
		const m = Mat4.identity();
		const y = rf32();
		m.translateY(y);
		console.assert(
			matrixEquals(m,
				1.0,0.0,0.0,0.0,
				0.0,1.0,0.0,y,
				0.0,0.0,1.0,0.0,
				0.0,0.0,0.0,1.0
			),
			'Translation along Y axis failed.'
		);
	}

	static testTranslateZ() {
		const m = Mat4.identity();
		const z = rf32();
		m.translateZ(z);
		console.assert(
			matrixEquals(m,
				1.0,0.0,0.0,0.0,
				0.0,1.0,0.0,0.0,
				0.0,0.0,1.0,z,
				0.0,0.0,0.0,1.0
			),
			'Translation along Z axis failed.'
		);
	}
}

function matrixEquals(m, e11, e12, e13, e14, e21, e22, e23, e24, e31, e32, e33, e34, e41, e42, e43, e44) {
	return ee(m._m[0], e11) && ee(m._m[4], e12) && ee(m._m[8], e13) && ee(m._m[12], e14) &&
		ee(m._m[1], e21) && ee(m._m[5], e22) && ee(m._m[9], e23) && ee(m._m[13], e24) &&
		ee(m._m[2], e31) && ee(m._m[6], e32) && ee(m._m[10], e33) && ee(m._m[14], e34) &&
		ee(m._m[3], e41) && ee(m._m[7], e42) && ee(m._m[11], e43) && ee(m._m[15], e44);
}

