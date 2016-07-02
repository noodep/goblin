(function(window, document, undefined) {
	'use strict';

	/**
	 * @constructor
	 * @alias quat
	 * @param {Number} x x value
	 * @param {Number} y y value
	 * @param {Number} z z value
	 * @param {Number} w w value (angle)
	 * @return {module:math.quat} A new quaternion
	 */
	var quat = function(x, y, z, w) {
		this.v = new Float32Array(4);
		this.v[0] = x || 0.0;
		this.v[1] = y || 0.0;
		this.v[2] = z || 0.0;
		this.v[3] = w || 0.0;
	}

	/**
	 * Creates a new quaternion from an axis of rotation and an angle.
	 * @param {module:math.v3} axis The axis to rotate around
	 * @param {Number} angle The angle to rotate (in radians)
	 * @return {module:math.quat} The new quaternion
	 */
	quat.fromAxisAngle = function(axis, angle) {
		var mag = axis.mag();
		if (mag === 0) {
			return undefined;
		}

		var s = Math.sin(angle / 2.0);
		var norm = axis.clone().scale(s / mag);
		return new quat(norm.x, norm.y, norm.z, Math.cos(angle / 2.0));
	}

	/**
	 * Creates a new quaternion from Eulerian angles (angles around x, y, and z axes).
	 * @pararm {module:math.v3} angles The angles around the x, y, and z axes, in that order
	 * @return {module:math.quat} A new quaterion describing the compined rotation of the Eulerian angles
	 */
	quat.fromEulerAngles = function(angles) {
		var sx = Math.sin(angles.x / 2.0), sy = Math.sin(angles.y / 2.0), sz = Math.sin(angles.z / 2.0);
		var cx = Math.cos(angles.x / 2.0), cy = Math.cos(angles.y / 2.0), cz = Math.cos(angles.z / 2.0);

		return new quat(
				sx * cy * cz - cx * sy * sz,
				cx * sy * cz + sx * cy * sz,
				cx * cy * sz - sx * sy * cz,
				cx * cy * cz + sx * sy * sz);
	}

	/**
	 * Creates a new quaternion from a 3x3 or 4x4 matrix.
	 * @param {module:math.m4} m4 The matrix from which to extract the rotation
	 * @return {module:math.quat} A new quaternion describing the same rotation as the matrix
	 */
	quat.fromMat = function(m) {
		var x2 = (1 + m.m[0]  - m.m[5] - m.m[10]) / 4.0;
		var y2 = (1 + m.m[5]  - m.m[0] - m.m[10]) / 4.0;
		var z2 = (1 + m.m[10] - m.m[0] - m.m[5])  / 4.0;
		var w2 = (1 + m.m[0]  + m.m[5] + m.m[10]) / 4.0;
		
		var index = 3;
		var largest = w2;
		if (x2 > largest) {
			largest = x2;
			index = 0;
		} else if (y2 > largest) {
			largest = y2;
			index = 1;
		} else if (z2 > largest) {
			largest = z2;
			index = 2;
		}

		var largest = Math.sqrt(largest);
		var scale = 1 / (4.0 * largest);

		var q = new quat();
		switch (index) {
		case 0:
			q.v[0] = largest;
			q.v[1] = (m.m[1] + m.m[4]) * scale;
			q.v[2] = (m.m[8] + m.m[2]) * scale;
			q.v[3] = (m.m[6] - m.m[9]) * scale;
			break;
		case 1:
			q.v[0] = (m.m[1] + m.m[4]) * scale;
			q.v[1] = largest;
			q.v[2] = (m.m[6] + m.m[9]) * scale;
			q.v[3] = (m.m[8] - m.m[2]) * scale;
			break;
		case 2:
			q.v[0] = (m.m[8] + m.m[2]) * scale;
			q.v[1] = (m.m[6] + m.m[9]) * scale;
			q.v[2] = largest;
			q.v[3] = (m.m[1] - m.m[4]) * scale;
			break;
		case 3:
			q.v[0] = (m.m[6] - m.m[9]) * scale;
			q.v[1] = (m.m[8] - m.m[2]) * scale;
			q.v[2] = (m.m[1] - m.m[4]) * scale;
			q.v[3] = largest;
			break;
		}

		return q;
	}

	/**
	 * Copies another quaternion into this one.
	 * @param {module:math.quat} q - The quaternion to copy.
	 * @return {module:math.quat} This quaternion.
	 */
	quat.prototype.copy = function(q) {
		this.v[0] = q.v[0];
		this.v[1] = q.v[1];
		this.v[2] = q.v[2];
		this.v[3] = q.v[3];

		return this;
	}

	/**
	 * Clones this quaternion.
	 * @return {module:math.quat} A clone of this quaternion
	 */
	quat.prototype.clone = function() {
		return new quat(this.v[0], this.v[1], this.v[2], this.v[3]);
	}

	/**
	 * Conjugates this quaternion.
	 * This operation is somewhat analogous to a complex conjugate:
	 * the product a a quaternion and its conjugate yields a quaternion
	 * with a null vector portion.
	 * @return {module:math.quat} The conjugated quaternion
	 */
	quat.prototype.conjugate = function() {
		this.v[0] *= -1;
		this.v[1] *= -1;
		this.v[2] *= -1;
		return this;
	}

	/**
	 * Inverts this quaternion.
	 * @return {module:math.quat} The inverted quaternion
	 */
	quat.prototype.invert = function() {
		var dot = this.dot(this);
		if (dot === 0.0) {
			throw new Error('Inverse of the quaternion does not exist');
		}
		return this.conjugate().scale(1.0 / dot);
	}

	/**
	 * Scales each component of this quaternion by a scalar.
	 * @param {Number} s The scalar
	 * @return {module:math.quat} The scaled quaternion
	 */
	quat.prototype.scale = function(s) {
		this.v[0] *= s;
		this.v[1] *= s;
		this.v[2] *= s;
		this.v[3] *= s;
		return this;
	}

	/**
	 * Finds the dot product between this and another quaternion.
	 * @param {module:math.quat} q The other quaternion
	 * @return {Number} The dot product between the two quaternions
	 */
	quat.prototype.dot = function(q) {
		return this.v[0] * q.v[0] + this.v[1] * q.v[1] + this.v[2] * q.v[2] + this.v[3] * q.v[3];
	}

	/**
	 * Multiples this quaternion by another quaternion.
	 * @param {modele:math.quat} q The quaternion to multiply by
	 * @return {module:math.quat} The multiplied quaternion
	 */
	quat.prototype.mul = function(q) {
		var x = this.v[0], y = this.v[1], z = this.v[2], w = this.v[3];

		this.v[0] = w * q.x + x * q.w + y * q.z - z * q.y;
		this.v[1] = w * q.y + y * q.w + z * q.x - x * q.z;
		this.v[2] = w * q.z + z * q.w + x * q.y - y * q.x;
		this.v[3] = w * q.w - x * q.x - y * q.y - z * q.z;
		return this;
	}

	/**
	 * Rotates this quaternion around the specified axis.
	 * @param {module:math.v3} axis The axis to rotate around
	 * @param {Number} angle The angle to rotate (in radians)
	 * @return {module:math.quat} The rotated quaternion
	 */
	quat.prototype.rotate = function(axis, angle) {
		return this.mul(quat.fromAxisAngle(axis, angle));
	}

	quat.prototype.toString = function(p = 16) {
		return '[' + this.v[0].toFixed(p) + ',' + this.v[1].toFixed(p) + ',' + this.v[2].toFixed(p) + ',' + this.v[3].toFixed(p) + ']';
	}

	Object.defineProperty(quat.prototype, 'str', {
		get : function() { return this.toString(); },
	});

	Object.defineProperty(quat.prototype, 'x', {
		get : function() { return this.v[0];},
		set : function(value) { this.v[0] = value; }
	});

	Object.defineProperty(quat.prototype, 'y', {
		get : function() { return this.v[1];},
		set : function(value) { this.v[1] = value; }
	});

	Object.defineProperty(quat.prototype, 'z', {
		get : function() { return this.v[2];},
		set : function(value) { this.v[2] = value; }
	});

	Object.defineProperty(quat.prototype, 'w', {
		get : function() { return this.v[3]; },
		set : function(value) { this.v[3] = value; }
	});

	Goblin.extend('quat', quat);
})(this, this.document);
