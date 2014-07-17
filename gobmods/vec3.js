(function(window, document, undefined) {
	'use strict';

	function v3(x,y,z) {
		this.v = new Float32Array(3);
		this.v[0] = x || 0.0;
		this.v[1] = y || 0.0;
		this.v[2] = z || 0.0;
	}

	v3.prototype.copy = function(v) {
		this.v[0] = v.v[0];
		this.v[1] = v.v[1];
		this.v[2] = v.v[2];
		return this;
	};

	v3.prototype.clone = function() {
		return new v3(this.v[0],this.v[1],this.v[2]);
	};

	v3.prototype.scaleAdd = function(s, v1, v2) {
		this.v[0] = s * v1.v[0] + v2.v[0];
		this.v[1] = s * v1.v[1] + v2.v[1];
		this.v[2] = s * v1.v[2] + v2.v[2];
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
		else return this.nmul(v);
	};

	v3.prototype.vmul = function(v) {
		this.v[0] *= v.v[0];
		this.v[1] *= v.v[1];
		this.v[2] *= v.v[2];
		return this;
	};

	v3.prototype.nmul = function(n) {
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
		this.v[1] =  this.v[1]*Math.cos(theta) + this.v[2]*Math.sin(theta);
		this.v[2] = -this.v[1]*Math.sin(theta) + this.v[2]*Math.cos(theta);
		return this;
	};
	
	v3.prototype.rotateY = function(theta) {
		this.v[0] = this.v[0]*Math.cos(theta) - this.v[2]*Math.sin(theta);
		this.v[2] = this.v[0]*Math.sin(theta) + this.v[2]*Math.cos(theta);
		return this;
	};

	v3.prototype.rotateZ = function(theta) {
		this.v[0] =  this.v[0]*Math.cos(theta) + this.v[1]*Math.sin(theta);
		this.v[1] = -this.v[0]*Math.sin(theta) + this.v[1]*Math.cos(theta);
		return this;
	};
	
	v3.prototype.length = v3.prototype.len = function() {
		return Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1] + this.v[2] * this.v[2]);
	};
	
	v3.prototype.normalize = function() {
		var length = this.length();
		return this.mul(1/length);
	};
	
	v3.prototype.toString = function() {
		return '[' + this.v[0] + ',' + this.v[1] + ',' + this.v[2] + ']';
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

	Goblin.addModule('v3', v3);
})(this, this.document);