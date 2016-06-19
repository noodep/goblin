/**
 * @fileOverview Vector manipulation library.
 * @author Noodep
 * @version 0.32
 */
(function(context, undefined) {
	'use strict';

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias v4
	 * @param {Number} x x value.
	 * @param {Number} y y value.
	 * @param {Number} z z value.
	 * @param {Number} w w value.
	 * @return {module:math.v4} The newly created vector.
	 */
	var v4 = function(x,y,z,w) {
		this.v = new Float32Array(4);
		this.v[0] = x || 0.0;
		this.v[1] = y || 0.0;
		this.v[2] = z || 0.0;
		this.v[3] = w || 0.0;
	}

	/**
	 * Copies values of vector v into this vector.
	 * @param  {module:math.v4} v Vector from which to copy values. 
	 * @return {module:math.v4} This vector.
	 */
	v4.prototype.copy = function(v) {
		this.v[0] = v.v[0];
		this.v[1] = v.v[1];
		this.v[2] = v.v[2];
		this.v[3] = v.v[3];
		return this;
	};

	/**
	 * Clones the current vector.
	 * @return {module:math.v4} The newly cloned vector.
	 */
	v4.prototype.clone = function() {
		return new v4(this.v[0],this.v[1],this.v[2],this.v[3]);
	};
	
	v4.prototype.scaleAdd = function(s, v) {
		this.v[0] = s * this.v[0] + v.v[0];
		this.v[1] = s * this.v[1] + v.v[1];
		this.v[2] = s * this.v[2] + v.v[2];
		this.v[3] = s * this.v[3] + v.v[2];
	};

	v4.prototype.negate = function() {
		this.v[0] = -this.v[0];
		this.v[1] = -this.v[1];
		this.v[2] = -this.v[2];
		this.v[3] = -this.v[3];
		return this;
	};

	v4.prototype.negateCopy = function() {
		var v = this.clone();
		return v.negate();
	};

	v4.prototype.add = function(v) {
		if(v instanceof v4) return this.vadd(v);
		return this.nadd(v);
	};

	v4.prototype.vadd = function(v) {
		this.v[0] += v.v[0];
		this.v[1] += v.v[1];
		this.v[2] += v.v[2];
		this.v[3] += v.v[3];
		return this;
	};

	v4.prototype.nadd = function(n) {
		this.v[0] += n;
		this.v[1] += n;
		this.v[2] += n;
		this.v[3] += n;
		return this;
	};
	
	v4.prototype.substract = v4.prototype.sub = function(v) {
		if(v instanceof v4) return this.vadd(v.negateCopy());
		else return this.nadd(-v);
	};

	v4.prototype.inverse = function() {
		this.v[0] = 1 / this.v[0];
		this.v[1] = 1 / this.v[1];
		this.v[2] = 1 / this.v[2];
		this.v[3] = 1 / this.v[3];
		return this;
	};

	v4.prototype.inverseCopy = function() {
		var v = this.clone();
		return v.inverse();
	}

	v4.prototype.multiply = v4.prototype.mul = function(v) {
		this.v[0] *= v.v[0];
		this.v[1] *= v.v[1];
		this.v[2] *= v.v[2];
		this.v[3] *= v.v[3];
		return this;
	};

	v4.prototype.divide = v4.prototype.div = function(v) {
		this.v[0] /= v.v[0];
		this.v[1] /= v.v[1];
		this.v[2] /= v.v[2];
		this.v[3] /= v.v[3];
		return this;
	};

	v4.prototype.scale = function(n) {
		this.v[0] *= n;
		this.v[1] *= n;
		this.v[2] *= n;
		this.v[3] *= n;
		return this;
	};

	v4.prototype.dot = function(v) {
		return this.v[0] * v.v[0] + this.v[1] * v.v[1] + this.v[2] * v.v[2] + this.v[3] * v.v[3];
	}

	v4.prototype.rotateX = function(theta) {
		var y = this.v[1], z = this.v[2];
		var c = Math.cos(theta), s = Math.sin(theta);

		this.v[1] = y * c - z * s;
		this.v[2] = y * s + z * c;
		return this;
	};
	
	v4.prototype.rotateY = function(theta) {
		var x = this.v[0], z = this.v[2];
		var c = Math.cos(theta), s = Math.sin(theta);

		this.v[0] = x * c + z * s;
		this.v[2] = -x * s + z * c;
		return this;
	};
	
	v4.prototype.rotateZ = function(theta) {
		var x = this.v[0], y = this.v[1];
		var c = Math.cos(theta), s = Math.sin(theta);

		this.v[0] = x * c - y * s;
		this.v[1] = x * s + y * c;
		return this;
	};

	v4.prototype.transform4 = function(m4) {
		var x = this.v[0], y = this.v[1], z = this.v[2], w = this.v[3];
		this.v[0] = m4.m[0] * x + m4.m[4] * y + m4.m[8] * z + m4.m[12] * w;
		this.v[1] = m4.m[1] * x + m4.m[5] * y + m4.m[9] * z + m4.m[13] * w;
		this.v[2] = m4.m[2] * x + m4.m[6] * y + m4.m[10] * z + m4.m[14] * w;
		this.v[3] = m4.m[3] * x + m4.m[7] * y + m4.m[11] * z + m4.m[15] * w;
		return this;
	}
	
	v4.prototype.magnitude = v4.prototype.mag = function() {
		return Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1] + this.v[2] * this.v[2] + this.v[3] * this.v[3]);
	};

	v4.prototype.distance = v4.prototype.len = function(v) {
		var dx = v.v[0] - this.v[0];
		var dy = v.v[1] - this.v[1];
		var dz = v.v[2] - this.v[2];
		var dw = v.v[3] - this.v[3];
		return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
	};
	
	v4.prototype.normalize = function() {
		var length = this.length();
		return this.scale(1.0 / length);
	};
	
	v4.prototype.toString = function(p = 16) {
		return '[' + this.v[0].toFixed(p) + ',' + this.v[1].toFixed(p) + ',' + this.v[2].toFixed(p) + ',' + this.v[3].toFixed(p) + ']';
	};

	v4.prototype.toArray = function() {
		return [this.v[0], this.v[1], this.v[2], this.v[3]];
	};

	Object.defineProperty(v4.prototype, 'str', {
		get : function() { return this.toString();},
	});

	Object.defineProperty(v4.prototype, 'x', {
		get : function() { return this.v[0];},
		set : function(value) { this.v[0] = value; }
	});

	Object.defineProperty(v4.prototype, 'y', {
		get : function() { return this.v[1];},
		set : function(value) { this.v[1] = value; }
	});

	Object.defineProperty(v4.prototype, 'z', {
		get : function() { return this.v[2];},
		set : function(value) { this.v[2] = value; }
	});

	Object.defineProperty(v4.prototype, 'w', {
		get : function() { return this.v[3]; },
		set : function(value) { this.v[3] = value; }
	});

	Goblin.extend('v4', v4);
})(this);
