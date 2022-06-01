/**
 * @file A simple camera state object.
 *
 * @author Noodep
 * @version 0.66
 */

import Vec3 from '../../math/vec3.js';
import Mat4 from '../../math/mat4.js';
import Quat from '../../math/quat.js';

export default class Camera {

	constructor(options) {
		({
			// Perspective
			aspect_ratio: this._aspect_ratio,
			vertical_fov: this._vertical_fov = Camera.DEFAULT_VERTICAL_FOV,
			near_clipping_plane: this._near_clipping_plane = Camera.DEFAULT_NEAR_CLIPPING_PLANE,
			far_clipping_plane: this._far_clipping_plane = Camera.DEFAULT_FAR_CLIPPING_PLANE,
			// Pose
			origin: this._origin = new Vec3(),
			orientation: this._orientation = new Quat(),
		} = options);

		this._inverse_position = new Vec3();
		this._inverse_orientation = new Quat();

		// Matrices
		this._view = Mat4.identity();
		this._projection = Mat4.identity();

		this.updateView();
		this.updateProjection();
	}

	/**
	 * Returns this camera view matrix.
	 */
	get view() {
		return this._view;
	}

	/**
	 * Returns this camera projection matrix.
	 */
	get projection() {
		return this._projection;
	}

	/**
	 * Sets this camera position and immediately updates the view.
	 */
	set origin(origin) {
		this._origin.copy(origin);
		this.updateView();
	}

	/**
	 * Sets this camera orientation and immediately updates the view.
	 */
	set orientation(orientation) {
		this._orientation.copy(orientation);
		this.updateView();
	}

	/**
	 * Sets this camera vertical field of view and immediately updates the projection.
	 */
	set verticalFov(vertical_fov) {
		this._vertical_fov = vertical_fov;
		this.updateProjection();
	}

	/**
	 * Sets this camera aspect ratio and immediately updates the projection.
	 */
	set aspectRatio(aspect_ratio) {
		this._aspect_ratio = aspect_ratio;
		this.updateProjection();
	}

	/**
	 * Sets this camera near clipping plane and immediately updates the projection.
	 */
	set nearClippingPlane(near_clipping_plane) {
		this._near_z = near;
		this.updateProjection();
	}

	/**
	 * Sets this camera far clipping plane and immediately updates the projection.
	 */
	set farClippingPlane(far_clipping_plane) {
		this._far_clipping_plane = far_clipping_plane;
		this.updateProjection();
	}

	/**
	 * Sets this camera origin and drientation and immediately updates the view.
	 */
	setPose(origin, orientation) {
		this._origin.copy(origin);
		this._orientation.copy(orientation);
		this.updateView();
	}

	/**
	 * Sets this camera clipping planes and immediately updates the projection.
	 */
	setClippingPlanes(near_clipping_plane, far_clipping_plane) {
		this._near_clipping_plane = near_clipping_plane;
		this._far_clipping_plane = far_clipping_plane;
		this.updateProjection();
	}

	/**
	 * Returns the distance between the camera and the specified point.
	 */
	distanceTo(v3) {
		return this._origin.distance(v3);
	}

	/**
	 * Updates the projection matrix with this object values.
	 */
	updateProjection() {
		this._projection.perspective(this._vertical_fov, this._aspect_ratio, this._near_clipping_plane, this._far_clipping_plane);
	}

	/**
	 * Updates the view matrix with this object values.
	 * View is inversedTR matrix.
	 */
	updateView() {
		// Inverting a rotation and transposing is the same.
		this._inverse_orientation.copy(this._orientation).invert();
		this._inverse_position.copy(this._origin);
		this._inverse_orientation.rotate(this._inverse_position).negate();
		this._view.setRotationFromQuaternion(this._inverse_orientation);
		this._view.translation = this._inverse_position;
	}

	/**
	 * Returns a human readable string representing this camera pose (position and orientation).
	 *
	 * @param {Number} [p=16] - precision to use when printing floating values.
	 * @return {String} - A human readable String representing this camera pose.
	 */
	toString(precision = 16) {
		return `{position:${this._origin.toString(precision)}, orientation: ${this._orientation.toString(precision)}}`;
	}

}

Camera.DEFAULT_VERTICAL_FOV = 45.0;
Camera.DEFAULT_NEAR_CLIPPING_PLANE = 0.1;
Camera.DEFAULT_FAR_CLIPPING_PLANE = 100.0;
