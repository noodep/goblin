/**
 * @fileOverview quaternion manipulation.
 * @author Noodep
 * @version 0.01
 */

'use strict';

const EPSILON32 = Math.pow(2, -23);

export default class Quaternion {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Quaternion
	 *
	 * @param {Number} [w=0] - w value.
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @param {Number} [z=0] - z value.
	 * @return {module:math.Quaternion} - The newly created quaternion.
	 */
	constructor(w = 0.0, x = 0.0, y = 0.0, z = 0.0) {
		this._q = new Float32Array(4);
		this._q[0] = w;
		this._q[1] = x;
		this._q[2] = y;
		this._q[3] = z;
	}

	/**
	 * Creates a new quaternion from a javascript Array with w as first value.
	 *
	 * @param {Array} - The array containing the values with which to initialize this quaternion.
	 * @return {module:math.Quaternion} - The newly created quaternion set with values from the specified Array.
	 */
	static fromArray(array) {
		return new Quaternion(array[0], array[1], array[2], array[3]);
	}

	/**
	 * Creates a new quaternion from an axis rotation specified by rotating by theta around the axis axis.
	 * Axis will be normalized if necessary.
	 *
	 * @param {Number} theta - Angle by which to rotate around the specified axis.
	 * @param {Vec3} axis - The vector representation of the axis arount which to rotate.
	 *
	 * @return {module:math.Quaternion} - The newly created quaternion representing the specified rotation.
	 */
	static fromAxisRotation(theta, axis) {
		if(!axis.isUnit())
			axis = axis.clone().normalize();

		const half_theta = theta / 2.0;
		const w = Math.cos(half_theta);
		const s = Math.sin(half_theta);

		return new Quaternion(w, s * axis.x, s * axis.y, s * axis.z);
	}

	/**
	 * Creates a new identity quaternion.
	 *
	 * @return {module:math.Quaternion} - The newly created identity quaternion.
	 */
	static identity() {
		const q = new Quaternion();
		q._q[0] = 1.0;
		q._q[1] = 0.0;
		q._q[2] = 0.0;
		q._q[3] = 0.0;

		return q;
	}

	/**
	 * Creates a new random quaternion.
	 *
	 * @return {module:math.Quaternion} - The newly created quaternion set with random values between 0.0 and 1.0.
	 */
	static random() {
		const q = new Quaternion();
		q._q[0] = Math.random();
		q._q[1] = Math.random();
		q._q[2] = Math.random();

		return q;
	}

	/**
	 * Getter for this quaternion w component.
	 *
	 * @return {Number} - The w value;
	 */
	get w() { return this._q[0]; }

	/**
	 * Getter for this quaternion x component.
	 *
	 * @return {Number} - The x value;
	 */
	get x() { return this._q[1]; }

	/**
	 * Getter for this quaternion y component.
	 *
	 * @return {Number} - The y value;
	 */
	get y() { return this._q[2]; }

	/**
	 * Getter for this quaternion z component.
	 *
	 * @return {Number} - The z value;
	 */
	get z() { return this._q[3]; }

	/**
	 * Setter for this quaternion w component.
	 *
	 * @param {Number} w - The new w value.
	 */
	set w(w) { this._q[0] = w; }

	/**
	 * Setter for this quaternion x component.
	 *
	 * @param {Number} x - The new x value.
	 */
	set x(x) { this._q[1] = x; }

	/**
	 * Setter for this quaternion y component
	 *
	 * @param {Number} y - The new y value.
	 */
	set y(y) { this._q[2] = y; }

	/**
	 * Setter for this quaternion z component.
	 *
	 * @param {Number} z - The new z value.
	 */
	set z(z) { this._q[3] = z; }

	/**
	 * Sets the quaternion to identiy.
	 *
	 * @return {module:math.Quaternion} - This quaternion.
	 */
	identity() {
		this._q[0] = 1.0;
		this._q[1] = 0.0;
		this._q[2] = 0.0;
		this._q[3] = 0.0;

		return this;
	}

	/**
	 * Sets this quaternion values from an axis rotation specified by rotating by theta around the axis axis.
	 * Axis will be normalized if necessarry.
	 *
	 * @param {Number} theta - Angle by which to rotate around the specified axis.
	 * @param {Vec3} axis - The vector representation of the axis arount which to rotate.
	 *
	 * @return {module:math.Quaternion} - This quaternion representing the specified rotation.
	 */
	fromAxisRotation(theta, axis) {
		if(!axis.isUnit())
			axis = axis.clone().normalize();

		const half_theta = theta / 2.0;
		const s = Math.sin(half_theta);

		this._q[0] = Math.cos(half_theta);
		this._q[1] = s * axis.x;
		this._q[2] = s * axis.y;
		this._q[3] = s * axis.z;

		return this;
	}


