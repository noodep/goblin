// Matrix manipulation library for computer graphics assuming column major flatenning.
(function(window, document, undefined) {
	'use strict';

	var TO_RAD = Math.PI / 180.0;

	m4.identity = function() {
		return new m4().identity();
	}

	function m4() {
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

	// Generates a perspective projection matrix
	// fovy	= vertical field of view in degrees
	// ar	= aspect ratio defined by width / height
	// near	= z distance to the near cliping plane
	// far	= z distance to the far cliping plane
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

	m4.prototype.translate = function(x,y,z) {
		this.m[12] = this.m[0] * x + this.m[4] * y + this.m[8]  * z + this.m[12];
		this.m[13] = this.m[1] * x + this.m[5] * y + this.m[9]  * z + this.m[13];
		this.m[14] = this.m[2] * x + this.m[6] * y + this.m[10] * z + this.m[14];
		this.m[15] = this.m[3] * x + this.m[7] * y + this.m[11] * z + this.m[15];
		return this;
	}

	// multiplies current matrix with a 3D rotation matrix around axis X
	// assuming a right handed space
	// theta = rotation angle in radians
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

	// multiplies current matrix with a 3D rotation matrix around axis Y
	// assuming a right handed space
	// theta = rotation angle in radians
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

	// multiplies current matrix with a 3D rotation matrix around axis Z
	// assuming a right handed space
	// theta = rotation angle in radians
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

	Goblin.addModule('m4', m4);

})(this,this.document);