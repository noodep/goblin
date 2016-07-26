'use strict';

import {epsilon32Equals as ee, randomFloat32 as rf32} from '../test-utils.js';
import Vec3 from '../../../src/math/vec3.js';

export default class Vec3Test {

	static runAll() {
		console.log(`%c----- Testing src/math/vec3.js -----`,'color:blue;');
		console.time('Perf');

		Vec3Test.testDefaultConstruction();
		Vec3Test.testIdentityConstruction();
		Vec3Test.testArrayConstruction();
		Vec3Test.testZeroAssignement();
		Vec3Test.testRandomAssignement();
		Vec3Test.testSetters();
		Vec3Test.testIdentity();
		Vec3Test.testCopy();
		Vec3Test.testCloning();
		Vec3Test.testNullLength();
		Vec3Test.testUnitLength();
		Vec3Test.testNormalize();
		Vec3Test.testNegate();
		Vec3Test.testInvert();
		Vec3Test.testNullInvert();
		Vec3Test.testNullScaling();
		Vec3Test.testZeroScaling();
		Vec3Test.testIdentityScaling();
		Vec3Test.testMultiply();

		console.timeEnd('Perf');
		console.log(`%c------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const v = new Vec3();
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0), 'Default construction does not return a null vector.');
	}

	static testIdentityConstruction() {
		const v = Vec3.identity();
		console.assert(vectorEquals(v, 1.0, 1.0, 1.0), 'Identity construction does not return an vector set to identity.');
	}

	static testArrayConstruction() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v = Vec3.fromArray([x, y, z]);
		console.assert(vectorEpsilonEquals(v, x, y, z), 'Assigned array construction failed.');
	}

	static testZeroAssignement() {
		const v = new Vec3(0.0, 0.0, 0.0);
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0), 'Assigned construction (zeroes) failed.');
	}

	static testRandomAssignement() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v = new Vec3(x,y,z);
		console.assert(vectorEpsilonEquals(v, x, y, z), 'Assigned construction failed.');
	}

	static testSetters() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v = new Vec3();
		v.x = x;
		v.y = y;
		v.z = z;
		console.assert(vectorEpsilonEquals(v, x, y, z), 'Setters do not assign properly.');
	}

	static testIdentity() {
		const v = new Vec3();
		v.identity();
		console.assert(v.x == 1.0 && v.y == 1.0 && v.z == 1.0, 'Identity does not set to identity.');
	}

	static testCopy() {
		const v = Vec3.random();
		const v$copy = Vec3.random();
		v$copy.copy(v);
		console.assert(v$copy.equals(v), 'Copy failed.');
	}

	static testCloning() {
		const v = Vec3.random();
		const v$clone = v.clone();
		console.assert(v.equals(v$clone), 'Cloning failed.');
	}

	static testNullLength() {
		const v = new Vec3();
		console.assert(v.length() == 0.0, 'Length of a null vector is different from zero.');
	}

	static testUnitLength() {
		const vx = new Vec3(1.0, 0.0, 0.0);
		const vy = new Vec3(0.0, 1.0, 0.0);
		const vz = new Vec3(0.0, 0.0, 1.0);
		console.assert(vx.length() == 1.0, 'Length of a unit vector x is different from one.');
		console.assert(vy.length() == 1.0, 'Length of a unit vector y is different from one.');
		console.assert(vz.length() == 1.0, 'Length of a unit vector z is different from one.');
	}

	static testNormalize() {
		const v = Vec3.random();
		v.normalize();
		console.assert(ee(v.length(), 1.0), 'Length of the normalized vector is different from one.');
	}

	static testNegate() {
		const v = Vec3.random();
		const nx = -v.x;
		const ny = -v.y;
		const nz = -v.z;
		v.negate();
		console.assert(vectorEpsilonEquals(v, nx, ny, nz), 'Negation failed.');
	}

	static testInvert() {
		const v = Vec3.random();

		const ix = Math.fround(1.0 / v.x);
		const iy = Math.fround(1.0 / v.y);
		const iz = Math.fround(1.0 / v.z);
		v.invert();
		console.assert(vectorEpsilonEquals(v, ix, iy, iz), 'Inversion failed.');
	}

	static testNullInvert() {
		const v = new Vec3();
		v.invert();
		console.assert(vectorEquals(v, Infinity, Infinity, Infinity), 'Inverting a null vector does not return an Infinity vector.');
	}

	static testNullScaling() {
		const v = new Vec3();
		v.scale(rf32());
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0), 'Scaling a null vector by random scalar does not return a null vector.');
	}

	static testZeroScaling() {
		const v = Vec3.random();
		v.scale(0.0);
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0), 'Scaling a random vector by zero does not return a null vector.');
	}

	static testIdentityScaling() {
		const v = new Vec3();
		const s = rf32();
		v.identity();
		v.scale(s);
		console.assert(vectorEpsilonEquals(v, s, s, s), 'Scaling identity failed.');
	}

	static testMultiply() {
		const v$1 = Vec3.random();
		const v$2 = Vec3.random();
		const mx = v$1.x * v$2.x;
		const my = v$1.y * v$2.y;
		const mz = v$1.z * v$2.z;
		v$1.multiply(v$2);
		console.assert(vectorEpsilonEquals(v$1, mx, my, mz), 'Multiplication failed.');
	}
}

function vectorEpsilonEquals(v, x, y, z) {
	return ee(v.x, x) && ee(v.y, y) && ee(v.z, z);
}

function vectorEquals(v, x, y, z) {
	return v.x == x && v.y == y && v.z == z;
}

