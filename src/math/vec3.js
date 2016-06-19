'use strict';

/**
 * Vector manipulation library
 * @version 0.40
 */
export default class Vec3 {

	/**
	 * @constructor
	 *
	 * @param {number} [x=0] - x value.
	 * @param {number} [y=0] - y value.
	 * @param {number} [z=0] - z value.
	 */
	constructor(x = 0.0, y = 0.0, z = 0.0) {
		this._v = new Float64Array(3);
		this._v[0] = x;
		this._v[1] = y;
		this._v[2] = z;
	}

	/**
	 * Getter for this vector x component
	 */
	get x() { return this._v[0]; }

	/**
	 * Getter for this vector y component
	 */
	get y() { return this._v[1]; }

	/**
	 * Getter for this vector z component
	 */
	get z() { return this._v[2]; }

	/**
	 * Setter for this vector x component
	 */
	set x(x) { this._v[0] = x; }

	/**
	 * Setter for this vector y component
	 */
	set y(y) { this._v[1] = y; }

	/**
	 * Setter for this vector z component
	 */
	set z(z) { this._v[2] = z; }

	/**
	 * Sets the vector to identiy.
	 * @return {Vec3} - This vector.
	 */
	identity() {
		this._v[0] = 1.0;
		this._v[1] = 1.0;
		this._v[2] = 1.0;
		return this;
	}

	/**
	 * Copies values of vector v3 into this vector.
	 * @param {Vec3} v3 - Vector from which to copy values. 
	 * @return {Vec3} - This vector.
	 */
	copy(v3) {
		this._v[0] = v3._v[0];
		this._v[1] = v3._v[1];
		this._v[2] = v3._v[2];
		return this;
	}

	/**
	 * Clones this vector.
	 * @return {Vec3} - The newly cloned vector.
	 */
	clone() {
		return new Vec3(this._v[0],this._v[1],this._v[2]);
	}

	/**
	 * Negates this vector.
	 * @return {Vec3} - Negated vector.
	 */
	negate() {
		this._v[0] = -this._v[0];
		this._v[1] = -this._v[1];
		this._v[2] = -this._v[2];
		return this;
	}

	/**
	 * Inverses this vector.
	 * @return {Vec3} - Inversed vector.
	 */
	inverse() {
		this._v[0] = 1 / this._v[0];
		this._v[1] = 1 / this._v[1];
		this._v[2] = 1 / this._v[2];
		return this;
	}

	/**
	 * Multiplies this vector by a scalar.
	 * @param {number} n - Scalar by which to multiply this vector.
	 * @return {Vec3} - Multiplied vector.
	 */
	scale(n) {
		this._v[0] *= n;
		this._v[1] *= n;
		this._v[2] *= n;
		return this;
	}

	/**
	 * Multiplies this vector by another vector.
	 * @param {Vec3} v3 - Vector by which to multiply this vector.
	 * @return {Vec3} - Multiplied vector.
	 */
	multiply(v3) {
		this._v[0] *= v3._v[0];
		this._v[1] *= v3._v[1];
		this._v[2] *= v3._v[2];
		return this;
	}

	/**
	 * Computes the dot product of this vector by another vector.
	 * @param {Vec3} v3 - Vector by which to compute the dot product.
	 * @return {Number} - Result of the dot product.
	 */
	dot(v3) {
		return this._v[0] * v3._v[0] + this._v[1] * v3._v[1] + this._v[2] * v3._v[2];
	}

	/**
	 * Computes the cross product of this vector by another vector.
	 * @param {Vec3} v3 - Vector by which to compute the cross product.
	 * @return {Vec3} - Result of the cross product.
	 */
	cross(v3) {
		var x = this._v[0], y = this._v[1], z = this._v[2];
		this._v[0] = y * v3._v[2] - z * v3._v[1];
		this._v[1] = z * v3._v[0] - x * v3._v[2];
		this._v[2] = x * v3._v[1] - y * v3._v[0];
		return this;
	}



	/**
	 * Rotates this vector in R3 around the X axis
	 * @param {number} theta - angle by which to rotate the vector.
	 * @return {Vec3} - Rotated vector.
	 */
	rotateX(theta) {
		let y = this._v[1], z = this._v[2],
			c = Math.cos(theta), s = Math.sin(theta);

		this._v[1] = y * c - z * s;
		this._v[2] = z * c + y * s;
		return this;
	}

	/**
	 * Rotates this vector in R3 around the Y axis
	 * @param {number} theta - angle by which to rotate the vector.
	 * @return {Vec3} - Rotated vector.
	 */
	rotateY(theta) {
		let x = this._v[0], z = this._v[2],
			c = Math.cos(theta), s = Math.sin(theta);

		this._v[2] = z * c - x * s;
		this._v[0] = x * c + z * s;
		return this;
	}

	/**
	 * Rotates this vector in R3 around the Z axis
	 * @param {number} theta - angle by which to rotate the vector.
	 * @return {Vec3} - Rotated vector.
	 */
	rotateZ(theta) {
		let x = this._v[0], y = this._v[1],
			c = Math.cos(theta), s = Math.sin(theta);

		this._v[0] = x * c - y * s;
		this._v[1] = y * c + x * s;
		return this;
	}
}

