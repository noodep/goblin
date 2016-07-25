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
	constructor({aspect_ratio, fov_y = Camera.DEFAULT_FOV_Y, near_plane = Camera.DEFAULT_NEAR_PLANE_Z, far_plane = Camera.DEFAULT_FAR_PLANE_Z, position = new Vec3(), orientation = new Quat()}) {
		// Perspective
		this._aspect_ratio = aspect_ratio;
		this._near_z = near_plane;
		this._far_z = far_z;
		this._fov_y = fov_y;

		// Pose
		this._position = position;
		this._orientation = orientation;

		// Matrices
		this._view = Mat4.identity();
		this._projection = Mat4.identity();

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
	set postion(v3) {
		this._position.copy(v3);
	}

	/**
	 * Set this camera orientation.
	 */
	set orientation(q) {
		this._orientation.copy(q);
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
		this._projection.perspective(this._aspect_ratio, this._fov_y, this._near_z, this._far_z);
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

