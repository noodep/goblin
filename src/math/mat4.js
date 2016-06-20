/**
 * @fileOverview Matrix manipulation library for computer graphics assuming column major flatenning.
 * @author Noodep
 * @version 0.44
 */

'use strict';

export default class Mat4 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Mat4
	 *
	 * @return {module:math.Mat4} - The newly created matrix.
	 */
	constructor() {
		this._m = new Float64Array(16);
		this._m[0] = 0.0;
		this._m[1] = 0.0;
		this._m[2] = 0.0;
		this._m[3] = 0.0;
		this._m[4] = 0.0;
		this._m[5] = 0.0;
		this._m[6] = 0.0;
		this._m[7] = 0.0;
		this._m[8] = 0.0;
		this._m[9] = 0.0;
		this._m[10] = 0.0;
		this._m[11] = 0.0;
		this._m[12] = 0.0;
		this._m[13] = 0.0;
		this._m[14] = 0.0;
		this._m[15] = 0.0;
	}

	/**
	 * Creates a new identity matrix.
	 *
	 * @return {module:math.Mat4} - The newly created matrix set to identity.
	 */
	static identity() {
		const m = new Mat4();
		m._m[0] = 1.0;
		m._m[1] = 0.0;
		m._m[2] = 0.0;
		m._m[3] = 0.0;
		m._m[4] = 0.0;
		m._m[5] = 1.0;
		m._m[6] = 0.0;
		m._m[7] = 0.0;
		m._m[8] = 0.0;
		m._m[9] = 0.0;
		m._m[10] = 1.0;
		m._m[11] = 0.0;
		m._m[12] = 0.0;
		m._m[13] = 0.0;
		m._m[14] = 0.0;
		m._m[15] = 1.0;

		return m;
	}

	/**
	 * Copies the values of the specified matrix into this matrix.
	 *
	 * @param {module:math.Mat4} m - The matrix from which to copy the values.
	 * @return {module:math.Mat4} - This matrix with the new values.
	 */
	copy(m) {
		this._m[0] = m._m[0];
		this._m[1] = m._m[1];
		this._m[2] = m._m[2];
		this._m[3] = m._m[3];
		this._m[4] = m._m[4];
		this._m[5] = m._m[5];
		this._m[6] = m._m[6];
		this._m[7] = m._m[7];
		this._m[8] = m._m[8];
		this._m[9] = m._m[9];
		this._m[10] = m._m[10];
		this._m[11] = m._m[11];
		this._m[12] = m._m[12];
		this._m[13] = m._m[13];
		this._m[14] = m._m[14];
		this._m[15] = m._m[15];

		return this;
	}

	/**
	 * Clones the current matrix.
	 *
	 * @return {module:math.Mat4} - The newly cloned matrix.
	 */
	clone() {
		const clone = new Mat4();
		clone._m[0] = this._m[0];
		clone._m[1] = this._m[1];
		clone._m[2] = this._m[2];
		clone._m[3] = this._m[3];
		clone._m[4] = this._m[4];
		clone._m[5] = this._m[5];
		clone._m[6] = this._m[6];
		clone._m[7] = this._m[7];
		clone._m[8] = this._m[8];
		clone._m[9] = this._m[9];
		clone._m[10] = this._m[10];
		clone._m[11] = this._m[11];
		clone._m[12] = this._m[12];
		clone._m[13] = this._m[13];
		clone._m[14] = this._m[14];
		clone._m[15] = this._m[15];

		return clone;
	}

	/**
	 * Sets the matrix to the identity matrix (ones on the diagonal, zeroes everywhere else).
	 *
	 * @return {module:math.Mat4} - The matrix now set to identity.
	 */
	identity() {
		this._m[0] = 1.0;
		this._m[1] = 0.0;
		this._m[2] = 0.0;
		this._m[3] = 0.0;
		this._m[4] = 0.0;
		this._m[5] = 1.0;
		this._m[6] = 0.0;
		this._m[7] = 0.0;
		this._m[8] = 0.0;
		this._m[9] = 0.0;
		this._m[10] = 1.0;
		this._m[11] = 0.0;
		this._m[12] = 0.0;
		this._m[13] = 0.0;
		this._m[14] = 0.0;
		this._m[15] = 1.0;

		return this;
	}

	/**
	 * Transposes the matrix.
	 *
	 * @return {module:math.Mat4} - The transposed matrix.
	 */
	transpose() {
		const e01 = this._m[1];
		const e02 = this._m[2];
		const e03 = this._m[3];
		const e12 = this._m[6];
		const e13 = this._m[7];
		const e23 = this._m[11];

		this._m[1] = this._m[4];
		this._m[2] = this._m[8];
		this._m[3] = this._m[12];
		this._m[6] = this._m[9];
		this._m[7] = this._m[13];
		this._m[11] = this._m[14];

		this._m[4] = e01;
		this._m[8] = e02;
		this._m[12] = e03;
		this._m[9] = e12;
		this._m[13] = e13;
		this._m[14] = e23;

		return this;
	}

	/**
	 * Multiplies the matrix by the specified matrix.
	 *
	 * @param {module:math.Mat4} m - Matrix by which to multiply.
	 * @return {module:math.Mat4} - This matrix multiplied by the specified matrix.
	 */
	multiply(m) {
		const a00 = this._m[0];
		const a01 = this._m[1];
		const a02 = this._m[2];
		const a03 = this._m[3];
		const a10 = this._m[4];
		const a11 = this._m[5];
		const a12 = this._m[6];
		const a13 = this._m[7];
		const a20 = this._m[8];
		const a21 = this._m[9];
		const a22 = this._m[10];
		const a23 = this._m[11];
		const a30 = this._m[12];
		const a31 = this._m[13];
		const a32 = this._m[14];
		const a33 = this._m[15];

		const b0 = m._m[0];
		const b1 = m._m[1];
		const b2 = m._m[2];
		const b3 = m._m[3];
		this._m[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this._m[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this._m[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this._m[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = m._m[4];
		b1 = m._m[5];
		b2 = m._m[6];
		b3 = m._m[7];
		this._m[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this._m[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this._m[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this._m[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = m._m[8];
		b1 = m._m[9];
		b2 = m._m[10];
		b3 = m._m[11];
		this._m[8]  = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this._m[9]  = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this._m[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this._m[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = m._m[12];
		b1 = m._m[13];
		b2 = m._m[14];
		b3 = m._m[15];
		this._m[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this._m[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this._m[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this._m[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		return this;
	}

	/**
	 * Generates a perspective projection matrix.
	 *
	 * @param {Number} fovy - Vertical field of view in radians.
	 * @param {Number} ar - Aspect ratio defined by width / height
	 * @param {Number} near - Z distance to the near cliping plane
	 * @param {Number} far - Z distance to the far cliping plane
	 * @return {module:math.Mat4} - This matrix set to the projection specified by the parameters above.
	 */
	perspective(fovy, ar, near, far) {
		const depth = (far - near);
		const scale = 1.0 / Math.tan(fovy * 0.5);

		this._m[0] = scale / ar;
		this._m[1] = 0.0;
		this._m[2] = 0.0;
		this._m[3] = 0.0;
		this._m[4] = 0.0;
		this._m[5] = scale;
		this._m[6] = 0.0;
		this._m[7] = 0.0;
		this._m[8] = 0.0;
		this._m[9] = 0.0;
		this._m[10] = -(far + near) / depth;
		this._m[11] = -1;
		this._m[12] = 0.0;
		this._m[13] = 0.0;
		this._m[14] = -(2.0 * far * near) / depth;
		this._m[15] = 0.0;

		return this;
	}

	/**
	 * Applies a translation in R3 to this matrix.
	 *
	 * @param {module:math.Vec3} v - Vector by which to translate this matrix.
	 * @return {module:math.m4} - The translated matrix.
	 */
	translate(v) {
		const x = v.x;
		const y = v.y;
		const z = v.z;

		this._m[12] = this._m[0] * x + this._m[4] * y + this._m[8]  * z + this._m[12];
		this._m[13] = this._m[1] * x + this._m[5] * y + this._m[9]  * z + this._m[13];
		this._m[14] = this._m[2] * x + this._m[6] * y + this._m[10] * z + this._m[14];
		this._m[15] = this._m[3] * x + this._m[7] * y + this._m[11] * z + this._m[15];

		return this;
	}

	/**
	 * Applies a translation in R3 to this matrix.
	 *
	 * @param {Number} x - amount by which to translate this matrix along the x axis.
	 * @param {Number} y - amount by which to translate this matrix along the y axis.
	 * @param {Number} z - amount by which to translate this matrix along the z axis.
	 * @return {module:math.m4} - The translated matrix.
	 */
	translateXYZ(x, y, z) {
		this._m[12] = this._m[0] * x + this._m[4] * y + this._m[8]  * z + this._m[12];
		this._m[13] = this._m[1] * x + this._m[5] * y + this._m[9]  * z + this._m[13];
		this._m[14] = this._m[2] * x + this._m[6] * y + this._m[10] * z + this._m[14];
		this._m[15] = this._m[3] * x + this._m[7] * y + this._m[11] * z + this._m[15];

		return this;
	}

	/**
	 * Applies a rotation in R3 around the X axis to the matrix.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 * @return {module:math.m4} - The rotated matrix.
	 */
	rotateX(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		const e10 = this._m[4];
		const e11 = this._m[5];
		const e12 = this._m[6];
		const e13 = this._m[7];
		const e20 = this._m[8];
		const e21 = this._m[9];
		const e22 = this._m[10];
		const e23 = this._m[11];

		this._m[4] = e10 * c + e20 * s;
		this._m[5] = e11 * c + e21 * s;
		this._m[6] = e12 * c + e22 * s;
		this._m[7] = e13 * c + e23 * s;

		this._m[8]  = -e10 * s + e20 * c;
		this._m[9]  = -e11 * s + e21 * c;
		this._m[10] = -e12 * s + e22 * c;
		this._m[11] = -e13 * s + e23 * c;

		return this;
	}

	/**
	 * Applies a rotation in R3 around the Y axis to the matrix.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 * @return {module:math.m4} - The rotated matrix.
	 */
	rotateY(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		const e00 = this._m[0];
		const e01 = this._m[1];
		const e02 = this._m[2];
		const e03 = this._m[3];
		const e20 = this._m[8];
		const e21 = this._m[9];
		const e22 = this._m[10];
		const e23 = this._m[11];

		this._m[0] = e00 * c - e20 * s;
		this._m[1] = e01 * c - e21 * s;
		this._m[2] = e02 * c - e22 * s;
		this._m[3] = e03 * c - e23 * s;

		this._m[8]  = e00 * s + e20 * c;
		this._m[9]  = e01 * s + e21 * c;
		this._m[10] = e02 * s + e22 * c;
		this._m[11] = e03 * s + e23 * c;

		return this;
	}

	/**
	 * Applies a rotation in R3 around the Z axis to the matrix.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 * @return {module:math.m4} - The rotated matrix.
	 */
	rotateZ(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		const e00 = this._m[0];
		const e01 = this._m[1];
		const e02 = this._m[2];
		const e03 = this._m[3];
		const e10 = this._m[4];
		const e11 = this._m[5];
		const e12 = this._m[6];
		const e13 = this._m[7];

		this._m[0] = e00 * c + e10 * s;
		this._m[1] = e01 * c + e11 * s;
		this._m[2] = e02 * c + e12 * s;
		this._m[3] = e03 * c + e13 * s;

		this._m[4] = -e00 * s + e10 * c;
		this._m[5] = -e01 * s + e11 * c;
		this._m[6] = -e02 * s + e12 * c;
		this._m[7] = -e03 * s + e13 * c;

		return this;
	}

	/**
	 * Applies a rotation around the specified axis to the matrix.
	 *
	 * @param {module:math.Vec3} axis - The axis to rotate around.
	 * @param {Number} theta - The angle (in radians) by which to rotate.
	 * @return {module:math.m4} - The rotated matrix.
	 */
	rotate(axis, theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		const r = identity();
		const a = axis.clone().normalize();

		r._m[0] = c + (1-c) * a.x * a.x;
		r._m[1] =     (1-c) * a.x * a.y + s * a.z;
		r._m[2] =     (1-c) * a.x * a.z - s * a.y;

		r._m[4] =     (1-c) * a.y * a.x - s * a.z;
		r._m[5] = c + (1-c) * a.y * a.y;
		r._m[6] =     (1-c) * a.y * a.z + s * a.x;

		r._m[8] =     (1-c) * a.z * a.x + s * a.y;
		r._m[9] =     (1-c) * a.z * a.y - s * a.x;
		r._m[10]= c + (1-c) * a.z * a.z;

		this.multiply(r);

		return this;
	}

	/**
	 * Scales the matrix by the given vector.
	 *
	 * @param {module:math.Vec3} v - Vector by which to scale the matrix.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	scale(v) {
		const x = v.x;
		const y = v.y;
		const z = v.z;

		this.m[0] *= x;
		this.m[1] *= x;
		this.m[2] *= x;
		this.m[3] *= x;
		this.m[4] *= y;
		this.m[5] *= y;
		this.m[6] *= y;
		this.m[7] *= y;
		this.m[8] *= z;
		this.m[9] *= z;
		this.m[10] *= z;
		this.m[11] *= z;

		return this;
	}

	/**
	 * Creates a human readable string of the matrix.
	 *
	 * @return {String} - Human readable string of the matrix.
	 */
	toString() {
		return `[${this._m[0].toFixed(16)}, ${this._m[4].toFixed(16)}, ${this._m[8].toFixed(16)}, ${this._m[12].toFixed(16)}\n` +
			` ${this._m[1].toFixed(16)}, ${this._m[5].toFixed(16)}, ${this._m[9].toFixed(16)}, ${this._m[13].toFixed(16)}\n`+
			` ${this._m[2].toFixed(16)}, ${this._m[6].toFixed(16)}, ${this._m[10].toFixed(16)}, ${this._m[14].toFixed(16)}\n`+
			` ${this._m[3].toFixed(16)}, ${this._m[7].toFixed(16)}, ${this._m[11].toFixed(16)}, ${this._m[15].toFixed(16)}\n`;
	}
}

