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
	 * @alias m3
	 * @return {module:math.m3} The newly created matrix.
	 */
	var m3 = function() {
		this.m = new Float32Array(9);
		this.m[0] = 0.0;
		this.m[1] = 0.0;
		this.m[2] = 0.0;
		this.m[3] = 0.0;
		this.m[4] = 0.0;
		this.m[5] = 0.0;
		this.m[6] = 0.0;
		this.m[7] = 0.0;
		this.m[8] = 0.0;
	};

	/**
	 * Identity
	 * @return {module:math.m3} A newly created matrix set to identity.
	 */
	m3.identity = function() {
		return new m3().identity();
	}

	/**
	 * Clones the current matrix.
	 * @return {module:math.m3} The newly cloned matrix.
	 */
	m3.prototype.clone = function() {
		var clone = new m3();
		clone.m[0] = this.m[0];
		clone.m[1] = this.m[1];
		clone.m[2] = this.m[2];
		clone.m[3] = this.m[3];
		clone.m[4] = this.m[4];
		clone.m[5] = this.m[5];
		clone.m[6] = this.m[6];
		clone.m[7] = this.m[7];
		clone.m[8] = this.m[8];
		return clone;
	};

	/**
	 * Creates a 3x3 matrix from upper left values of a 4x4 matrix
	 * @param {module:math.m4} The 4x4 matrix from which to copy the values
	 * @return {module:math.m3} The newly created matrix.
	 */
	m3.fromM4 = function(m4) {
		var ret = new m3();
		ret.m[0] = m4.m[0];
		ret.m[1] = m4.m[1];
		ret.m[2] = m4.m[2];
		ret.m[3] = m4.m[4];
		ret.m[4] = m4.m[5];
		ret.m[5] = m4.m[6];
		ret.m[6] = m4.m[8];
		ret.m[7] = m4.m[9];
		ret.m[8] = m4.m[10];

		return ret;
	}


	/**
	 * Sets the matrix to the identity matrix (ones on the diagonal)
	 * @return {module:math.m3} The matrix now set to identity.
	 */
	m3.prototype.identity = function() {
		this.m[0] = 1.0;
		this.m[1] = 0.0;
		this.m[2] = 0.0;
		this.m[3] = 0.0;
		this.m[4] = 1.0;
		this.m[5] = 0.0;
		this.m[6] = 0.0;
		this.m[7] = 0.0;
		this.m[8] = 1.0;
		return this;
	};

	/**
	 * Transpose the matrix
	 * @return {module:math.m3} The transposed matrix.
	 */
	m3.prototype.transpose = function() {
		var e01 = this.m[1], e02 = this.m[2], e12 = this.m[5];

		this.m[1] = this.m[3];
		this.m[2] = this.m[6];
		this.m[5] = this.m[7];

		this.m[3] = e01;
		this.m[6] = e02;
		this.m[7] = e12;

		return this;
	};

	/**
	 * Compute inverted matrix if possible
	 * @return {module:math.m3} The invert matrix.
	 * @throw an exception if the invert does not exists.
	 */

	m3.prototype.invert = function() {
		var e00 = this.m[0],  e01 = this.m[1],  e02 = this.m[2],
			e10 = this.m[3],  e11 = this.m[4],  e12 = this.m[5],
			e20 = this.m[6],  e21 = this.m[7],  e22 = this.m[8];

		// Cofactor matrix elements
		var c00 =  (e11*e22 - e21*e12),
			c01 = -(e10*e22 - e20*e12),
			c02 =  (e10*e21 - e20*e11),
			c10 = -(e01*e22 - e21*e02),
			c11 =  (e00*e22 - e20*e02),
			c12 = -(e00*e21 - e20*e01),
			c20 =  (e01*e12 - e11*e02),
			c21 = -(e00*e12 - e10*e02),
			c22 =  (e00*e11 - e10*e01);

		var det = e00*c00 + e01*c01 + e02*c02;

		if(det == 0)
			throw new Error("invert of this matrix does not exists");
		
		var invdet = 1.0 / det;

		this.m[0] = invdet * c00;
		this.m[1] = invdet * c10;
		this.m[2] = invdet * c20;
		this.m[3] = invdet * c01;
		this.m[4] = invdet * c11;
		this.m[5] = invdet * c21;
		this.m[6] = invdet * c02;
		this.m[7] = invdet * c12;
		this.m[8] = invdet * c22;
		
		return this;
	}

	/**
	 * Multiplies the matrix by the given matrix.
	 * @param {module:math.m3} mat Matrix to multiply by.
	 * @return {module:math.m3} Matrix multiplied by the matrix passed in argument. 
	 */
	m3.prototype.mul = function(mat) {
		var e00 = this.m[0],  e01 = this.m[1],  e02 = this.m[2],
			e10 = this.m[3],  e11 = this.m[4],  e12 = this.m[5],
			e20 = this.m[6],  e21 = this.m[7],  e22 = this.m[8];

		var b0  = mat.m[0], b1 = mat.m[1], b2 = mat.m[2];  
		this.m[0] = b0*e00 + b1*e10 + b2*e20;
		this.m[1] = b0*e01 + b1*e11 + b2*e21;
		this.m[2] = b0*e02 + b1*e12 + b2*e22;

    	b0 = mat.m[3]; b1 = mat.m[4]; b2 = mat.m[5];
		this.m[3] = b0*e00 + b1*e10 + b2*e20;
		this.m[4] = b0*e01 + b1*e11 + b2*e21;
		this.m[5] = b0*e02 + b1*e12 + b2*e22;

		b0 = mat.m[6]; b1 = mat.m[7]; b2 = mat.m[8];
		this.m[6] = b0*e00 + b1*e10 + b2*e20;
		this.m[7] = b0*e01 + b1*e11 + b2*e21;
		this.m[8] = b0*e02 + b1*e12 + b2*e22;

		return this;
	};

	// /**
	//  * Apply a translation to the matrix.
	//  * @param {Number} x Translation delta on x.
	//  * @param {Number} y Translation delta on y.
	//  * @param {Number} z Translation delta on z.
	//  * @return {module:math.m3} This matrix translated
	//  */
	// m3.prototype.translate = function(vec3) {
	// 	var x = vec3[0];
	// 	var y = vec3[1];
	// 	var z = vec3[2];
	// 	this.m[12] = this.m[0] * x + this.m[4] * y + this.m[8]  * z + this.m[12];
	// 	this.m[13] = this.m[1] * x + this.m[5] * y + this.m[9]  * z + this.m[13];
	// 	this.m[14] = this.m[2] * x + this.m[6] * y + this.m[10] * z + this.m[14];
	// 	this.m[15] = this.m[3] * x + this.m[7] * y + this.m[11] * z + this.m[15];
	// 	return this;
	// }

	// /**
	//  * Applies a rotation around the x axis to the matrix.
	//  * @param {Number} theta Rotation angle in radians
	//  * @return {module:math.m3} The rotated matrix.
	//  */
	// m3.prototype.rotateX = function(theta) {
	// 	var c = Math.cos(theta);
	// 	var s = Math.sin(theta);

	// 	var e10 = this.m[4],
	// 		e11 = this.m[5],
	// 		e12 = this.m[6],
	// 		e13 = this.m[7],
	// 		e20 = this.m[8],
	// 		e21 = this.m[9],
	// 		e22 = this.m[10],
	// 		e23 = this.m[11];

	// 	this.m[4] = e10 * c + e20 * s;
	// 	this.m[5] = e11 * c + e21 * s;
	// 	this.m[6] = e12 * c + e22 * s;
	// 	this.m[7] = e13 * c + e23 * s;

	// 	this.m[8]  = -e10 * s + e20 * c;
	// 	this.m[9]  = -e11 * s + e21 * c;
	// 	this.m[10] = -e12 * s + e22 * c;
	// 	this.m[11] = -e13 * s + e23 * c;

	// 	return this;
	// }

	// /**
	//  * Applies a rotation around the y axis to the matrix.
	//  * @param {Number} theta Rotation angle in radians
	//  * @return {module:math.m3} The rotated matrix.
	//  */
	// m3.prototype.rotateY = function(theta) {
	// 	var c = Math.cos(theta);
	// 	var s = Math.sin(theta);

	// 	var e00 = this.m[0],
	// 		e01 = this.m[1],
	// 		e02 = this.m[2],
	// 		e03 = this.m[3],
	// 		e20 = this.m[8],
	// 		e21 = this.m[9],
	// 		e22 = this.m[10],
	// 		e23 = this.m[11];

	// 	this.m[0] = e00 * c - e20 * s;
	// 	this.m[1] = e01 * c - e21 * s;
	// 	this.m[2] = e02 * c - e22 * s;
	// 	this.m[3] = e03 * c - e23 * s;

	// 	this.m[8]  = e00 * s + e20 * c;
	// 	this.m[9]  = e01 * s + e21 * c;
	// 	this.m[10] = e02 * s + e22 * c;
	// 	this.m[11] = e03 * s + e23 * c;

	// 	return this;
	// }

	// /**
	//  * Applies a rotation around the z axis to the matrix.
	//  * @param {Number} theta Rotation angle in radians
	//  * @return {module:math.m3} The rotated matrix.
	//  */
	// m3.prototype.rotateZ = function(theta) {
	// 	var c = Math.cos(theta);
	// 	var s = Math.sin(theta);

	// 	var e00 = this.m[0],
	// 		e01 = this.m[1],
	// 		e02 = this.m[2],
	// 		e03 = this.m[3],
	// 		e10 = this.m[4],
	// 		e11 = this.m[5],
	// 		e12 = this.m[6],
	// 		e13 = this.m[7];

	// 	this.m[0] = e00 * c + e10 * s;
	// 	this.m[1] = e01 * c + e11 * s;
	// 	this.m[2] = e02 * c + e12 * s;
	// 	this.m[3] = e03 * c + e13 * s;

	// 	this.m[4] = -e00 * s + e10 * c;
	// 	this.m[5] = -e01 * s + e11 * c;
	// 	this.m[6] = -e02 * s + e12 * c;
	// 	this.m[7] = -e03 * s + e13 * c;

	// 	return this;
	// }

	// /**
	//  * Scales the matrix by the given vector.
	//  * @param {module:math.v3} vec3 Vector by which to scale the matrix.
	//  * @return {module:math.m3} The scaled matrix.
	//  */
	// m3.prototype.scale = function(vec3) {
	// 	var x = vec3[0];
	// 	var y = vec3[1];
	// 	var z = vec3[2];
	// 	this.m[0] *= x;
	// 	this.m[1] *= x;
	// 	this.m[2] *= x;
	// 	this.m[3] *= x;
	// 	this.m[4] *= y;
	// 	this.m[5] *= y;
	// 	this.m[6] *= y;
	// 	this.m[7] *= y;
	// 	this.m[8] *= z;
	// 	this.m[9] *= z;
	// 	this.m[10] *=  z;
	// 	this.m[11] *=  z;
	// 	return this;
	// }

	m3.prototype.equals = function(m) {
		for (let i = 0; i < 9; i++) {
			if (this.m[i] !== m.m[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Creates a human readable string of the matrix.
	 * @return {String} Human readable string of the matrix.
	 */
	m3.prototype.toString = function() {
		return '[' +
		this.m[0] + ',' + this.m[3] + ',' + this.m[6] + '\n ' +
		this.m[1] + ',' + this.m[4] + ',' + this.m[7] + '\n ' +
		this.m[2] + ',' + this.m[5] + ',' + this.m[8] + '\n ';
	};

	Object.defineProperty(m3.prototype, 'str', {
		get : function() { return this.toString();},
	});

	Goblin.extend('m3', m3);
})(this);
