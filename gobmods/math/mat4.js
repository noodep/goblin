/**
 * @fileOverview Matrix manipulation library for computer graphics assuming
 * column major flatenning.
 * @author Noodep
 * @version 0.3
 */
(function(context, undefined) {
	'use strict';

	var TO_RAD = Math.PI / 180.0;

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias m4
	 * @return {module:math.m4} The newly created matrix.
	 */
	var m4 = function() {
		this.m = new Float32Array(16);
		this.m[0] = 0.0;
		this.m[1] = 0.0;
		this.m[2] = 0.0;
		this.m[3] = 0.0;
		this.m[4] = 0.0;
		this.m[5] = 0.0;
		this.m[6] = 0.0;
		this.m[7] = 0.0;
		this.m[8] = 0.0;
		this.m[9] = 0.0;
		this.m[10] = 0.0;
		this.m[11] = 0.0;
		this.m[12] = 0.0;
		this.m[13] = 0.0;
		this.m[14] = 0.0;
		this.m[15] = 0.0;
	};

	/**
	 * Identity
	 * @return {module:math.m4} A newly created matrix set to identity.
	 */
	m4.identity = function() {
		return new m4().identity();
	}

	/**
	 * Creates a matrix describing the same rotation as a quaternion.
	 * @param {module:math.quat} q The quaternion to create from
	 * @return {module:math.m4} The rotation matrix
	 */
	m4.fromQuat = function(q) {
		var m = m4.identity();
		var xx = q.x * q.x;
		var yy = q.y * q.y;
		var zz = q.z * q.z;
		var xy = q.x * q.y;
		var xz = q.x * q.z;
		var yz = q.y * q.z;
		var wx = q.w * q.x;
		var wy = q.w * q.y;
		var wz = q.w * q.z;

		m.m[0] = 1 - 2 * (yy + zz);
		m.m[1] = 2 * (xy + wz);
		m.m[2] = 2 * (xz - wy);

		m.m[4] = 2 * (xy - wz);
		m.m[5] = 1 - 2 * (xx + zz);
		m.m[6] = 2 * (yz + wx);

		m.m[8] = 2 * (xz + wy);
		m.m[9] = 2 * (yz - wx);
		m.m[10] = 1 - 2 * (xx + yy);

		return m;
	}

	/**
	 * Clones the current matrix.
	 * @return {module:math.m4} The newly cloned matrix.
	 */
	m4.prototype.clone = function() {
		var clone = new m4();
		clone.m[0] = this.m[0];
		clone.m[1] = this.m[1];
		clone.m[2] = this.m[2];
		clone.m[3] = this.m[3];
		clone.m[4] = this.m[4];
		clone.m[5] = this.m[5];
		clone.m[6] = this.m[6];
		clone.m[7] = this.m[7];
		clone.m[8] = this.m[8];
		clone.m[9] = this.m[9];
		clone.m[10] = this.m[10];
		clone.m[11] = this.m[11];
		clone.m[12] = this.m[12];
		clone.m[13] = this.m[13];
		clone.m[14] = this.m[14];
		clone.m[15] = this.m[15];
		return clone;
	};


	/**
	 * Sets the matrix to the identity matrix (ones on the diagonal)
	 * @return {module:math.m4} The matrix now set to identity.
	 */
	m4.prototype.identity = function() {
		this.m[0] = 1.0;
		this.m[1] = 0.0;
		this.m[2] = 0.0;
		this.m[3] = 0.0;
		this.m[4] = 0.0;
		this.m[5] = 1.0;
		this.m[6] = 0.0;
		this.m[7] = 0.0;
		this.m[8] = 0.0;
		this.m[9] = 0.0;
		this.m[10] = 1.0;
		this.m[11] = 0.0;
		this.m[12] = 0.0;
		this.m[13] = 0.0;
		this.m[14] = 0.0;
		this.m[15] = 1.0;
		return this;
	};

	/**
	 * Transpose the matrix
	 * @return {module:math.m4} The transposed matrix.
	 */
	m4.prototype.transpose = function() {
		var e01 = this.m[1], e02 = this.m[2], e03 = this.m[3],
			e12 = this.m[6], e13 = this.m[7], e23 = this.m[11];

		this.m[1] = this.m[4];
		this.m[2] = this.m[8];
		this.m[3] = this.m[12];
		this.m[6] = this.m[9];
		this.m[7] = this.m[13];
		this.m[11] = this.m[14];

		this.m[4] = e01;
		this.m[8] = e02;
		this.m[12] = e03;
		this.m[9] = e12;
		this.m[13] = e13;
		this.m[14] = e23;

		return this;
	};

	/**
	 * Compute inverted matrix if possible
	 * @return {module:math.m4} The invert matrix.
	 * @throw an exception if the invert does not exists.
	 */
	m4.prototype.invert = function() {
		var e00 = this.m[0],  e01 = this.m[1],  e02 = this.m[2],  e03 = this.m[3],
			e10 = this.m[4],  e11 = this.m[5],  e12 = this.m[6],  e13 = this.m[7],
			e20 = this.m[8],  e21 = this.m[9],  e22 = this.m[10], e23 = this.m[11],
			e30 = this.m[12], e31 = this.m[13], e32 = this.m[14], e33 = this.m[15];

		// 2x2 cofactor elements
		var c_23_01 = e20 * e31 - e30 * e21;
		var c_23_02 = e20 * e32 - e30 * e22;
		var c_23_03 = e20 * e33 - e30 * e23;
		var c_23_12 = e21 * e32 - e31 * e22;
		var c_23_13 = e21 * e33 - e31 * e23;
		var c_23_23 = e22 * e33 - e32 * e23;

		var c_01_01 = e00 * e11 - e10 * e01;
		var c_01_02 = e00 * e12 - e10 * e02;
		var c_01_03 = e00 * e13 - e10 * e03;
		var c_01_12 = e01 * e12 - e11 * e02;
		var c_01_13 = e01 * e13 - e11 * e03;
		var c_01_23 = e02 * e13 - e12 * e03;

		this.m[0] = + (e11 * c_23_23 - e12 * c_23_13 + e13 * c_23_12);
		this.m[1] = - (e01 * c_23_23 - e02 * c_23_13 + e03 * c_23_12);
		this.m[2] = + (e31 * c_01_23 - e32 * c_01_13 + e33 * c_01_12);
		this.m[3] = - (e21 * c_01_23 - e22 * c_01_13 + e23 * c_01_12);

		var det = e00 * this.m[0] + e10 * this.m[1] + e20 * this.m[2] + e30 * this.m[3];
		if (det === 0.0) {
			throw new Error('Inverse of this matrix does not exist.');
		}

		this.m[0] /= det;
		this.m[1] /= det;
		this.m[2] /= det;
		this.m[3] /= det;

		this.m[4] = - (e10 * c_23_23 - e12 * c_23_03 + e13 * c_23_02) / det;
		this.m[5] = + (e00 * c_23_23 - e02 * c_23_03 + e03 * c_23_02) / det;
		this.m[6] = - (e30 * c_01_23 - e32 * c_01_03 + e33 * c_01_02) / det;
		this.m[7] = + (e20 * c_01_23 - e22 * c_01_03 + e23 * c_01_02) / det;

		this.m[8] = + (e10 * c_23_13 - e11 * c_23_03 + e13 * c_23_01) / det;
		this.m[9] = - (e00 * c_23_13 - e01 * c_23_03 + e03 * c_23_01) / det;
		this.m[10] = + (e30 * c_01_13 - e31 * c_01_03 + e33 * c_01_01) / det;
		this.m[11] = - (e20 * c_01_13 - e21 * c_01_03 + e23 * c_01_01) / det;

		this.m[12] = - (e10 * c_23_12 - e11 * c_23_02 + e12 * c_23_01) / det;
		this.m[13] = + (e00 * c_23_12 - e01 * c_23_02 + e02 * c_23_01) / det;
		this.m[14] = - (e30 * c_01_12 - e31 * c_01_02 + e32 * c_01_01) / det;
		this.m[15] = + (e20 * c_01_12 - e21 * c_01_02 + e22 * c_01_01) / det;

		return this;
	};

	/**
	 * Multiplies the matrix by the given matrix on the left (this = mat * this).
	 * @param {module:math.m4} mat Matrix to multiply by.
	 * @return {module:math.m4} Matrix multiplied by the matrix passed in argument. 
	 */
	m4.prototype.mul = function(mat) {
		var a00 = this.m[0],  a01 = this.m[1],  a02 = this.m[2],  a03 = this.m[3],
			a10 = this.m[4],  a11 = this.m[5],  a12 = this.m[6],  a13 = this.m[7],
			a20 = this.m[8],  a21 = this.m[9],  a22 = this.m[10], a23 = this.m[11],
			a30 = this.m[12], a31 = this.m[13], a32 = this.m[14], a33 = this.m[15];

		var b0  = mat.m[0], b1 = mat.m[1], b2 = mat.m[2], b3 = mat.m[3];  
		this.m[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this.m[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this.m[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this.m[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    	b0 = mat.m[4]; b1 = mat.m[5]; b2 = mat.m[6]; b3 = mat.m[7];
		this.m[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this.m[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this.m[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this.m[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = mat.m[8]; b1 = mat.m[9]; b2 = mat.m[10]; b3 = mat.m[11];
		this.m[8]  = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this.m[9]  = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this.m[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this.m[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = mat.m[12]; b1 = mat.m[13]; b2 = mat.m[14]; b3 = mat.m[15];
		this.m[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		this.m[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		this.m[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		this.m[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		return this;
	};

	/**
	 * Multiplies the matrix by the given matrix on the right (this = this * mat).
	 * @param {module:math.m4} mat Matrix to multiply by
	 * @return {module:math.m4} This matrix multiplied by the given matrix
	 */
	m4.prototype.mul_right = function(mat) {
		var a00 = this.m[0],  a01 = this.m[1],  a02 = this.m[2],  a03 = this.m[3],
			a10 = this.m[4],  a11 = this.m[5],  a12 = this.m[6],  a13 = this.m[7],
			a20 = this.m[8],  a21 = this.m[9],  a22 = this.m[10], a23 = this.m[11],
			a30 = this.m[12], a31 = this.m[13], a32 = this.m[14], a33 = this.m[15];

		var b0 = mat.m[0], b1 = mat.m[4], b2 = mat.m[8], b3 = mat.m[12];
		this.m[0]  = b0*a00 + b1*a01 + b2*a02 + b3*a03;
		this.m[4]  = b0*a10 + b1*a11 + b2*a12 + b3*a13;
		this.m[8]  = b0*a20 + b1*a21 + b2*a22 + b3*a23;
		this.m[12] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

		var b0 = mat.m[1], b1 = mat.m[5], b2 = mat.m[9], b3 = mat.m[13];
		this.m[1]  = b0*a00 + b1*a01 + b2*a02 + b3*a03;
		this.m[5]  = b0*a10 + b1*a11 + b2*a12 + b3*a13;
		this.m[9]  = b0*a20 + b1*a21 + b2*a22 + b3*a23;
		this.m[13] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

		var b0 = mat.m[2], b1 = mat.m[6], b2 = mat.m[10], b3 = mat.m[14];
		this.m[2]  = b0*a00 + b1*a01 + b2*a02 + b3*a03;
		this.m[6]  = b0*a10 + b1*a11 + b2*a12 + b3*a13;
		this.m[10] = b0*a20 + b1*a21 + b2*a22 + b3*a23;
		this.m[14] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

		var b0 = mat.m[3], b1 = mat.m[7], b2 = mat.m[11], b3 = mat.m[15];
		this.m[3]  = b0*a00 + b1*a01 + b2*a02 + b3*a03;
		this.m[7]  = b0*a10 + b1*a11 + b2*a12 + b3*a13;
		this.m[11] = b0*a20 + b1*a21 + b2*a22 + b3*a23;
		this.m[15] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

		return this;
	}

	/**
	 * Generates a perspective projection matrix.
	 * @param {Number} fovy Vertical field of view in degrees
	 * @param {Number} ar Aspect ratio defined by width / height
	 * @param {Number} near Z distance to the near cliping plane
	 * @param {Number} far Z distance to the far cliping plane
	 */
	m4.prototype.perspective = function(fovy, ar, near, far) {
		var depth = (far - near);
		var scale = 1.0 / Math.tan(fovy * 0.5 * TO_RAD);

		this.m[0] = scale / ar;
		this.m[1] = 0.0;
		this.m[2] = 0.0;
		this.m[3] = 0.0;
		this.m[4] = 0.0;
		this.m[5] = scale;
		this.m[6] = 0.0;
		this.m[7] = 0.0;
		this.m[8] = 0.0;
		this.m[9] = 0.0;
		this.m[10] = -(far + near) / depth;
		this.m[11] = -1;
		this.m[12] = 0.0;
		this.m[13] = 0.0;
		this.m[14] = -(2.0 * far * near) / depth;
		this.m[15] = 0.0;
		return this;
	};

	/**
	 * Apply a translation to the matrix.
	 * @param {module:math:v3} vec - Vector to translate the matrix
	 * @return {module:math.m4} This matrix translated
	 */
	m4.prototype.translate = function(vec3) {
		var x = vec3.x,
			y = vec3.y,
			z = vec3.z;
		this.m[12] = this.m[0] * x + this.m[4] * y + this.m[8]  * z + this.m[12];
		this.m[13] = this.m[1] * x + this.m[5] * y + this.m[9]  * z + this.m[13];
		this.m[14] = this.m[2] * x + this.m[6] * y + this.m[10] * z + this.m[14];
		this.m[15] = this.m[3] * x + this.m[7] * y + this.m[11] * z + this.m[15];
		return this;
	}

	/**
	 * Applies a rotation around the x axis to the matrix.
	 * @param {Number} theta Rotation angle in radians
	 * @return {module:math.m4} The rotated matrix.
	 */
	m4.prototype.rotateX = function(theta) {
		var c = Math.cos(theta);
		var s = Math.sin(theta);

		var e10 = this.m[4],
			e11 = this.m[5],
			e12 = this.m[6],
			e13 = this.m[7],
			e20 = this.m[8],
			e21 = this.m[9],
			e22 = this.m[10],
			e23 = this.m[11];

		this.m[4] = e10 * c + e20 * s;
		this.m[5] = e11 * c + e21 * s;
		this.m[6] = e12 * c + e22 * s;
		this.m[7] = e13 * c + e23 * s;

		this.m[8]  = -e10 * s + e20 * c;
		this.m[9]  = -e11 * s + e21 * c;
		this.m[10] = -e12 * s + e22 * c;
		this.m[11] = -e13 * s + e23 * c;

		return this;
	}

	/**
	 * Applies a rotation around the y axis to the matrix.
	 * @param {Number} theta Rotation angle in radians
	 * @return {module:math.m4} The rotated matrix.
	 */
	m4.prototype.rotateY = function(theta) {
		var c = Math.cos(theta);
		var s = Math.sin(theta);

		var e00 = this.m[0],
			e01 = this.m[1],
			e02 = this.m[2],
			e03 = this.m[3],
			e20 = this.m[8],
			e21 = this.m[9],
			e22 = this.m[10],
			e23 = this.m[11];

		this.m[0] = e00 * c - e20 * s;
		this.m[1] = e01 * c - e21 * s;
		this.m[2] = e02 * c - e22 * s;
		this.m[3] = e03 * c - e23 * s;

		this.m[8]  = e00 * s + e20 * c;
		this.m[9]  = e01 * s + e21 * c;
		this.m[10] = e02 * s + e22 * c;
		this.m[11] = e03 * s + e23 * c;

		return this;
	}

	/**
	 * Applies a rotation around the z axis to the matrix.
	 * @param {Number} theta Rotation angle in radians
	 * @return {module:math.m4} The rotated matrix.
	 */
	m4.prototype.rotateZ = function(theta) {
		var c = Math.cos(theta);
		var s = Math.sin(theta);

		var e00 = this.m[0],
			e01 = this.m[1],
			e02 = this.m[2],
			e03 = this.m[3],
			e10 = this.m[4],
			e11 = this.m[5],
			e12 = this.m[6],
			e13 = this.m[7];

		this.m[0] = e00 * c + e10 * s;
		this.m[1] = e01 * c + e11 * s;
		this.m[2] = e02 * c + e12 * s;
		this.m[3] = e03 * c + e13 * s;

		this.m[4] = -e00 * s + e10 * c;
		this.m[5] = -e01 * s + e11 * c;
		this.m[6] = -e02 * s + e12 * c;
		this.m[7] = -e03 * s + e13 * c;

		return this;
	}

	/**
	 * Applies a rotation around the axis to the matrix.
	 * @param {Vec3} axis The axis to rotate around
	 * @param {Number} theta The angle (in radians) to rotate
	 * @return {module:math.m4} The rotated matrix
	 */
	m4.prototype.rotate = function(axis, theta) {
		var c = Math.cos(theta);
		var s = Math.sin(theta);

		var rot = m4.identity();
		axis.normalize();
		
		rot.m[0] = c + (1-c) * axis.x * axis.x;
		rot.m[1] =     (1-c) * axis.x * axis.y + s * axis.z;
		rot.m[2] =     (1-c) * axis.x * axis.z - s * axis.y;

		rot.m[4] =     (1-c) * axis.y * axis.x - s * axis.z;
		rot.m[5] = c + (1-c) * axis.y * axis.y;
		rot.m[6] =     (1-c) * axis.y * axis.z + s * axis.x;

		rot.m[8] =     (1-c) * axis.z * axis.x + s * axis.y;
		rot.m[9] =     (1-c) * axis.z * axis.y - s * axis.x;
		rot.m[10]= c + (1-c) * axis.z * axis.z;

		this.mul(rot);
		return this;
	}

	/**
	 * Rotates this matrix by a quaternion.
	 * @param {module:math.quat} q The quaternion to rotate by
	 * @return {module:math.m4} The rotated matrix
	 */
	m4.prototype.rotateQuat = function(q) {
		return this.mul(m4.fromQuat(q));
	}

	/**
	 * Scales the matrix by the given vector.
	 * @param {module:math.v3} vec3 Vector by which to scale the matrix.
	 * @return {module:math.m4} The scaled matrix.
	 */
	m4.prototype.scale = function(vec3) {
		var x = vec3.x,
			y = vec3.y,
			z = vec3.z;
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
		this.m[10] *=  z;
		this.m[11] *=  z;
		return this;
	}



	/**
	 * Creates a human readable string of the matrix.
	 * @return {String} Human readable string of the matrix.
	 */
	m4.prototype.toString = function() {
		return '[' +
		this.m[0] + ',' + this.m[4] + ',' + this.m[8]  + ',' + this.m[12]  + '\n ' +
		this.m[1] + ',' + this.m[5] + ',' + this.m[9]  + ',' + this.m[13]  + '\n ' +
		this.m[2] + ',' + this.m[6] + ',' + this.m[10] + ',' + this.m[14] + '\n ' +
		this.m[3] + ',' + this.m[7] + ',' + this.m[11] + ',' + this.m[15] + ']';		
	};

	Object.defineProperty(m4.prototype, 'str', {
		get : function() { return this.toString();},
	});

	Goblin.extend('m4', m4);
})(this);
