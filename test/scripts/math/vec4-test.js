/**
 * @file vec4 tests
 *
 * @author noodep
 * @version 0.69
 */

import {epsilon32Equals as ee, randomFloat32 as rf32} from '../test-utils.js';
import Vec2 from '/src/math/vec2.js';
import Vec3 from '/src/math/vec3.js';
import Vec4 from '/src/math/vec4.js';

export default class Vec4Test {

	static runAll() {
		console.log('%c----- Testing /src/math/vec4.js -----','color:blue;');
		console.time('Perf');

		Vec4Test.testDefaultConstruction();
		Vec4Test.testIdentityConstruction();
		Vec4Test.testArrayConstruction();
		Vec4Test.testZeroAssignement();
		Vec4Test.testRandomAssignement();
		Vec4Test.testSetters();
		Vec4Test.testEquals();
		Vec4Test.testIdentity();
		Vec4Test.testCopy();
		Vec4Test.testCloning();
		Vec4Test.testNullMagnitude();
		Vec4Test.testUnitMagnitude();
		Vec4Test.testNormalize();
		Vec4Test.testNegate();
		Vec4Test.testInvert();
		Vec4Test.testNullInvert();
		Vec4Test.testNullScaling();
		Vec4Test.testZeroScaling();
		Vec4Test.testIdentityScaling();
		Vec4Test.testMultiply();
		Vec4Test.testVec2Polymorphism();
		Vec4Test.testVec3Polymorphism();
		Vec4Test.testArrayPolymorphism();
		Vec4Test.testVec2View();
		Vec4Test.testVec3View();

		console.timeEnd('Perf');
		console.log('%c------------------------------------','color:blue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const v = new Vec4();
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0, 0.0), 'Default construction does not return a null vector.');
	}

	static testIdentityConstruction() {
		const v = Vec4.identity();
		console.assert(vectorEquals(v, 1.0, 1.0, 1.0, 1.0), 'Identity construction does not return an vector set to identity.');
	}

	static testArrayConstruction() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const w = rf32();
		const v = Vec4.from([x, y, z, w]);
		console.assert(vectorEpsilonEquals(v, x, y, z, w), 'Assigned array construction failed.');
	}

	static testZeroAssignement() {
		const v = new Vec4(0.0, 0.0, 0.0, 0.0);
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0, 0.0), 'Assigned construction (zeroes) failed.');
	}

	static testRandomAssignement() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const w = rf32();
		const v = new Vec4(x,y,z,w);
		console.assert(vectorEpsilonEquals(v, x, y, z, w), 'Assigned construction failed.');
	}

	static testSetters() {
		var x = rf32(); var y = rf32(); var z = rf32(); var w = rf32();
		const v = new Vec4();
		v.x = x;
		v.y = y;
		v.z = z;
		v.w = w;
		console.assert(vectorEpsilonEquals(v, x, y, z, w), 'XYZW setters do not assign properly.');
		x = rf32(); y = rf32(); z = rf32(); w = rf32();
		v.r = x;
		v.g = y;
		v.b = z;
		v.a = w;
		console.assert(vectorEpsilonEquals(v, x, y, z, w), 'RGBA setters do not assign properly.');
		x = rf32(); y = rf32(); z = rf32(); w = rf32();
		v.s = x;
		v.t = y;
		v.p = z;
		v.q = w;
		console.assert(vectorEpsilonEquals(v, x, y, z, w), 'STPQ setters do not assign properly.');
		x = rf32(); y = rf32(); z = rf32(); w = rf32();
		v[0] = x;
		v[1] = y;
		v[2] = z;
		v[3] = w;
		console.assert(vectorEpsilonEquals(v, x, y, z, w), 'Array setters do not assign properly.');
	}

	static testIdentity() {
		const v = new Vec4();
		v.identity();
		console.assert(v.x == 1.0 && v.y == 1.0 && v.z == 1.0 && v.w == 1, 'Identity does not set to identity.');
	}

	static testEquals() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const w = rf32();
		const v1 = new Vec4(x, y, z, w);
		const v2 = new Vec4(x, y, z, w);
		console.assert(v1.equals(v1), 'Equality test is not reflexive.');
		console.assert(v1.equals(v2) == v2.equals(v1), 'Equality test is not commutative.');

		console.assert(v1.equals(v2), 'Equality test gives false negative.');
		v2.x = rf32();
		console.assert(!v1.equals(v2), 'Equality test gives false positive for x.');
		v2.x = x;
		v2.y = rf32();
		console.assert(!v1.equals(v2), 'Equality test gives false positive for y.');
		v2.y = y;
		v2.z = rf32();
		console.assert(!v1.equals(v2), 'Equality test gives false positive for z.');
		v2.z = z;
		v2.w = rf32();
		console.assert(!v1.equals(v2), 'Equality test gives false positive for w.');
		v2.x = rf32();
		v2.y = rf32();
		v2.z = rf32();
		v2.w = rf32();
		console.assert(!v1.equals(v2), 'Equality test gives false positive.');
	}

	static testCopy() {
		const v = Vec4.random();
		const v$copy = Vec4.random();
		v$copy.copy(v);
		console.assert(v$copy.equals(v), 'Copy failed.');
	}

	static testCloning() {
		const v = Vec4.random();
		const v$clone = v.clone();
		console.assert(v.equals(v$clone), 'Cloning failed.');
	}

	static testNullMagnitude() {
		const v = new Vec4();
		console.assert(v.magnitude() == 0.0, 'Magnitude of a null vector is different from zero.');
	}

	static testUnitMagnitude() {
		const vx = new Vec4(1.0, 0.0, 0.0, 0.0);
		const vy = new Vec4(0.0, 1.0, 0.0, 0.0);
		const vz = new Vec4(0.0, 0.0, 1.0, 0.0);
		const vw = new Vec4(0.0, 0.0, 0.0, 1.0);
		console.assert(vx.magnitude() == 1.0, 'Magnitude of a unit vector x is different from one.');
		console.assert(vy.magnitude() == 1.0, 'Magnitude of a unit vector y is different from one.');
		console.assert(vz.magnitude() == 1.0, 'Magnitude of a unit vector z is different from one.');
		console.assert(vw.magnitude() == 1.0, 'Magnitude of a unit vector w is different from one.');
	}

	static testNormalize() {
		const v = Vec4.random();
		v.normalize();
		console.assert(ee(v.magnitude(), 1.0), 'Magnitude of the normalized vector is different from one.');
	}

	static testNegate() {
		const v = Vec4.random();
		const nx = -v.x;
		const ny = -v.y;
		const nz = -v.z;
		const nw = -v.w;
		v.negate();
		console.assert(vectorEpsilonEquals(v, nx, ny, nz, nw), 'Negation failed.');
	}

	static testInvert() {
		const v = Vec4.random();

		const ix = Math.fround(1.0 / v.x);
		const iy = Math.fround(1.0 / v.y);
		const iz = Math.fround(1.0 / v.z);
		const iw = Math.fround(1.0 / v.w);
		v.invert();
		console.assert(vectorEpsilonEquals(v, ix, iy, iz, iw), 'Inversion failed.');
	}

	static testNullInvert() {
		const v = new Vec4();
		v.invert();
		console.assert(vectorEquals(v, Infinity, Infinity, Infinity, Infinity), 'Inverting a null vector does not return an Infinity vector.');
	}

	static testNullScaling() {
		const v = new Vec4();
		v.scale(rf32());
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0, 0.0), 'Scaling a null vector by random scalar does not return a null vector.');
	}

	static testZeroScaling() {
		const v = Vec4.random();
		v.scale(0.0);
		console.assert(vectorEquals(v, 0.0, 0.0, 0.0, 0.0), 'Scaling a random vector by zero does not return a null vector.');
	}

	static testIdentityScaling() {
		const v = Vec4.identity();
		const s = rf32();
		v.scale(s);
		console.assert(vectorEpsilonEquals(v, s, s, s, s), 'Scaling identity failed.');
	}

	static testMultiply() {
		const v$1 = Vec4.random();
		const v$2 = Vec4.random();
		const mx = v$1.x * v$2.x;
		const my = v$1.y * v$2.y;
		const mz = v$1.z * v$2.z;
		const mw = v$1.w * v$2.w;
		v$1.multiply(v$2);
		console.assert(vectorEpsilonEquals(v$1, mx, my, mz, mw), 'Multiplication failed.');
	}

	static testVec2Polymorphism() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const w = rf32();
		const v4 = new Vec4(x, y, z, w);
		const v2 = new Vec2(x, y);
		console.assert(v2.equals(v4), 'Vec2/Vec4 equality failed.');
	}

	static testVec3Polymorphism() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const w = rf32();
		const v4 = new Vec4(x, y, z, w);
		const v3 = new Vec3(x, y, z);
		console.assert(v3.equals(v4), 'Vec3/Vec4 equality failed.');
	}

	static testArrayPolymorphism() {
		const x = rf32();
		const y = rf32();
		const z = rf32();
		const w = rf32();
		const v = new Vec4(x, y, z, w);
		const arr = [x, y, z, w];
		console.assert(arr.length == v.length, 'Vec4 length not the same as corresponding array.');

		const v$from = Vec4.from(v);
		console.assert(v.equals(v$from), 'Passing Vec4 instance to from() does not work.');

		console.assert(Array.prototype.concat.call(v).length == 4, 'Vec4 is not concat() spreadable.');

		try {
			let count = 0;
			const it = v[Symbol.iterator]();

			while(!it.next().done)
				count++;

			console.assert(count == 4, 'Vec3 iterator yeilds wrong number of elements.');
		} catch (e) {
			console.error('Vec4 iteration failed.');
		}
	}

	static testVec2View() {
		const v4 = Vec4.random();
		const v2 = v4.xy;

		console.assert(v2 instanceof Vec2, 'Vec2 view on Vec4 is not an instance of Vec2.');
		console.assert(v2.x == v4.x && v2.y == v4.y, 'Vec2 view on Vec4 does not have equal components');

		v2.x = rf32();
		v2.y = rf32();
		console.assert(v2.x == v4.x && v2.y == v4.y, 'Vec2 view setters do not set Vec4 components.');

		v4.x = rf32();
		v4.y = rf32();
		console.assert(v2.x == v4.x && v2.y == v4.y, 'Vec4 setters do not set Vec2 view components.');
	}

	static testVec3View() {
		const v4 = Vec4.random();
		const v3 = v4.xyz;

		console.assert(v3 instanceof Vec3, 'Vec3 view on Vec4 is not an instance of Vec3.');
		console.assert(v3.x == v4.x && v3.y == v4.y && v3.z == v4.z, 'Vec3 view on Vec4 does not have equal components');

		v3.x = rf32();
		v3.y = rf32();
		v3.z = rf32();
		console.assert(v3.x == v4.x && v3.y == v4.y && v3.z == v4.z, 'Vec3 view setters do not set Vec4 components.');

		v4.x = rf32();
		v4.y = rf32();
		v4.z = rf32();
		console.assert(v3.x == v4.x && v3.y == v4.y && v3.z == v4.z, 'Vec4 setters do not set Vec3 view components.');
	}

}

function vectorEpsilonEquals(v, x, y, z, w) {
	return ee(v._v[0], x) && ee(v._v[1], y) && ee(v._v[2], z) && ee(v._v[3], w);
}

function vectorEquals(v, x, y, z, w) {
	return v._v[0] == x && v._v[1] == y && v._v[2] == z && v._v[3] == w;
}

