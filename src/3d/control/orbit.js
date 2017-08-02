/**
 * @fileOverview Object manipulantion through orbit control.
 * @author Noodep
 * @version 0.23
 */
'use strict';

import Quat from '../../math/quat.js';
import Vec3 from '../../math/vec3.js';
import Vec4 from '../../math/vec4.js';

// Some constants used.
const HALFPI = Math.PI / 2.0;
const TWOPI = 2.0 * Math.PI;
const SQRT3 = Math.sqrt(3);

export default class OrbitControl {

	constructor(target,
			{
				element = document,
				radius = OrbitControl.DEFAULT_RADIUS,
				sensitivity = OrbitControl.DEFAULT_SENSITIVITY,
				sensitivity_modifier = OrbitControl.DEFAULT_SENSITIVITY_MODIFIER
			} = {}) {
		this._target = target;
		this._element = element;
		this._radius = radius;
		// Angle to the positive y-axis
		this._theta = HALFPI;
		// Angle around the positive y-axis from the negative z-axis in the x-z
		// plane
		this._phi = 0.0;
		this._offset = new Vec3();

		this._position = new Vec3();
		this._inclination = new Quat();
		this._azimuth = new Quat();

		this._sensitivity = sensitivity;
		this._sensitivity_modifier = sensitivity_modifier;

		this._initUserInputs();
		this._updatePosition();
	}

	/**
	 * Positions/orients the camera to look at a specified Object3D.
	 *
	 * @param {Object3D} object3d - The object to center on.
	 * @param {Vec3} [direction] - A vector describing the direction to look at
	 * the object. If unspecified, the current direction of the camera is used.
	 */
	centerOn(object3d, direction) {
		// TODO Base the distance on the bounding box of the object3d ?

		if (!direction) {
			direction = Vec3.NEG_Z_AXIS.clone()
				.rotate(this._inclination)
				.rotate(this._azimuth);
		} else {
			// Vector in the x-z plane pointing in the same (for x and z)
			// direction as direction.
			const xz_dir = direction.clone();
			xz_dir.y = 0.0;

			this._phi = Vec3.NEG_Z_AXIS.angle(xz_dir);
			this._theta = xz_dir.angle(direction) + HALFPI;
		}

		// Find the length of the unit direction vector at the corner of the
		// bounding cube in world coordinates to guage the size of the object.
		const scaled_size =
			new Vec4(SQRT3, SQRT3, SQRT3, 0.0)
			.transform(object3d.worldModel)
			.xyz.magnitude();
		this._radius = OrbitControl.FOCUS_DISTANCE * scaled_size;

		this._offset = object3d.origin.clone().transform(object3d.worldModel);

		this._updatePosition();
	}

	reset() {
		this._offset.fill(0.0);
		this._theta = HALFPI;
		this._phi = 0.0;
		this._radius = OrbitControl.DEFAULT_RADIUS;

		this._updatePosition();
	}

	/**
	 * Sets up user event bindings.
	 */
	_initUserInputs() {
		this._element.addEventListener('contextmenu', e => e.preventDefault());
		this._element.addEventListener('mousedown', this._handleMouseDown.bind(this));
		this._element.addEventListener('mouseup', this._handleMouseUp.bind(this));
		this._element.addEventListener('mousewheel', this._handleMouseWheel.bind(this));
		this._mouseMoveHandler = this._handleMouseMove.bind(this);
	}

	/**
	 * Handles mouse down events.
	 */
	_handleMouseDown(e) {
		this._element.addEventListener('mousemove', this._mouseMoveHandler);
	}

	/**
	 * Handles mouse up events.
	 */
	_handleMouseUp(e) {
		this._element.removeEventListener('mousemove', this._mouseMoveHandler);
	}

	/**
	 * Handles dragging of the target.
	 */
	_handleMouseMove(e) {
		if(e.shiftKey)
			this._offsetOrigin(e);
		else
			this._moveOnSphere(e);
	}

	/**
	 * Offset the center of the virtual sphere.
	 */
	_offsetOrigin(e) {
		const horizontal_delta = this._sensitivityAdjustedDisplacement(e, e.movementX);
		const vertical_delta = this._sensitivityAdjustedDisplacement(e, e.movementY);
		const sin_phi = Math.sin(this._phi);
		const cos_phi = Math.cos(this._phi);

		const delta_proj = -Math.cos(this._theta) * vertical_delta;

		this._offset.x += sin_phi * delta_proj - cos_phi * horizontal_delta;
		this._offset.z += cos_phi * delta_proj + sin_phi * horizontal_delta;
		this._offset.y += Math.sin(this._theta) * vertical_delta;

		this._updatePosition();
	}

	/**
	 * Move the camera on the virtual sphere.
	 */
	_moveOnSphere(e) {
		const horizontal_delta = this._sensitivityAdjustedDisplacement(e, e.movementX);
		const vertical_delta = this._sensitivityAdjustedDisplacement(e, e.movementY);

		this._moveHorizontally(-horizontal_delta);
		this._moveVertically(-vertical_delta);
		this._updatePosition();
	}

	/**
	 * Handles dragging of the target.
	 */
	_handleMouseWheel(e) {
		e.preventDefault();

		const delta = this._sensitivityAdjustedDisplacement(e, e.deltaY);
		this._zoom(delta);
		this._updatePosition();
	}

	/**
	 * Moves the target horizontally along the virtual sphere.
	 */
	_moveHorizontally(delta) {
		this._phi = this._phi + delta % TWOPI;

	}

	/**
	 * Moves the target vertically along the virtual sphere.
	 */
	_moveVertically(delta) {
		this._theta = Math.max(Math.min(this._theta + delta, Math.PI), 0);
	}

	/**
	 * Moves the target vertically along the virtual sphere.
	 */
	_zoom(delta) {
		this._radius = Math.max(this._radius + delta, 0);
	}

	/**
	 * Gets sensitivity adjusted displacement value.
	 */
	_sensitivityAdjustedDisplacement(e, raw) {
		let actual_sensitivity = this._sensitivity;
		if(e.ctrlKey)
			actual_sensitivity *= this._sensitivity_modifier;
		else if(e.altKey)
			actual_sensitivity /= this._sensitivity_modifier;

		return raw * actual_sensitivity;
	}

	/**
	 * Updates the target position and orientation in the cartesian coordinate system.
	 */
	_updatePosition() {
		const sin_theta = Math.sin(this._theta);

		this._position.x = this._offset.x + this._radius * sin_theta * Math.sin(this._phi);
		this._position.y = this._offset.y + this._radius * Math.cos(this._theta);
		this._position.z = this._offset.z + this._radius * sin_theta * Math.cos(this._phi);

		this._inclination.fromAxisRotation(this._theta - HALFPI, Vec3.X_AXIS);
		this._azimuth.fromAxisRotation(this._phi, Vec3.Y_AXIS);

		this._azimuth.multiply(this._inclination);
		this._target.setPosition(this._position);
		this._target.setOrientation(this._azimuth);
	}
}

OrbitControl.DEFAULT_SENSITIVITY = 0.005;
OrbitControl.DEFAULT_SENSITIVITY_MODIFIER = 0.1;
OrbitControl.DEFAULT_RADIUS = 1.0;
OrbitControl.FOCUS_DISTANCE = 0.5;

