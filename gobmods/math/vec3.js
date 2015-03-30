/**
 * @fileOverview Vector manipulation library.
 * @author Noodep
 * @version 0.31
 */
(function(context, undefined) {
	'use strict';

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias v3
	 * @param {Number} x x value.
	 * @param {Number} y y value.
	 * @param {Number} z z value.
	 * @return {module:math.v3} The newly created vector.
	 */
	var v3 = function(x,y,z) {
		this.v = new Float32Array(3);
		this.v[0] = x || 0.0;
		this.v[1] = y || 0.0;
		this.v[2] = z || 0.0;
	}

	/**
	 * Copies values of vector v into this vector.
	 * @param  {module:math.v3} v Vector from which to copy values. 
	 * @return {module:math.v3} This vector.
	 */
	v3.prototype.copy = function(v) {
		this.v[0] = v.v[0];
		this.v[1] = v.v[1];
		this.v[2] = v.v[2];
		return this;
	};

	/**
	 * Clones the current vector.
	 * @return {module:math.v3} The newly cloned vector.
	 */
	v3.prototype.clone = function() {
		return new v3(this.v[0],this.v[1],this.v[2]);
	};


	v3.prototype.scaleAdd = function(s, v) {
		this.v[0] = s * this.v[0] + v.v[0];
		this.v[1] = s * this.v[1] + v.v[1];
		this.v[2] = s * this.v[2] + v.v[2];
	};

	v3.prototype.negate = function() {
		this.v[0] = -this.v[0];
		this.v[1] = -this.v[1];
		this.v[2] = -this.v[2];
		return this;
	};

	v3.prototype.negateCopy = function() {
		var v = this.clone();
		return v.negate();
	};

	v3.prototype.add = function(v) {
		if(v instanceof v3) return this.vadd(v);
		return this.nadd(v);
	};

	v3.prototype.vadd = function(v) {
		this.v[0] += v.v[0];
		this.v[1] += v.v[1];
		this.v[2] += v.v[2];
		return this;
	};

	v3.prototype.nadd = function(n) {
		this.v[0] += n;
		this.v[1] += n;
		this.v[2] += n;
		return this;
	};
	
	v3.prototype.substract = v3.prototype.sub = function(v) {
		if(v instanceof v3) return this.vadd(v.negateCopy());
		else return this.nadd(-v);
	};

	v3.prototype.inverse = function() {
		this.v[0] = 1 / this.v[0];
		this.v[1] = 1 / this.v[1];
		this.v[2] = 1 / this.v[2];
		return this;
	};

	v3.prototype.inverseCopy = function() {
		var v = this.clone();
		return v.inverse();
	}

	v3.prototype.multiply = v3.prototype.mul = function(v) {
		if(v instanceof v3) return this.vmul(v);
		else return this.scale(v);
	};

	v3.prototype.vmul = function(v) {
		this.v[0] *= v.v[0];
		this.v[1] *= v.v[1];
		this.v[2] *= v.v[2];
		return this;
	};

	v3.prototype.scale = function(n) {
		this.v[0] *= n;
		this.v[1] *= n;
		this.v[2] *= n;
		return this;
	};
	
	v3.prototype.divide = v3.prototype.div = function(v) {
		if(v instanceof v3) return this.vmul(v.inverseCopy());
		else return this.mul(1/v);
	};
	
	v3.prototype.cross = function(v) {
		var x = this.v[0], y = this.v[1], z = this.v[2];
		this.v[0] = y * v.v[2] - z * v.v[1];
		this.v[1] = z * v.v[0] - x * v.v[2];
		this.v[2] = x * v.v[1] - y * v.v[0];
		return this;
	};

	v3.prototype.rotateX = function(theta) {
		var y = this.v[1], z = this.v[2];
		var c = Math.cos(theta), s = Math.sin(theta);

		this.v[1] = y * c - z * s;
		this.v[2] = y * s + z * c;
		return this;
	};
	
	v3.prototype.rotateY = function(theta) {
		var x = this.v[0], z = this.v[2];
		var c = Math.cos(theta), s = Math.sin(theta);

		this.v[0] = x * c + z * s;
		this.v[2] = -x * s + z * c;
		return this;
	};
	
	v3.prototype.rotateZ = function(theta) {
		var x = this.v[0], y = this.v[1];
		var c = Math.cos(theta), s = Math.sin(theta);

		this.v[0] = x * c - y * s;
		this.v[1] = x * s + y * c;
		return this;
	};
	
	v3.prototype.length = v3.prototype.len = function() {
		return Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1] + this.v[2] * this.v[2]);
	};

	v3.prototype.distance = v3.prototype.len = function(v) {
		var dx = v.v[0] - this.v[0];
		var dy = v.v[1] - this.v[1];
		var dz = v.v[2] - this.v[2];
		return Math.sqrt(dx*dx + dy*dy + dz*dz);
	};
	
	v3.prototype.normalize = function() {
		var length = this.length();
		return this.mul(1/length);
	};
	
	v3.prototype.toString = function() {
		return '[' + this.v[0] + ',' + this.v[1] + ',' + this.v[2] + ']';
	};

	v3.prototype.toArray = function() {
		return [this.v[0], this.v[1], this.v[2]];
	};

	Object.defineProperty(v3.prototype, 'str', {
		get : function() { return this.toString();},
	});

	Object.defineProperty(v3.prototype, 'x', {
		get : function() { return this.v[0];},
		set : function(value) { this.v[0] = value; }
	});

	Object.defineProperty(v3.prototype, 'y', {
		get : function() { return this.v[1];},
		set : function(value) { this.v[1] = value; }
	});

	Object.defineProperty(v3.prototype, 'z', {
		get : function() { return this.v[2];},
		set : function(value) { this.v[2] = value; }
	});

	Goblin.extend('v3', v3);
})(this);