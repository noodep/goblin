/**
 * @file Matrix manipulation library for computer graphics assuming column major flatenning.
 * We use matrix notation for elements, starting at 1. First is the row second is the column
 *
 * [00]:e11  [04]:e12  [08]:e13  [12]:e14
 * [01]:e21  [05]:e22  [09]:e23  [13]:e24
 * [02]:e31  [06]:e32  [10]:e33  [14]:e34
 * [03]:e41  [07]:e42  [11]:e43  [15]:e44
 *
 * @author Noodep
 * @version 0.83
 */

export default class Mat4 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Mat4
	 *
	 * @return {module:math.Mat4} - The newly created matrix.
	 */
	constructor() {
		this._m = new Float32Array(16);
		// Elements are initialized to 0
	}

	/**
	 * Creates a new matrix using the content of the specified array assuming
	 * column major flatenning.
	 *
	 * @param {array} a - The array (or array-like) from which to copy the
	 * values.
	 * @return {module:math.Mat4} - The newly created matrix.
	 */
	static from(a) {
		const m = new Mat4();
		return m.from(a);
	}

	/**
	 * Creates a new identity matrix.
	 *
	 * @return {module:math.Mat4} - The newly created matrix set to identity.
	 */
	static identity() {
		const m = new Mat4();
		m._m[0]  = 1.0;
		m._m[5]  = 1.0;
		m._m[10] = 1.0;
		m._m[15] = 1.0;

		return m;
	}

	/**
	 * Retruns this class underlying matrix.
	 */
	get matrix() {
		return this._m;
	}

	/**
	 * Sets this matrix to a rotation defined by the specified quaternion.
	 *
	 * @param {module:math.Quat} q - Quaternion to use to set this matrix orientation.
	 * @return {module:math.Mat4} - The rotation matrix.
	 */
	set orientation(q) {
		const x2 = 2.0 * q.x;
		const y2 = 2.0 * q.y;
		const z2 = 2.0 * q.z;

		const xx2 = x2 * q.x;
		const xy2 = x2 * q.y;
		const xz2 = x2 * q.z;
		const yy2 = y2 * q.y;
		const yz2 = y2 * q.z;
		const zz2 = z2 * q.z;

		const wx2 = q.w * x2;
		const wy2 = q.w * y2;
		const wz2 = q.w * z2;

		this._m[0] = 1.0 - yy2 - zz2;
		this._m[1] = xy2 + wz2;
		this._m[2] = xz2 - wy2;

		this._m[4] = xy2 - wz2;
		this._m[5] = 1.0 - xx2 - zz2;
		this._m[6] = yz2 + wx2;

		this._m[8] = xz2 + wy2;
		this._m[9] = yz2 - wx2;
		this._m[10] = 1.0 - xx2 - yy2;

	}

	/**
	 * Scales the matrix by the given vector.
	 *
	 * @param {module:math.Vec3} v - Vector by which to scale the matrix.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	set scale(v) {
		const x = v.x;
		const y = v.y;
		const z = v.z;

		this._m[0] *= x;
		this._m[1] *= x;
		this._m[2] *= x;
		this._m[3] *= x;
		this._m[4] *= y;
		this._m[5] *= y;
		this._m[6] *= y;
		this._m[7] *= y;
		this._m[8] *= z;
		this._m[9] *= z;
		this._m[10] *= z;
		this._m[11] *= z;
	}

	/**
	 * Sets this matrix translation values.
	 *
	 * @param {module:math.Vec3} v - Vector containing translation values.
	 * @return {module:math.m4} - The updated matrix.
	 */
	set translation(v) {
		this._m[12] = v.x;
		this._m[13] = v.y;
		this._m[14] = v.z;
	}

	/**
	 * Copies the values of the specified array into this matrix assuming column
	 * major flatenning.
	 *
	 * @param {array} a - The array (or array-like) from which to copy the
	 * values.
	 * @return {module:math.Mat4} - This matrix with the new values.
	 */
	from(a) {
		this._m[0] = a[0];
		this._m[1] = a[1];
		this._m[2] = a[2];
		this._m[3] = a[3];
		this._m[4] = a[4];
		this._m[5] = a[5];
		this._m[6] = a[6];
		this._m[7] = a[7];
		this._m[8] = a[8];
		this._m[9] = a[9];
		this._m[10] = a[10];
		this._m[11] = a[11];
		this._m[12] = a[12];
		this._m[13] = a[13];
		this._m[14] = a[14];
		this._m[15] = a[15];

		return this;
	}

	/**
	 * Copies the values of the specified matrix into this matrix.
	 *
	 * @param {module:math.Mat4} m - The matrix from which to copy the values.
	 * @return {module:math.Mat4} - This matrix with the new values.
	 */
	copy(m) {
		this._m.set(m._m);
		return this;
	}

	/**
	 * Clones the current matrix.
	 *
	 * @return {module:math.Mat4} - The newly cloned matrix.
	 */
	clone() {
		const clone = new Mat4();
		return clone.copy(this);
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
	 * Sets this matrix to a rotation defined by the specified quaternion.
	 *
	 * @return {module:math.Mat4} - The rotation matrix.
	 */
	setRotationFromQuaternion(q) {
		this.orientation = q;

		this._m[3]  = 0.0;
		this._m[7]  = 0.0;
		this._m[11] = 0.0;
		this._m[12] = 0.0;
		this._m[13] = 0.0;
		this._m[14] = 0.0;

		this._m[15] = 1.0;

		return this;
	}

	/**
	 * Sets this matrix to a rotation of theta around the specified axis.
	 *
	 * @param {Number} theta - The angle (in radians) by which to rotate.
	 * @param {module:math.Vec3} axis - The axis to rotate around.
	 * @return {module:math.m4} - The resulting rotation matrix.
	 */
	setFromAxisRotation(theta, axis) {
		const c = Math.cos(theta);
		const _c = 1 - c;
		const s = Math.sin(theta);
		const a = axis.clone().normalize();

		this._m[0] = _c * a.x * a.x + c;
		this._m[1] = _c * a.x * a.y + s * a.z;
		this._m[2] = _c * a.x * a.z - s * a.y;

		this._m[4] = _c * a.y * a.x - s * a.z;
		this._m[5] = _c * a.y * a.y + c;
		this._m[6] = _c * a.y * a.z + s * a.x;

		this._m[8] = _c * a.z * a.x + s * a.y;
		this._m[9] = _c * a.z * a.y - s * a.x;
		this._m[10]= _c * a.z * a.z + c;

		this._m[3]  = 0.0;
		this._m[7]  = 0.0;
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
		const e21 = this._m[1];
		const e31 = this._m[2];
		const e41 = this._m[3];
		const e32 = this._m[6];
		const e42 = this._m[7];
		const e43 = this._m[11];

		this._m[1]  = this._m[4];
		this._m[2]  = this._m[8];
		this._m[3]  = this._m[12];
		this._m[6]  = this._m[9];
		this._m[7]  = this._m[13];
		this._m[11] = this._m[14];

		this._m[4]  = e21;
		this._m[8]  = e31;
		this._m[12] = e41;
		this._m[9]  = e32;
		this._m[13] = e42;
		this._m[14] = e43;

		return this;
	}

	/**
	 * Multiplies the matrix by the specified matrix.
	 *
	 * @param {module:math.Mat4} m - Matrix by which to multiply.
	 * @return {module:math.Mat4} - This matrix multiplied by the specified matrix.
	 */
	multiply(m) {
		const e11 = this._m[0];
		const e21 = this._m[1];
		const e31 = this._m[2];
		const e41 = this._m[3];
		const e12 = this._m[4];
		const e22 = this._m[5];
		const e32 = this._m[6];
		const e42 = this._m[7];
		const e13 = this._m[8];
		const e23 = this._m[9];
		const e33 = this._m[10];
		const e43 = this._m[11];
		const e14 = this._m[12];
		const e24 = this._m[13];
		const e34 = this._m[14];
		const e44 = this._m[15];

		let e1_ = m._m[0];
		let e2_ = m._m[1];
		let e3_ = m._m[2];
		let e4_ = m._m[3];
		this._m[0] = e1_*e11 + e2_*e12 + e3_*e13 + e4_*e14;
		this._m[1] = e1_*e21 + e2_*e22 + e3_*e23 + e4_*e24;
		this._m[2] = e1_*e31 + e2_*e32 + e3_*e33 + e4_*e34;
		this._m[3] = e1_*e41 + e2_*e42 + e3_*e43 + e4_*e44;

		e1_ = m._m[4];
		e2_ = m._m[5];
		e3_ = m._m[6];
		e4_ = m._m[7];
		this._m[4] = e1_*e11 + e2_*e12 + e3_*e13 + e4_*e14;
		this._m[5] = e1_*e21 + e2_*e22 + e3_*e23 + e4_*e24;
		this._m[6] = e1_*e31 + e2_*e32 + e3_*e33 + e4_*e34;
		this._m[7] = e1_*e41 + e2_*e42 + e3_*e43 + e4_*e44;

		e1_ = m._m[8];
		e2_ = m._m[9];
		e3_ = m._m[10];
		e4_ = m._m[11];
		this._m[8]  = e1_*e11 + e2_*e12 + e3_*e13 + e4_*e14;
		this._m[9]  = e1_*e21 + e2_*e22 + e3_*e23 + e4_*e24;
		this._m[10] = e1_*e31 + e2_*e32 + e3_*e33 + e4_*e34;
		this._m[11] = e1_*e41 + e2_*e42 + e3_*e43 + e4_*e44;

		e1_ = m._m[12];
		e2_ = m._m[13];
		e3_ = m._m[14];
		e4_ = m._m[15];
		this._m[12] = e1_*e11 + e2_*e12 + e3_*e13 + e4_*e14;
		this._m[13] = e1_*e21 + e2_*e22 + e3_*e23 + e4_*e24;
		this._m[14] = e1_*e31 + e2_*e32 + e3_*e33 + e4_*e34;
		this._m[15] = e1_*e41 + e2_*e42 + e3_*e43 + e4_*e44;

		return this;
	}

	/**
	 * generates a perspective projection matrix for a right handed world frame with x axis pointing towards the viewer and z up (ISO 80000-2:2019)
	 * to an opengl normalized device coordinates where x, y and z ∈ [-1,1] with the z axis pointing towards the viewer and y up.
	 *
	 * @param {Number} vertical_fov        - vertical field of view in radians
	 * @param {Number} aspect_ratio       - aspect ratio defined by width / height
	 * @param {Number} near_clipping_plane - distance to the near cliping plane along -x
	 * @param {Number} far_clipping_plane  - distance to the far cliping plane along -x
	 *
	 * @return {module:math.Mat4} - this matrix set to the projection specified by the parameters above
	 */
	perspective(vertical_fov, aspect_ratio, near_clipping_plane, far_clipping_plane) {
		const depth = (far_clipping_plane - near_clipping_plane);
		const focal_length = 1.0 / Math.tan(vertical_fov * 0.5);

		this._m[0] = 0.0;
		this._m[1] = 0.0;
		this._m[2] = -(far_clipping_plane + near_clipping_plane) / depth;
		this._m[3] = -1.0;

		this._m[4] = focal_length / aspect_ratio;
		this._m[5] = 0.0;
		this._m[6] = 0.0;
		this._m[7] = 0.0;

		this._m[8] = 0.0;
		this._m[9] = focal_length;
		this._m[10] = 0.0;
		this._m[11] = 0.0;

		this._m[12] = 0.0;
		this._m[13] = 0.0;
		this._m[14] = -(2.0 * far_clipping_plane * near_clipping_plane) / depth;
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
	 * @param {Number} x - amount by which to translate this matrix along the X axis.
	 * @param {Number} y - amount by which to translate this matrix along the Y axis.
	 * @param {Number} z - amount by which to translate this matrix along the Z axis.
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
	 * Applies a translation in R3 along the X axis to this matrix.
	 *
	 * @param {Number} x - amount by which to translate this matrix along the X axis.
	 * @return {module:math.m4} - The translated matrix.
	 */
	translateX(x) {
		this._m[12] = this._m[0] * x + this._m[12];
		this._m[13] = this._m[1] * x + this._m[13];
		this._m[14] = this._m[2] * x + this._m[14];
		this._m[15] = this._m[3] * x + this._m[15];

		return this;
	}

	/**
	 * Applies a translation in R3 along the Y axis to this matrix.
	 *
	 * @param {Number} y - amount by which to translate this matrix along the Y axis.
	 * @return {module:math.m4} - The translated matrix.
	 */
	translateY(y) {
		this._m[12] = this._m[4] * y + this._m[12];
		this._m[13] = this._m[5] * y + this._m[13];
		this._m[14] = this._m[6] * y + this._m[14];
		this._m[15] = this._m[7] * y + this._m[15];

		return this;
	}

	/**
	 * Applies a translation in R3 along the Z axis to this matrix.
	 *
	 * @param {Number} z - amount by which to translate this matrix along the Z axis.
	 * @return {module:math.m4} - The translated matrix.
	 */
	translateZ(z) {
		this._m[12] = this._m[8] * z + this._m[12];
		this._m[13] = this._m[9] * z + this._m[13];
		this._m[14] = this._m[10] * z + this._m[14];
		this._m[15] = this._m[11] * z + this._m[15];

		return this;
	}

	/**
	 * Sets this matrix to a rotation around the X axis.
	 *
	 * @param {Number} theta - Angle in radians around the X axis.
	 * @return {module:math.m4} - The rotation matrix.
	 */
	setRotationX(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.identity();

		this._m[5] = c;
		this._m[6] = s;

		this._m[9]  = -s;
		this._m[10] = c;

		return this;
	}

	/**
	 * Sets this matrix to a rotation around the Y axis.
	 *
	 * @param {Number} theta - Angle in radians around the Y axis.
	 * @return {module:math.m4} - The rotation matrix.
	 */
	setRotationY(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.identity();

		this._m[0] = c;
		this._m[2] = -s;

		this._m[8]  = s;
		this._m[10] = c;

		return this;
	}

	/**
	 * Sets this matrix to a rotation around the Z axis.
	 *
	 * @param {Number} theta - Angle in radians around the Z axis.
	 * @return {module:math.m4} - The rotation matrix.
	 */
	setRotationZ(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.identity();

		this._m[0] = c;
		this._m[1] = s;

		this._m[4]  = -s;
		this._m[5] = c;

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

		const e12 = this._m[4];
		const e22 = this._m[5];
		const e32 = this._m[6];
		const e42 = this._m[7];
		const e13 = this._m[8];
		const e23 = this._m[9];
		const e33 = this._m[10];
		const e43 = this._m[11];

		this._m[4] = e12 * c + e13 * s;
		this._m[5] = e22 * c + e23 * s;
		this._m[6] = e32 * c + e33 * s;
		this._m[7] = e42 * c + e43 * s;

		this._m[8]  = -e12 * s + e13 * c;
		this._m[9]  = -e22 * s + e23 * c;
		this._m[10] = -e32 * s + e33 * c;
		this._m[11] = -e42 * s + e43 * c;

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

		const e11 = this._m[0];
		const e21 = this._m[1];
		const e31 = this._m[2];
		const e41 = this._m[3];
		const e13 = this._m[8];
		const e23 = this._m[9];
		const e33 = this._m[10];
		const e43 = this._m[11];

		this._m[0] = e11 * c - e13 * s;
		this._m[1] = e21 * c - e23 * s;
		this._m[2] = e31 * c - e33 * s;
		this._m[3] = e41 * c - e43 * s;

		this._m[8]  = e11 * s + e13 * c;
		this._m[9]  = e21 * s + e23 * c;
		this._m[10] = e31 * s + e33 * c;
		this._m[11] = e41 * s + e43 * c;

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

		const e11 = this._m[0];
		const e21 = this._m[1];
		const e31 = this._m[2];
		const e41 = this._m[3];
		const e12 = this._m[4];
		const e22 = this._m[5];
		const e32 = this._m[6];
		const e42 = this._m[7];

		this._m[0] = e11 * c + e12 * s;
		this._m[1] = e21 * c + e22 * s;
		this._m[2] = e31 * c + e32 * s;
		this._m[3] = e41 * c + e42 * s;

		this._m[4] = -e11 * s + e12 * c;
		this._m[5] = -e21 * s + e22 * c;
		this._m[6] = -e31 * s + e32 * c;
		this._m[7] = -e41 * s + e42 * c;

		return this;
	}

	/**
	 * Applies a rotation described by the specified quaternion to the matrix.
	 *
	 * @param {module:math.Quat} quat - The quaternion to multiply by.
	 * @return {module:math.Mat4} - The rotated matrix.
	 */
	rotateQuat(quat) {
		// TODO Make this more efficient by not creating a matrix from the
		// quaternion first.
		const m = Mat4.identity();
		m.setRotationFromQuaternion(quat);
		return this.multiply(m);
	}

	/**
	 * Applies a rotation around the specified axis to the matrix.
	 *
	 * @param {Number} theta - The angle (in radians) by which to rotate.
	 * @param {module:math.Vec3} axis - The axis to rotate around.
	 * @return {module:math.m4} - The rotated matrix.
	 */
	rotate(theta, axis) {
		const r = new Mat4();
		r.setFromAxisRotation(theta, axis);

		this.multiply(r);
		return this;
	}

	/**
	 * Scales the matrix by the specified scalar along the X axis.
	 *
	 * @param {Number} x - Scalar by which to scale the matrix along the X axis.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	scaleX(x) {
		this._m[0] *= x;
		this._m[1] *= x;
		this._m[2] *= x;
		this._m[3] *= x;

		return this;
	}

	/**
	 * Scales the matrix by the specified scalar along the Y axis.
	 *
	 * @param {Number} y - Scalar by which to scale the matrix along the Y axis.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	scaleY(y) {
		this._m[4] *= y;
		this._m[5] *= y;
		this._m[6] *= y;
		this._m[7] *= y;

		return this;
	}

	/**
	 * Scales the matrix by the specified scalar along the Z axis.
	 *
	 * @param {Number} z - Scalar by which to scale the matrix along the Z axis.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	scaleZ(z) {
		this._m[8] *= z;
		this._m[9] *= z;
		this._m[10] *= z;
		this._m[11] *= z;

		return this;
	}

	/**
	 * Scales the matrix along the X, Y, and Z axes by the corresponding
	 * components of a 3-dimensional vector.
	 *
	 * @param {module:math.Vec3} vec3 - Vector by which to scale the matrix.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	scaleVec(vec3) {
		const x = vec3.x;
		const y = vec3.y;
		const z = vec3.z;

		this._m[0]  *= x;
		this._m[1]  *= x;
		this._m[2]  *= x;
		this._m[3]  *= x;
		this._m[4]  *= y;
		this._m[5]  *= y;
		this._m[6]  *= y;
		this._m[7]  *= y;
		this._m[8]  *= z;
		this._m[9]  *= z;
		this._m[10] *= z;
		this._m[11] *= z;

		return this;
	}

	/**
	 * Scales the matrix by the specified scalar uniformely along all three axis.
	 *
	 * @param {Number} s - Scalar by which to scale the matrix along all axis.
	 * @return {module:math.Mat4} - The scaled matrix.
	 */
	scaleUniform(s) {
		this._m[0] *= s;
		this._m[1] *= s;
		this._m[2] *= s;
		this._m[3] *= s;
		this._m[4] *= s;
		this._m[5] *= s;
		this._m[6] *= s;
		this._m[7] *= s;
		this._m[8] *= s;
		this._m[9] *= s;
		this._m[10] *= s;
		this._m[11] *= s;

		return this;
	}

	/**
	 * Creates a human readable string of the matrix.
	 *
	 * @param {Number} [p=16] - The precision to use when printing element
	 * values.
	 * @return {String} - Human readable string of the matrix.
	 */
	toString(p = 16) {
		return `[[${this._m[0].toFixed(p)}, ${this._m[4].toFixed(p)}, ${this._m[8].toFixed(p)},  ${this._m[12].toFixed(p)}],`
			+  ` [${this._m[1].toFixed(p)}, ${this._m[5].toFixed(p)}, ${this._m[9].toFixed(p)},  ${this._m[13].toFixed(p)}],`
			+  ` [${this._m[2].toFixed(p)}, ${this._m[6].toFixed(p)}, ${this._m[10].toFixed(p)}, ${this._m[14].toFixed(p)}],`
			+  ` [${this._m[3].toFixed(p)}, ${this._m[7].toFixed(p)}, ${this._m[11].toFixed(p)}, ${this._m[15].toFixed(p)}]]`;
	}

}

/**
 * Accessors for the values so that the matrix can be treated more like an
 * array.
 */
Object.defineProperties(Mat4.prototype, {
	0: {
		get: function() { return this._m[0]; },
		set: function(val) { this._m[0] = val; }
	},
	1: {
		get: function() { return this._m[1]; },
		set: function(val) { this._m[1] = val; }
	},
	2: {
		get: function() { return this._m[2]; },
		set: function(val) { this._m[2] = val; }
	},
	3: {
		get: function() { return this._m[3]; },
		set: function(val) { this._m[3] = val; }
	},
	4: {
		get: function() { return this._m[4]; },
		set: function(val) { this._m[4] = val; }
	},
	5: {
		get: function() { return this._m[5]; },
		set: function(val) { this._m[5] = val; }
	},
	6: {
		get: function() { return this._m[6]; },
		set: function(val) { this._m[6] = val; }
	},
	7: {
		get: function() { return this._m[7]; },
		set: function(val) { this._m[7] = val; }
	},
	8: {
		get: function() { return this._m[8]; },
		set: function(val) { this._m[8] = val; }
	},
	9: {
		get: function() { return this._m[9]; },
		set: function(val) { this._m[9] = val; }
	},
	10: {
		get: function() { return this._m[10]; },
		set: function(val) { this._m[10] = val; }
	},
	11: {
		get: function() { return this._m[11]; },
		set: function(val) { this._m[11] = val; }
	},
	12: {
		get: function() { return this._m[12]; },
		set: function(val) { this._m[12] = val; }
	},
	13: {
		get: function() { return this._m[13]; },
		set: function(val) { this._m[13] = val; }
	},
	14: {
		get: function() { return this._m[14]; },
		set: function(val) { this._m[14] = val; }
	},
	15: {
		get: function() { return this._m[15]; },
		set: function(val) { this._m[15] = val; }
	},
});

Mat4.prototype.length = 16;

Mat4.NULL = new Mat4();
Mat4.IDENTITY = Mat4.identity();

