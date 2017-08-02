'use strict';

import {epsilon32Equals as ee, randomFloat32 as rf32} from 'test/js/test-utils.js';
import Vec2 from 'src/math/vec2.js';

export default class Vec2Test {

	static runAll() {
		console.log(`%c----- Testing src/math/vec3.js -----`,'color:blue;');
		console.time('Perf');

		Vec2Test.testDefaultConstruction();
		Vec2Test.testIdentityConstruction();
		Vec2Test.testArrayConstruction();
		Vec2Test.testZeroAssignement();
		Vec2Test.testRandomAssignement();
		Vec2Test.testSetters();
		Vec2Test.testEquals();
		Vec2Test.testIdentity();
		Vec2Test.testCopy();
		Vec2Test.testCloning();
		Vec2Test.testNullMagnitude();
		Vec2Test.testUnitMagnitude();
		Vec2Test.testNormalize();
		Vec2Test.testNegate();
		Vec2Test.testInvert();
		Vec2Test.testNullInvert();
		Vec2Test.testNullScaling();
		Vec2Test.testZeroScaling();
		Vec2Test.testIdentityScaling();
		Vec2Test.testMultiply();

		console.timeEnd('Perf');
		console.log(`%c------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const v = new Vec2();
		console.assert(vectorEquals(v, 0.0, 0.0), 'Default construction does not return a null vector.');
	}

	static testIdentityConstruction() {
		const v = Vec2.identity();
		console.assert(vectorEquals(v, 1.0, 1.0), 'Identity construction does not return an vector set to identity.');
	}

	static testArrayConstruction() {
		const x = rf32();
		const y = rf32();
		const v = Vec2.from([x, y]);
		console.assert(vectorEpsilonEquals(v, x, y), 'Assigned array construction failed.');
	}

	static testZeroAssignement() {
		const v = new Vec2(0.0, 0.0);
		console.assert(vectorEquals(v, 0.0, 0.0), 'Assigned construction (zeroes) failed.');
	}

	static testRandomAssignement() {
		const x = rf32();
		const y = rf32();
		const v = new Vec2(x,y);
		console.assert(vectorEpsilonEquals(v, x, y), 'Assigned construction failed.');
	}

	static testSetters() {
		var x = rf32(); var y = rf32();
		const v = Vec2.random();
		v.x = x;
		v.y = y;
		console.assert(vectorEpsilonEquals(v, x, y), 'XY setters do not assign properly.');
		x = rf32(); y = rf32();
		v.s = x;
		v.t = y;
		console.assert(vectorEpsilonEquals(v, x, y), 'ST setters do not assign properly.');
		x = rf32(); y = rf32();
		v[0] = x;
		v[1] = y;
		console.assert(vectorEpsilonEquals(v, x, y), 'Array setters do not assign properly.');
	}

	static testIdentity() {
		const v = new Vec2();
		v.identity();
		console.assert(v.x == 1.0 && v.y == 1.0, 'Identity does not set to identity.');
	}

	static testEquals() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v$1 = new Vec2(x, y);
		const v$2 = new Vec2(x, y);
		console.assert(v$1.equals(v$1), 'Equality test is not reflexive.');
		console.assert(v$1.equals(v$2) == v$2.equals(v$1), 'Equality test is not commutative.');

		console.assert(v$1.equals(v$2), 'Equality test gives false negative.');
		v$2.x = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive for x.');
		v$2.x = x;
		v$2.y = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive for y.');
		v$2.x = rf32();
		v$2.y = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive.');
	}

	static testCopy() {
		const v = Vec2.random();
		const v$copy = Vec2.random();
		v$copy.copy(v);
		console.assert(v$copy.equals(v), 'Copy failed.');
	}

	static testCloning() {
		const v = Vec2.random();
		const v$clone = v.clone();
		console.assert(v.equals(v$clone), 'Cloning failed.');
	}

	static testNullMagnitude() {
		const v = new Vec2();
		console.assert(v.magnitude() == 0.0, 'Magnitude of a null vector is different from zero.');
	}

	static testUnitMagnitude() {
		const vx = new Vec2(1.0, 0.0);
		const vy = new Vec2(0.0, 1.0);
		console.assert(vx.magnitude() == 1.0, 'Magnitude of a unit vector x is different from one.');
		console.assert(vy.magnitude() == 1.0, 'Magnitude of a unit vector y is different from one.');
	}

	static testNormalize() {
		const v = Vec2.random();
		v.normalize();
		console.assert(ee(v.magnitude(), 1.0), 'Magnitude of the normalized vector is different from one.');
	}

	static testNegate() {
		const v = Vec2.random();
		const nx = -v.x;
		const ny = -v.y;
		v.negate();
		console.assert(vectorEpsilonEquals(v, nx, ny), 'Negation failed.');
	}

	static testInvert() {
		const v = Vec2.random();

		const ix = Math.fround(1.0 / v.x);
		const iy = Math.fround(1.0 / v.y);
		v.invert();
		console.assert(vectorEpsilonEquals(v, ix, iy), 'Inversion failed.');
	}

	static testNullInvert() {
		const v = new Vec2();
		v.invert();
		console.assert(vectorEquals(v, Infinity, Infinity), 'Inverting a null vector does not return an Infinity vector.');
	}

	static testNullScaling() {
		const v = new Vec2();
		v.scale(rf32());
		console.assert(vectorEquals(v, 0.0, 0.0), 'Scaling a null vector by random scalar does not return a null vector.');
	}

	static testZeroScaling() {
		const v = Vec2.random();
		v.scale(0.0);
		console.assert(vectorEquals(v, 0.0, 0.0), 'Scaling a random vector by zero does not return a null vector.');
	}

	static testIdentityScaling() {
		const v = new Vec2();
		const s = rf32();
		v.identity();
		v.scale(s);
		console.assert(vectorEpsilonEquals(v, s, s), 'Scaling identity failed.');
	}

	static testMultiply() {
		const v$1 = Vec2.random();
		const v$2 = Vec2.random();
		const mx = v$1.x * v$2.x;
		const my = v$1.y * v$2.y;
		v$1.multiply(v$2);
		console.assert(vectorEpsilonEquals(v$1, mx, my), 'Multiplication failed.');
	}

	static testArrayPolymorphism() {
		const x = rf32();
		const y = rf32();
		const v = new Vec2(x, y);
		const arr = [x, y];
		console.assert(arr.length == v.length, 'Vec2 length not the same as corresponding array.');

		const v$from = Vec2.from(v);
		console.assert(v.equals(v$from), 'Passing Vec2 instance to from() does not work.');

		console.assert(Array.prototype.concat.call(v).length == 2, 'Vec2 is not concat() spreadable.');

		try {
			let count = 0;
			for (let elem of v) { count++; }
			console.assert(count == 2, 'Vec2 iterator yeilds wrong number of elements.');
		} catch (e) {
			console.error('Vec2 iteration failed.');
		}
	}

}

function vectorEpsilonEquals(v, x, y) {
	return ee(v._v[0], x) && ee(v._v[1], y);
}

function vectorEquals(v, x, y) {
	return v._v[0] == x && v._v[1] == y;
}