	/**
	 * Copies values of quaternion q into this quaternion.
	 *
	 * @param {module:math.Quaternion} q - Quaternion from which to copy values.
	 * @return {module:math.Quaternion} - This Quaternion.
	 */
	copy(q) {
		this._q[0] = q._q[0];
		this._q[1] = q._q[1];
		this._q[2] = q._q[2];
		this._q[3] = q._q[3];

		return this;
	}

	/**
	 * Clones this quaternion.
	 *
	 * @return {module:math.Quaternion} - The newly cloned quaternion.
	 */
	clone() {
		return new Quaternion(this._q[0],this._q[1],this._q[2], this._q[3]);
	}

	/**
	 * Test for equality component wise using machine EPSILON for 32 bits (2^-23)
	 *
	 * @param {module:math.Quaternion} - The quaternion with which to make the comparison.
	 * @return {Boolean} - true if this quaternion and the specified quaternion have the same components, false otherwise.
	 */
	equals(q) {
		return Math.abs(this._q[0] - q._q[0]) < EPSILON32 &&
			Math.abs(this._q[1] - q._q[1]) < EPSILON32 &&
			Math.abs(this._q[2] - q._q[2]) < EPSILON32 &&
			Math.abs(this._q[3] - q._q[3]) < EPSILON32;
	}

	/**
	 * Inverts this quaternion.
	 *
	 * @return {module:math.Quaternion} - The inversed quaternion.
	 */
	invert() {
		this._q[1] = -this._q[1];
		this._q[2] = -this._q[2];
		this._q[3] = -this._q[3];

		return this;
	}

	/**
	 * Multiplies this quaternion by another quaternion.
	 * This function does not allocate unecessary objects.
	 *
	 * @param {module:math.Quaternion} n - Quaternion by which to multiply this quaternion.
	 * @return {module:math.Quaternion} - The resulting quaternion.
	 */
	multiply(q) {
		// w1*w2 - v1.v2
		const w = this._q[0] * q._q[0] - (this._q[1] * q._q[1] + this._q[2] * q._q[2] + this._q[3] * q._q[3]);

		// w1*v2 + w2*v1 + v1xv2
		const x = this._q[0] * q._q[1] + q._q[0] * this._q[1] + this._q[2] * q._q[3] - this._q[3] * q._q[2];
		const y = this._q[0] * q._q[2] + q._q[0] * this._q[2] + this._q[3] * q._q[1] - this._q[1] * q._q[3];
		const z = this._q[0] * q._q[3] + q._q[0] * this._q[3] + this._q[1] * q._q[2] - this._q[2] * q._q[1];

		this._q[0] = w;
		this._q[1] = x;
		this._q[2] = y;
		this._q[3] = z;

		return this;
	}

	/**
	 * Rotates the specified vector in R3.
	 * This quaternion is assumed to be a unit quaternion.
	 *
	 * @param {module:math:Vec3} q - The vector to be rotated.
	 * @return {module:math:Vec3} - The rotated vector.
	 */
	rotate(v) {
		const x = v.x;
		const y = v.y;
		const z = v.z;

		const x2 = 2.0 * this._q[1];
		const y2 = 2.0 * this._q[2];
		const z2 = 2.0 * this._q[3];

		const xx2 = x2 * this._q[1];
		const xy2 = x2 * this._q[2];
		const xz2 = x2 * this._q[3];
		const yy2 = y2 * this._q[2];
		const yz2 = y2 * this._q[3];
		const zz2 = z2 * this._q[3];

		const wx2 = this._q[0] * x2;
		const wy2 = this._q[0] * y2;
		const wz2 = this._q[0] * z2;

		v.x = x * (1.0 - yy2 - zz2) + y * (xy2 - wz2) + z * (xz2 + wy2);
		v.y = y * (1.0 - xx2 - zz2) + x * (xy2 + wz2) + z * (yz2 - wx2);
		v.z = z * (1.0 - xx2 - yy2) + x * (xz2 - wy2) + y * (yz2 + wx2);

		return v;
	}


	/**
	 * Returns a human readable string representing this quaternion.
	 *
	 * @param {Number} [p=16] - precision to use when printing coordinate values.
	 * @return {String} - A human readable String representing this quaternion.
	 */
	toString(precision = 16) {
		return `[${this._q[0].toFixed(p)}, ${this._q[1].toFixed(p)}, ${this._q[2].toFixed(p)}, ${this._q[3].toFixed(p)}]`;
	}
}
