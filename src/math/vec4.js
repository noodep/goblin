/**
 * @file 4-component vector manipulation.
 *
 * @author Noodep
 * @version 0.16
 */

const EPSILON32 = Math.pow(2, -23);

import { Vec2View } from './vec2.js';
import { Vec3View } from './vec3.js';

/**
 * 4-component floating point vector.
 * The main use for this is to differentiare between points and directions in R3
 * space; the w coordinate is 0 if the vector is a point and 1 otherwise.
 * Because there are 4-components, functions such as magnitude() or dot() may
 * not return the desired result. When performing operations on Vec4s, it may be
 * advantageous to operate on Vec4#xyz, which is a Vec3 view on the x, y, and z
 * coordinates of the vector. The rotate*() and translate*() functions operate
 * in R3 space, so these should work as expected.
 */
export default class Vec4 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Vec4
	 *
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @param {Number} [z=0] - z value.
	 * @param {Number} [w=0] - w value.
	 * @return {module:math.Vec4} - The newly created vector.
	 */
	constructor(x = 0.0, y = 0.0, z = 0.0, w = 0.0) {
		this._v = new Float32Array(4);
		this._v[0] = x;
		this._v[1] = y;
		this._v[2] = z;
		this._v[3] = w;

		// Don't initialize/allocate this._xy and this._xyz so that they will
		// not take up memory if they are not used.
	}

	/**
	 * Creates a new vector having the same value for all components.
	 *
	 * @param {number} value - The value to set.
	 * @return {module:math.Vec4} - The newly created vector.
	 */
	static fill(value) {
		return new Vec4(value, value, value, value);
	}

	/**
	 * Creates a new vector from an Array-like (magnitude property and integer keys) object (Array, Vec2, Vec3, etc.).
	 *
	 * @param {Array} - The array containing the values with which to initialize this vector.
	 * @return {module:math.Vec4} - The newly created vector set with values from the specified Array.
	 */
	static from(array) {
		if(array && array[Symbol.iterator])
			return new Vec4(array[0], array[1], array[2], array[3]);
		return undefined;
	}

	/**
	 * Creates a new vector from the two specified vectors.
	 *
	 * @param {module:math:Vec4} u -  The first vector.
	 * @param {module:math:Vec4} v -  The second vector.
	 * @return {module:math.Vec4} - The newly created vector corresponding to
	 * the difference v - u.
	 */
	static difference(u, v) {
		return new Vec4(v._v[0] - u._v[0], v._v[1] - u._v[1], v._v[2] - u._v[2], v._[3] - u._v[3]);
	}

	/**
	 * Creates a new identity vector.
	 *
	 * @return {module:math.Vec4} - The newly created vector set to identity.
	 */
	static identity() {
		return new Vec4(1.0, 1.0, 1.0, 1.0);
	}

	/**
	 * Creates a new random vector.
	 *
	 * @return {module:math.Vec4} - The newly created vector set with random values between 0.0 and 1.0.
	 */
	static random() {
		return new Vec4(Math.random(), Math.random(), Math.random(), Math.random());
	}

	/**
	 * A Vec2View using this Vec4's buffer. Other permutations of the comonents
	 * like in GLSL are not supported.
	 */
	get xy() {
		if (!this._xy) {
			this._xy = new Vec2View(this._v.buffer);
		}

		return this._xy;
	}

	/**
	 * A Vec3View using this Vec4's buffer. Other permutations of the comonents
	 * like in GLSL are not supported.
	 */
	get xyz() {
		if (!this._xyz) {
			this._xyz = new Vec3View(this._v.buffer);
		}

		return this._xyz;
	}

	/**
	 * Sets the same value for all componenets
	 *
	 * @param {number} value - The value to set.
	 * @return {module:math.Vec4} - The vector with the componenets set.
	 */
	fill(value) {
		this._v.fill(value);
		return this;
	}

	/**
	 * Sets the vector to identiy.
	 *
	 * @return {module:math.Vec4} - This vector.
	 */
	identity() {
		this._v[0] = 1.0;
		this._v[1] = 1.0;
		this._v[2] = 1.0;
		this._v[3] = 1.0;

		return this;
	}

	/**
	 * Copies values of vector v4 into this vector.
	 *
	 * @param {module:math.Vec4} v4 - Vector from which to copy values.
	 * @return {module:math.Vec4} - This vector.
	 */
	copy(v4) {
		this._v[0] = v4._v[0];
		this._v[1] = v4._v[1];
		this._v[2] = v4._v[2];
		this._v[3] = v4._v[3];

		return this;
	}

	/**
	 * Clones this vector.
	 *
	 * @return {module:math.Vec4} - The newly cloned vector.
	 */
	clone() {
		return new Vec4(this._v[0], this._v[1], this._v[2], this._v[3]);
	}

	/**
	 * Test for equality component wise using machine EPSILON for 32 bits (2^-23)
	 *
	 * @param {module:math.Vec4} - The vector with which to make the comparison.
	 * @return {Boolean} - true if this vector and the specified vector have the same components, false otherwise.
	 */
	equals(v4) {
		return Math.abs(this._v[0] - v4._v[0]) < EPSILON32 &&
			Math.abs(this._v[1] - v4._v[1]) < EPSILON32 &&
			Math.abs(this._v[2] - v4._v[2]) < EPSILON32 &&
			Math.abs(this._v[3] - v4._v[3]) < EPSILON32;
	}

	/**
	 * Computes the magnitude of this vector.
	 *
	 * @return {Number} - A scalar representing the magnitude of this vector.
	 */
	magnitude() {
		return Math.hypot(this._v[0], this._v[1], this._v[2], this._v[3]);
	}

	/**
	 * Computes the square of the magnitude of this vector.
	 *
	 * @return {Number} - A scalar representing the square of the magnitude of
	 * this vector.
	 */
	magnitude2() {
		return this._v[0]*this._v[0] + this._v[1]*this._v[1]
			+ this._v[2]*this._v[2] + this._v[3]*this._v[3];
	}

	/**
	 * Check if this vector is a unit vector.
	 *
	 * @return {Boolean} - true if this vector is a unit vector, false otherwise.
	 */
	isUnit() {
		return Math.abs(this.magnitude() - 1.0) < EPSILON32;
	}

	/**
	 * Normalize this vector, if possible.
	 *
	 * @return {module:math.Vec4} - This vector normalized.
	 */
	normalize() {
		const mag2 = this.magnitude2();
		if (Math.abs(mag2) < EPSILON32) {
			return this;
		} else {
			return this.scale(1.0 / Math.sqrt(mag2));
		}
	}

	/**
	 * Negates this vector.
	 *
	 * @return {module:math.Vec4} - The negated vector.
	 */
	negate() {
		this._v[0] = -this._v[0];
		this._v[1] = -this._v[1];
		this._v[2] = -this._v[2];
		this._v[3] = -this._v[3];

		return this;
	}

	/**
	 * Inverts (reciprocates all components) this vector.
	 *
	 * @return {module:math.Vec4} - The inversed vector.
	 */
	invert() {
		this._v[0] = 1.0 / this._v[0];
		this._v[1] = 1.0 / this._v[1];
		this._v[2] = 1.0 / this._v[2];
		this._v[3] = 1.0 / this._v[3];

		return this;
	}

	/**
	 * Adds the specified vector to this vector.
	 *
	 * @param {module:math.Vec4} v4 - Vector to add to this vector.
	 * @return {module:math.Vec4} - The translated vector.
	 */
	add(v4) {
		this._v[0] += v4._v[0];
		this._v[1] += v4._v[1];
		this._v[2] += v4._v[2];
		this._v[3] += v4._v[3];

		return this;
	}

	/**
	 * Subtracts the specified vector from this vector.
	 *
	 * @param {module:math.Vec4} v4 - Vector to substract from this vector.
	 * @return {module:math.Vec4} - The translated vector.
	 */
	sub(v4) {
		this._v[0] -= v4._v[0];
		this._v[1] -= v4._v[1];
		this._v[2] -= v4._v[2];
		this._v[3] -= v4._v[3];

		return this;
	}

	/**
	 * Multiplies this vector by a scalar.
	 *
	 * @param {Number} n - Scalar by which to multiply this vector.
	 * @return {module:math.Vec4} - The scaled vector.
	 */
	scale(n) {
		this._v[0] *= n;
		this._v[1] *= n;
		this._v[2] *= n;
		this._v[3] *= n;

		return this;
	}

	/**
	 * Multiplies this vector by another vector component-wise.
	 *
	 * @param {module:math.Vec4} n - Vector by which to multiply this vector.
	 * @return {module:math.Vec4} - The result of the multiplication.
	 */
	multiply(v4) {
		this._v[0] *= v4._v[0];
		this._v[1] *= v4._v[1];
		this._v[2] *= v4._v[2];
		this._v[3] *= v4._v[3];

		return this;
	}

	/**
	 * Computes the dot product of this vector by another vector.
	 *
	 * @param {module:math.Vec4} v4 - Vector by which to compute the dot product.
	 * @return {Number} - The result of the dot product.
	 */
	dot(v4) {
		return this._v[0] * v4._v[0] + this._v[1] * v4._v[1]
			+ this._v[2] * v4._v[2] + this._v[3] * v4._v[3];
	}

	/**
	 * Rotates this vector by a quaternion.
	 * @see module:math.Quaternion#rotate
	 *
	 * @param {module:math.Quaternion} q - The quaternion by which to rotate.
	 * @return {module:math.Vec4} - The rotated vector.
	 */
	rotate(q) {
		return q.rotate(this);
	}

	/**
	 * Rotates this vector in R3 around the X axis.
	 *
	 * @param {Number} theta - Angle by which to rotate the vector in radians.
	 * @return {module:math.Vec4} - The rotated vector.
	 */
	rotateX(theta) {
		const y = this._v[1];
		const z = this._v[2];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[1] = y * c - z * s;
		this._v[2] = z * c + y * s;

		return this;
	}

	/**
	 * Rotates this vector in R3 around the Y axis
	 *
	 * @param {Number} theta - Angle by which to rotate the vector.
	 * @return {module:math.Vec4} - The rotated vector.
	 */
	rotateY(theta) {
		const x = this._v[0];
		const z = this._v[2];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[2] = z * c - x * s;
		this._v[0] = x * c + z * s;

		return this;
	}

	/**
	 * Rotates this vector in R3 around the Z axis
	 *
	 * @param {Number} theta - Angle by which to rotate the vector.
	 * @return {Vec4} - The rotated vector.
	 */
	rotateZ(theta) {
		const x = this._v[0];
		const y = this._v[1];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[0] = x * c - y * s;
		this._v[1] = y * c + x * s;

		return this;
	}

	/**
	 * Translates this vector in R3 on the X axis by the specified amount.
	 *
	 * @param {Number} delta_x - amount by which to translate this vector on the X axis.
	 * @return {module:math.Vec4} - The translated vector.
	 */
	translateX(delta_x) {
		this._v[0] += delta_x;

		return this;
	}

	/**
	 * Translates this vector in R3 on the Y axis by the specified amount.
	 *
	 * @param {Number} delta_y - amount by which to translate this vector on the Y axis.
	 * @return {module:math.Vec4} - The translated vector.
	 */
	translateY(delta_y) {
		this._v[1] += delta_y;

		return this;
	}

	/**
	 * Translates this vector in R3 on the Z axis by the specified amount.
	 *
	 * @param {Number} delta_z - amount by which to translate this vector on the Z axis.
	 * @return {module:math.Vec4} - The translated vector.
	 */
	translateZ(delta_z) {
		this._v[2] += delta_z;

		return this;
	}

	/**
	 * Transforms this Vec4 by the specified matrix.
	 *
	 * @param {module:math.Mat4} m - The matrix by which to transform this vec3;
	 * @return {module:math.Vec4} - The transformed vector.
	 */
	transform(m) {
		const x = this._v[0];
		const y = this._v[1];
		const z = this._v[2];
		const w = this._v[3];

		this._v[0] = m._m[0] * x + m._m[4] * y + m._m[8]  * z + m._m[12] * w;
		this._v[1] = m._m[1] * x + m._m[5] * y + m._m[9]  * z + m._m[13] * w;
		this._v[2] = m._m[2] * x + m._m[6] * y + m._m[10] * z + m._m[14] * w;
		this._v[3] = m._m[3] * x + m._m[7] * y + m._m[11] * z + m._m[15] * w;

		return this;
	}

	[Symbol.iterator]() {
		return this._v[Symbol.iterator]();
	}

	/**
	 * Returns a human readable string representing this vector.
	 *
	 * @param {Number} [p=16] - The precision to use when printing coordinate
	 * values.
	 * @return {String} - A human readable String representing this vector.
	 */
	toString(p = 16) {
		return `<${this._v[0].toFixed(p)}, ${this._v[1].toFixed(p)}, ${this._v[2].toFixed(p)}, ${this._v[3].toFixed(p)}>`;
	}

}

