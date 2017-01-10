/**
 * @fileOverview 2 components vector manipulation.
 * @author Noodep
 * @version 0.11
 */

'use strict';

const EPSILON32 = Math.pow(2, -23);

export default class Vec2 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Vec2
	 *
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @return {module:math.Vec2} - The newly created vector.
	 */
	constructor(x = 0.0, y = 0.0) {
		this._v = new Float32Array(2);
		this._v[0] = x;
		this._v[1] = y;
	}

	/**
	 * Creates a new vector from a javascript Array.
	 *
	 * @param {Array} array - The array containing the values with which to initialize this vector.
	 * @return {module:math.Vec2} - The newly created vector set with values from the specified Array.
	 */
	static fromArray(array) {
		const v = new Vec2(array[0], array[1]);
		return v;
	}

	/**
	 * Creates a new vector from the two specified vectors.
	 *
	 * @param {module:math:Vec2} u -  The first vector.
	 * @param {module:math:Vec2} v -  The second vector.
	 * @return {module:math.Vec2} - The newly created vector corresponding to the difference between v and u.
	 */
	static fromVectors(u ,w) {
		const v = new Vec2(w._v[0] - u._v[0], w._v[1] - u._v[1]);
		return v;
	}

	/**
	 * Creates a new identity vector.
	 *
	 * @return {module:math.Vec2} - The newly created vector set to identity.
	 */
	static identity() {
		const v = new Vec2();
		v._v[0] = 1.0;
		v._v[1] = 1.0;

		return v;
	}

	/**
	 * Creates a new random vector.
	 *
	 * @return {module:math.Vec2} - The newly created vector set with random values between 0.0 and 1.0.
	 */
	static random() {
		const v = new Vec2();
		v._v[0] = Math.random();
		v._v[1] = Math.random();

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
	 * Sets the vector to identiy.
	 *
	 * @return {module:math.Vec2} - This vector.
	 */
	identity() {
		this._v[0] = 1.0;
		this._v[1] = 1.0;

		return this;
	}

	/**
	 * Copies values of vector v2 into this vector.
	 *
	 * @param {module:math.Vec2} v2 - Vector from which to copy values.
	 * @return {module:math.Vec2} - This vector.
	 */
	copy(v2) {
		this._v[0] = v2._v[0];
		this._v[1] = v2._v[1];

		return this;
	}

	/**
	 * Clones this vector.
	 *
	 * @return {module:math.Vec2} - The newly cloned vector.
	 */
	clone() {
		return new Vec2(this._v[0],this._v[1]);
	}

	/**
	 * Test for equality component wise using machine EPSILON for 32 bits (2^-23)
	 *
	 * @param {module:math.Vec2} - The vector with which to make the comparison.
	 * @return {Boolean} - true if this vector and the specified vector have the same components, false otherwise.
	 */
	equals(v2) {
		return Math.abs(this._v[0] - v2._v[0]) < EPSILON32 &&
			Math.abs(this._v[1] - v2._v[1]) < EPSILON32;
	}

	/**
	 * Computes the length of this vector.
	 *
	 * @return {Number} - A scalar representing the length of this vector.
	 */
	length() {
		return Math.sqrt(this._v[0]*this._v[0] + this._v[1]*this._v[1]);
	}

	/**
	 * Check if this vector is a unit vector.
	 *
	 * @return {Boolean} - true if this vector is a unit vector, false otherwise.
	 */
	isUnit() {
		return Math.abs(this.length() - 1.0) < EPSILON32;
	}

	/**
	 * Normalize this vector.
	 *
	 * @return {module:math.Vec2} - This vector normalized.
	 */
	normalize() {
		const length = this.length();
		return this.scale(1.0 / length);
	}

	/**
	 * Negates this vector.
	 *
	 * @return {module:math.Vec2} - The negated vector.
	 */
	negate() {
		this._v[0] = -this._v[0];
		this._v[1] = -this._v[1];

		return this;
	}

	/**
	 * Inverts this vector.
	 *
	 * @return {module:math.Vec2} - The inversed vector.
	 */
	invert() {
		this._v[0] = 1.0 / this._v[0];
		this._v[1] = 1.0 / this._v[1];

		return this;
	}

	/**
	 * Multiplies this vector by a scalar.
	 *
	 * @param {Number} n - Scalar by which to multiply this vector.
	 * @return {module:math.Vec2} - The scaled vector.
	 */
	scale(n) {
		this._v[0] *= n;
		this._v[1] *= n;

		return this;
	}

	/**
	 * Multiplies this vector by another vector.
	 *
	 * @param {module:math.Vec2} n - Vector by which to multiply this vector.
	 * @return {module:math.Vec2} - The result of the multiplication.
	 */
	multiply(v2) {
		this._v[0] *= v2._v[0];
		this._v[1] *= v2._v[1];

		return this;
	}

	/**
	 * Computes the dot product of this vector by another vector.
	 *
	 * @param {module:math.Vec2} v2 - Vector by which to compute the dot product.
	 * @return {Number} - The result of the dot product.
	 */
	dot(v2) {
		return this._v[0] * v2._v[0] + this._v[1] * v2._v[1];
	}

	/**
	 * Computes the determinant of this vector and the specified vector.
	 *
	 * @param {module:math.Vec2} v2 - The vector by which to compute the cross product.
	 * @return {module:math.Vec2} - The result of the cross product.
	 */
	det(v2) {
		return this._v[0] * v2._v[1] - this._v[1] * v2._v[0];
	}

	/**
	 * Rotates this vector in R2.
	 *
	 * @param {Number} theta - Angle by which to rotate the vector.
	 * @return {Vec2} - The rotated vector.
	 */
	rotate(theta) {
		const x = this._v[0];
		const y = this._v[1];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[0] = x * c - y * s;
		this._v[1] = y * c + x * s;

		return this;
	}

	/**
	 * Returns a human readable string representing this vector.
	 *
	 * @param {Number} [p=16] - precision to use when printing coordinate values.
	 * @return {String} - A human readable String representing this vector.
	 */
	toString(precision = 16) {
		return `[${this._v[0].toFixed(precision)}, ${this._v[1].toFixed(precision)}]`;
	}
}

