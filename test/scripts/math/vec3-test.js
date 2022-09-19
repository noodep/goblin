/**
 * @file vec3 tests
 *
 * @author noodep
 * @version 0.63
 */

import {epsilon32Equals as ee, randomFloat32 as rf32} from '../test-utils.js';
import Vec3 from '/src/math/vec3.js';
import Vec2 from '/src/math/vec2.js';

export default class Vec3Test {

	static runAll() {
		console.log('%c----- Testing /src/math/vec3.js -----','color:blue;');
		console.time('Perf');

		Vec3Test.testDefaultConstruction();
		Vec3Test.testIdentityConstruction();
		Vec3Test.testArrayConstruction();
		Vec3Test.testZeroAssignement();
		Vec3Test.testRandomAssignement();
		Vec3Test.testSetters();
		Vec3Test.testEquals();
		Vec3Test.testIdentity();
		Vec3Test.testCopy();
		Vec3Test.testCloning();
		Vec3Test.testNullMagnitude();
		Vec3Test.testUnitMagnitude();
		Vec3Test.testNormalize();
		Vec3Test.testNegate();
		Vec3Test.testInvert();
		Vec3Test.testNullInvert();
		Vec3Test.testNullScaling();
		Vec3Test.testZeroScaling();
		Vec3Test.testIdentityScaling();
		Vec3Test.testMultiply();
		Vec3Test.testVec2Polymorphism();
		Vec3Test.testArrayPolymorphism();
		Vec3Test.testVec2View();

		console.timeEnd('Perf');
		console.log('%c------------------------------------','color:blue;');
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
		const v = Vec3.from([x, y, z]);
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
		var x = rf32(); var y = rf32(); var z = rf32();
		const v = new Vec3();
		v.x = x;
		v.y = y;
		v.z = z;
		console.assert(vectorEpsilonEquals(v, x, y, z), 'XYZ setters do not assign properly.');
		x = rf32(); y = rf32(); z = rf32();
		v.r = x;
		v.g = y;
		v.b = z;
		console.assert(vectorEpsilonEquals(v, x, y, z), 'RGB setters do not assign properly.');
		x = rf32(); y = rf32(); z = rf32();
		v.s = x;
		v.t = y;
		v.p = z;
		console.assert(vectorEpsilonEquals(v, x, y, z), 'STP setters do not assign properly.');
		x = rf32(); y = rf32(); z = rf32();
		v[0] = x;
		v[1] = y;
		v[2] = z;
		console.assert(vectorEpsilonEquals(v, x, y, z), 'Array setters do not assign properly.');
	}

	static testIdentity() {
		const v = new Vec3();
		v.identity();
		console.assert(v.x == 1.0 && v.y == 1.0 && v.z == 1.0, 'Identity does not set to identity.');
	}

	static testEquals() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v$1 = new Vec3(x, y, z);
		const v$2 = new Vec3(x, y, z);
		console.assert(v$1.equals(v$1), 'Equality test is not reflexive.');
		console.assert(v$1.equals(v$2) == v$2.equals(v$1), 'Equality test is not commutative.');

		console.assert(v$1.equals(v$2), 'Equality test gives false negative.');
		v$2.x = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive for x.');
		v$2.x = x;
		v$2.y = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive for y.');
		v$2.y = y;
		v$2.z = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive for z.');
		v$2.x = rf32();
		v$2.y = rf32();
		v$2.z = rf32();
		console.assert(!v$1.equals(v$2), 'Equality test gives false positive.');
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

	static testNullMagnitude() {
		const v = new Vec3();
		console.assert(v.magnitude() == 0.0, 'Magnitude of a null vector is different from zero.');
	}

	static testUnitMagnitude() {
		const vx = new Vec3(1.0, 0.0, 0.0);
		const vy = new Vec3(0.0, 1.0, 0.0);
		const vz = new Vec3(0.0, 0.0, 1.0);
		console.assert(vx.magnitude() == 1.0, 'Magnitude of a unit vector x is different from one.');
		console.assert(vy.magnitude() == 1.0, 'Magnitude of a unit vector y is different from one.');
		console.assert(vz.magnitude() == 1.0, 'Magnitude of a unit vector z is different from one.');
	}

	static testNormalize() {
		const v = Vec3.random();
		v.normalize();
		console.assert(ee(v.magnitude(), 1.0), 'Magnitude of the normalized vector is different from one.');
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

	static testVec2Polymorphism() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v3 = new Vec3(x, y, z);
		const v2 = new Vec2(x, y);
		console.assert(v2.equals(v3), 'Vec2/Vec3 equality failed.');
	}

	static testArrayPolymorphism() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const v = new Vec3(x, y, z);
		const arr = [x, y, z];

		console.assert(arr.length == v.length, 'Vec3 length not the same as corresponding array.');

		const v$from = Vec3.from(v);
		console.assert(v.equals(v$from), 'Passing Vec3 instance to from() does not work.');

		console.assert(Array.prototype.concat.call(v).length == 3, 'Vec3 is not concat() spreadable.');

		try {
			let count = 0;
			const it = v[Symbol.iterator]();

			while(!it.next().done)
				count++;

			console.assert(count == 3, 'Vec3 iterator yeilds wrong number of elements.');
		} catch (e) {
			console.error('Vec3 iteration failed.');
		}
	}

	static testVec2View() {
		const v3 = Vec3.random();
		const v2 = v3.xy;

		console.assert(v2 instanceof Vec2, 'Vec2 view on Vec3 is not an instance of Vec2.');
		console.assert(v2.x == v3.x && v2.y == v3.y, 'Vec2 view on Vec3 does not have equal components');

		v2.x = rf32();
		v2.y = rf32();
		console.assert(v2.x == v3.x && v2.y == v3.y, 'Vec2 view setters do not set Vec3 components.');
	}

}

function vectorEpsilonEquals(v, x, y, z) {
	return ee(v._v[0], x) && ee(v._v[1], y) && ee(v._v[2], z);
}

function vectorEquals(v, x, y, z) {
	return v._v[0] == x && v._v[1] == y && v._v[2] == z;
}
