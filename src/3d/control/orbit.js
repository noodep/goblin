/**
 * @fileOverview Object manipulantion through orbit control.
 * @author Noodep
 * @version 0.22
 */
'use strict';

import Vec3 from '../../math/vec3.js';
import Quat from '../../math/quat.js';

export default class OrbitControl {

	constructor(target, { element = document, radius = 1, sensitivity = OrbitControl.DEFAULT_SENSITIVITY, sensitivity_modifier = DEFAULT_SENSITIVITY_MODIFIER }) {
		this._target = target;
		this._element = document;
		this._radius = 20;
		this._theta = Math.PI / 2.0;
		this._phi = 0;
		this._offset = new Vec3();

		this._position = new Vec3();
		this._x_axis = new Vec3(1.0, 0.0, 0.0);
		this._y_axis = new Vec3(0.0, 1.0, 0.0);
		this._inclination = new Quat();
		this._azimuth = new Quat();

		this._sensitivity = sensitivity;
		this._sensitivity_modifier = sensitivity_modifier;

		this._initUserInputs();
		this._updatePosition();
	}

	/**
	 * Sets up user event bindings.
	 */
	_initUserInputs() {
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
		this._phi = this._phi + delta % OrbitControl.TWOPI;

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
		this._radius = Math.max(this._radius + delta, 0.1);
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

		this._inclination.fromAxisRotation(this._theta - OrbitControl.HALFPI, this._x_axis);
		this._azimuth.fromAxisRotation(this._phi, this._y_axis);

		this._azimuth.multiply(this._inclination);
		this._target.setPosition(this._position);
		this._target.setOrientation(this._azimuth);
	}
}

OrbitControl.TWOPI = 2.0 * Math.PI;
OrbitControl.HALFPI = Math.PI / 2.0;
OrbitControl.DEFAULT_SENSITIVITY = 0.005;
OrbitControl.DEFAULT_SENSITIVITY_MODIFIER = 0.1;


