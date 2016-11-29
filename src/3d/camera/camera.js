/**
 * @fileOverview A simple camera state object.
 * @author Noodep
 * @version 0.4
 */
'use strict';

import Vec3 from '../../math/vec3.js';
import Mat4 from '../../math/mat4.js';
import Quat from '../../math/quat.js';

export default class Camera {
	constructor({aspect_ratio, fov_y = Camera.DEFAULT_FOV_Y, near_plane = Camera.DEFAULT_NEAR_PLANE_Z, far_plane = Camera.DEFAULT_FAR_PLANE_Z, position = new Vec3(), orientation = Quat.identity()}) {
		// Perspective
		this._aspect_ratio = aspect_ratio;
		this._near_z = near_plane;
		this._far_z = far_plane;
		this._fov_y = fov_y;

		// Pose
		this._position = position;
		this._orientation = orientation;
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
	 * Set this camera position.
	 */
	setPosition(v3, force_update=true) {
		this._position.copy(v3);
		if(force_update)
			this.updateView();
	}

	/**
	 * Set this camera orientation.
	 */
	setOrientation(q, force_update=true) {
		this._orientation.copy(q);
		if(force_update)
			this.updateView();
	}

	/**
	 * Set this camera aspect ratio.
	 */
	setAspectRatio(aspect_ratio, force_update=true) {
		this._aspect_ratio = aspect_ratio;
		if(force_update)
			this.updateProjection();
	}

	/**
	 * Set this camera vertical field of view.
	 */
	setFovY(fov_y, force_update=true) {
		this._fov_y = fov_y;
		if(force_update)
			this.updateProjection();
	}

	/**
	 * Set this camera clipping planes.
	 */
	setClippingPlanes(near, far, force_update=true) {
		this._near_z = near;
		this._far_z = far;
		if(force_update)
			this.updateProjection();
	}

	/**
	 * Set this camera near clipping plane.
	 */
	setNearClippingPlane(near, force_update=true) {
		this._near_z = near;
		if(force_update)
			this.updateProjection();
	}

	/**
	 * Set this camera far clipping plane.
	 */
	setFarClippingPlane(far, force_update=true) {
		this._far_z = far;
		if(force_update)
			this.updateProjection();
	}

	/**
	 * Returns the distance between the camera and the specified point.
	 */
	distanceTo(v3) {
		return this._position.distance(v3);
	}

	/**
	 * Updates the projection matrix with this object values.
	 */
	updateProjection() {
		this._projection.perspective(this._fov_y, this._aspect_ratio, this._near_z, this._far_z);
	}

	/**
	 * Updates the view matrix with this object values.
	 * View is inversedTR matrix.
	 */
	updateView() {
		// Inverting a rotation and transposing is the same.
		this._inverse_orientation.copy(this._orientation).invert();
		this._inverse_position.copy(this._position);
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
		return `{position:${this._position.toString(precision)}, orientation: ${this._orientation.toString(precision)}}`;
	}
}

Camera.DEFAULT_FOV_Y = 45.0;
Camera.DEFAULT_NEAR_PLANE_Z = 0.1;
Camera.DEFAULT_FAR_PLANE_Z = 100.0;