// Some aliases
Vec4.prototype.norm = Vec4.prototype.normalize;
Vec4.prototype.mag = Vec4.prototype.magnitude;
Vec4.prototype.mag2 = Vec4.prototype.magnitude2;
Vec4.prototype.mul = Vec4.prototype.multiply;

///
/// Define getters and setters for the vector's values by different names,
/// reusing the same functions.
///

const xProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[0]; },
	set: function(val) { this._v[0] = val; }
};

const yProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[1]; },
	set: function(val) { this._v[1] = val; }
};

const zProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[2]; },
	set: function(val) { this._v[2] = val; }
};

const wProperty = {
	//configurable: false,
	//enumerable: false,
	get: function() { return this._v[3]; },
	set: function(val) { this._v[3] = val; }
};

Object.defineProperties(Vec4.prototype, {
	x: xProperty,
	y: yProperty,
	z: zProperty,
	w: wProperty,

	r: xProperty,
	g: yProperty,
	b: zProperty,
	a: wProperty,

	s: xProperty,
	t: yProperty,
	p: zProperty,
	q: wProperty,

	0: xProperty,
	1: yProperty,
	2: zProperty,
	3: wProperty,

	length: {
		//configurable: false,
		//enumerable: false,
		//writable: false,
		value: 4,
	},
});

