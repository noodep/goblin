/**
 * @fileOverview 3 components vector manipulation.
 * @author Noodep
 * @version 0.43
 */

'use strict';

export default class Vec3 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Vec3
	 *
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @param {Number} [z=0] - z value.
	 * @return {module:math.Vec3} - The newly created vector.
	 */
	constructor(x = 0.0, y = 0.0, z = 0.0) {
		this._v = new Float64Array(3);
		this._v[0] = x;
		this._v[1] = y;
		this._v[2] = z;
	}

	/**
	 * Creates a new vector from a javascript Array.
	 *
	 * @param {Array} - The array containing the values with which to initialize this vector.
	 * @return {module:math.Vec3} - The newly created vector set with values from the specified Array.
	 */
	static fromArray(array) {
		const v = new Vec3(array[0], array[1], array[2]);
		return v;
	}

	/**
	 * Creates a new identity vector.
	 *
	 * @return {module:math.Vec3} - The newly created vector set to identity.
	 */
	static identity() {
		const v = new Vec3();
		v._v[0] = 1.0;
		v._v[1] = 1.0;
		v._v[2] = 1.0;

		return v;
	}

	/**
	 * Creates a new random vector.
	 *
	 * @return {module:math.Vec3} - The newly created vector set with random values between 0.0 and 1.0.
	 */
	static random() {
		const v = new Vec3();
		v._v[0] = Math.random();
		v._v[1] = Math.random();
		v._v[2] = Math.random();

		return v;
	}

	/**
	 * Getter for this vector x component.
	 *
	 * @return {Number} - The x value;
	 */
	get x() { return this._v[0]; }

	/**
	 * Getter for this vector y component.
	 *
	 * @return {Number} - The y value;
	 */
	get y() { return this._v[1]; }

	/**
	 * Getter for this vector z component.
	 *
	 * @return {Number} - The z value;
	 */
	get z() { return this._v[2]; }

	/**
	 * Setter for this vector x component.
	 *
	 * @param {Number} x - The new x value.
	 */
	set x(x) { this._v[0] = x; }

	/**
	 * Setter for this vector y component
	 *
	 * @param {Number} y - The new y value.
	 */
	set y(y) { this._v[1] = y; }

	/**
	 * Setter for this vector z component.
	 *
	 * @param {Number} z - The new z value.
	 */
	set z(z) { this._v[2] = z; }

	/**
	 * Sets the vector to identiy.
	 *
	 * @return {module:math.Vec3} - This vector.
	 */
	identity() {
		this._v[0] = 1.0;
		this._v[1] = 1.0;
		this._v[2] = 1.0;

		return this;
	}

	/**
	 * Copies values of vector v3 into this vector.
	 *
	 * @param {module:math.Vec3} v3 - Vector from which to copy values.
	 * @return {module:math.Vec3} - This vector.
	 */
	copy(v3) {
		this._v[0] = v3._v[0];
		this._v[1] = v3._v[1];
		this._v[2] = v3._v[2];

		return this;
	}

	/**
	 * Clones this vector.
	 *
	 * @return {module:math.Vec3} - The newly cloned vector.
	 */
	clone() {
		return new Vec3(this._v[0],this._v[1],this._v[2]);
	}

	/**
	 * Test for equality component wise using machine EPSILON (2^-52)
	 *
	 * @param {module:math.Vec3} - The vector with which to make the comparison.
	 * @return {Boolean} - true if this vector and the specified vector have the same components, false otherwise.
	 */
	equals(v3) {
		return Math.abs(this._v[0] - v3._v[0]) < Number.EPSILON &&
			Math.abs(this._v[1] - v3._v[1]) < Number.EPSILON &&
			Math.abs(this._v[2] - v3._v[2]) < Number.EPSILON;
	}

	/**
	 * Computes the length of this vector.
	 *
	 * @return {Number} - A scalar representing the length of this vector.
	 */
	length() {
		return Math.sqrt(this._v[0]*this._v[0] + this._v[1]*this._v[1] + this._v[2]*this._v[2]);
	}

	/**
	 * Normalize this vector.
	 *
	 * @return {module:math.Vec3} - This vector normalized.
	 */
	normalize() {
		const length = this.length();
		return this.scale(1.0 / length);
	}

	/**
	 * Negates this vector.
	 *
	 * @return {module:math.Vec3} - The negated vector.
	 */
	negate() {
		this._v[0] = -this._v[0];
		this._v[1] = -this._v[1];
		this._v[2] = -this._v[2];

		return this;
	}

	/**
	 * Inverses this vector.
	 *
	 * @return {module:math.Vec3} - The inversed vector.
	 */
	inverse() {
		this._v[0] = 1.0 / this._v[0];
		this._v[1] = 1.0 / this._v[1];
		this._v[2] = 1.0 / this._v[2];

		return this;
	}

	/**
	 * Multiplies this vector by a scalar.
	 *
	 * @param {Number} n - Scalar by which to multiply this vector.
	 * @return {module:math.Vec3} - The scaled vector.
	 */
	scale(n) {
		this._v[0] *= n;
		this._v[1] *= n;
		this._v[2] *= n;

		return this;
	}

	/**
	 * Multiplies this vector by another vector.
	 *
	 * @param {module:math.Vec3} n - Vector by which to multiply this vector.
	 * @return {module:math.Vec3} - The result of the multiplication.
	 */
	multiply(v3) {
		this._v[0] *= v3._v[0];
		this._v[1] *= v3._v[1];
		this._v[2] *= v3._v[2];

		return this;
	}

	/**
	 * Computes the dot product of this vector by another vector.
	 *
	 * @param {module:math.Vec3} v3 - Vector by which to compute the dot product.
	 * @return {Number} - The result of the dot product.
	 */
	dot(v3) {
		return this._v[0] * v3._v[0] + this._v[1] * v3._v[1] + this._v[2] * v3._v[2];
	}

	/**
	 * Computes the cross product of the two specified vectors.
	 *
	 * @param {module:math.Vec3} v3$1 - First vector by which to compute the cross product.
	 * @param {module:math.Vec3} v3$2 - Second vector by which to compute the cross product.
	 * @return {module:math.Vec3} - The result of the cross product.
	 */
	cross(v3$1, v3$2) {
		this._v[0] = v3$1._v[1] * v3$2._v[2] - v3$1._v[2] * v3$2._v[1];
		this._v[1] = v3$1._v[2] * v3$2._v[0] - v3$1._v[0] * v3$2._v[2];
		this._v[2] = v3$1._v[0] * v3$2._v[1] - v3$1._v[1] * v3$2._v[0];

		return this;
	}

	/**
	 * Rotates this vector in R3 around the X axis.
	 *
	 * @param {Number} theta - Angle by which to rotate the vector in radians.
	 * @return {module:math.Vec3} - The rotated vector.
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
	 * @return {module:math.Vec3} - The rotated vector.
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
	 * @param {number} theta - Angle by which to rotate the vector.
	 * @return {Vec3} - The rotated vector.
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
}