/**
 * So Array.prototype.concat() can be used. Leave this as a normal property in
 * case one wants to change it.
 */
Vec4.prototype[Symbol.isConcatSpreadable] = true;

/**
 * Class to create a Vec4 who's componenets are stored in a specified
 * ArrayBuffer.
 *
 * @constructor
 * @param {ArrayBuffer} buffer - The buffer to use.
 * @param {Number} [byteOffset=0] - The byte offset in the buffer.
 * @return {module:math.Vec4View} - The newly created vector.
 */
export function Vec4View(buffer, byteOffset = 0) {
	this._v = new Float32Array(buffer, byteOffset, 4);
}
// Have to do inheritance like this because the other way requires calling
// super() in the constructor.
Vec4View.prototype = Object.create(Vec4.prototype);

/**
 * Some common vector constants.
 * @see Vec3 for why one must be careful when using these
 */
Vec4.NULL = new Vec4(0.0, 0.0, 0.0, 0.0);
Vec4.IDENTITY = Vec4.identity();

Vec4.X_AXIS = new Vec4(1.0, 0.0, 0.0, 1.0);
Vec4.Y_AXIS = new Vec4(0.0, 1.0, 0.0, 1.0);
Vec4.Z_AXIS = new Vec4(0.0, 0.0, 1.0, 1.0);
Vec4.NEG_X_AXIS = new Vec4(-1.0, 0.0, 0.0, 1.0);
Vec4.NEG_Y_AXIS = new Vec4(0.0, -1.0, 0.0, 1.0);
Vec4.NEG_Z_AXIS = new Vec4(0.0, 0.0, -1.0, 1.0);

Vec4.X_DIR = new Vec4(1.0, 0.0, 0.0, 0.0);
Vec4.Y_DIR = new Vec4(0.0, 1.0, 0.0, 0.0);
Vec4.Z_DIR = new Vec4(0.0, 0.0, 1.0, 0.0);
Vec4.NEG_X_DIR = new Vec4(-1.0, 0.0, 0.0, 0.0);
Vec4.NEG_Y_DIR = new Vec4(0.0, -1.0, 0.0, 0.0);
Vec4.NEG_Z_DIR = new Vec4(0.0, 0.0, -1.0, 0.0);

