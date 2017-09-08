/**
 * @fileOverview Object manipulantion through orbit control.
 * @author Noodep
 * @version 0.23
 */
'use strict';

import Quat from '../../math/quat.js';
import Vec3 from '../../math/vec3.js';
import Vec4 from '../../math/vec4.js';

export default class OrbitControl {

	constructor(target, { element = document, radius = OrbitControl.DEFAULT_RADIUS, sensitivity = OrbitControl.DEFAULT_SENSITIVITY, sensitivity_modifier = OrbitControl.DEFAULT_SENSITIVITY_MODIFIER } = {}) {
		this._target = target;
		this._element = element;
		this._radius = radius;
		this._theta = OrbitControl.HALFPI;
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
	 * Computes orbit parameters from which one can look at the specified object3d from the specified direction.
	 * If direction is unspecified only position parameters are computed and returned.
	 *
	 * @param {Object3D} object3d - The object to focus on.
	 * @param {Vec3} [direction] - A vector describing the direction to look at.
	 * @retrun {object} - The computed parameters (offset, radius, phi, theta).
	 */
	static lookAtParameters(object3d, direction) {
		const parameters = {};

		const unit_diagonal = new Vec4(OrbitControl.SQRT3, OrbitControl.SQRT3, OrbitControl.SQRT3, 0.0);
		const zoom = unit_diagonal.transform(object3d.worldModel).xyz.magnitude();
		parameters.offset = new Vec3(0.0, 0.0, 0.0).transform(object3d.worldModel);
		parameters.radius = OrbitControl.FOCUS_DISTANCE * zoom;

		if(direction) {
			const xz_dir = new Vec3(direction.x, 0.0, direction.z);
			parameters.phi = Vec3.NEG_Z_AXIS.angle(xz_dir);
			parameters.theta = OrbitControl.HALFPI - xz_dir.angle(direction);
		}

		return parameters;
	}

	static resetParameters() {
		return {
			offset: new Vec3(0.0, 0.0, 0.0),
			theta: OrbitControl.HALFPI,
			phi: 0.0,
			radius: OrbitControl.DEFAULT_RADIUS,
		};
	}

	/**
	 * Computes orbit pose from which one can look at the specified object3d from the specified direction.
	 * If direction is unspecified default direction is used.
	 *
	 * @param {Object3D} object3d - The object to focus on.
	 * @param {Vec3} [direction] - A vector describing the direction to look at.
	 * @retrun {object} - The computed parameters (position as Vec3 and orientation as Quat).
	 */
	static lookAt(object3d, direction) {
		const { offset, radius, phi = 0, theta = 0 } = OrbitControl.lookAtParameters(object3d, direction);

		const position = OrbitControl.position(offset, radius, phi, theta);
		const orientation = OrbitControl.orientation(phi, theta);

		return {
			position: position,
			orientation: orientation
		};
	}

	/**
	 * Computes an orbital position in cartesian space, using the specified parameters.
	 *
	 * @param {Vec3} offset - The origin of the orbital sphere.
	 * @param {Number} radius - The radius of the orbital sphere.
	 * @param {Number} phi - The azimuth of the point to compute (from positive Z).
	 * @param {Number} theta - The inclination of the point to compute (from positive Y).
	 * @param {Vec3} [postition = new Vec3()] - The vector holding the result of the computation (also returned by this function).
	 * @retrun {Vec3} - The computed postion.
	 */
	static position(offset, radius, phi, theta, position = new Vec3()) {
		const sin_theta = Math.sin(theta);

		position.x = offset.x + radius * sin_theta * Math.sin(phi);
		position.y = offset.y + radius * Math.cos(theta);
		position.z = offset.z + radius * sin_theta * Math.cos(phi);

		return position;
	}

	/**
	 * Computes an orbital orientation to look at the center of the sphere from the point described by the specified parameters.
	 *
	 * @param {Number} phi - The azimuth of the point from which to look at the center (from positive Z).
	 * @param {Number} theta - The inclination of the point from which to look at the center (from positive Y).
	 * @param {Quat} [orientation = new Quat()] - The quaternion holding the result of the computation (also returned by this function).
	 * @param {Quat} [temp = new Quat()] - A temporary quaternion used by the computation (useful for avoiding the creation of a new object every time this function is called).
	 * @retrun {Quat} - The computed orientation.
	 */
	static orientation(phi, theta, orientation = new Quat(), temp = new Quat()) {
		temp.fromAxisRotation(theta - OrbitControl.HALFPI, Vec3.X_AXIS);
		orientation.fromAxisRotation(phi, Vec3.Y_AXIS);
		orientation.multiply(temp);

		return orientation;
	}

	get offset() {
		return this._offset;
	}

	set offset(offset) {
		this._offset = offset;
		this._updatePosition();
	}

	get radius() {
		return this._radius;
	}

	set radius(radius) {
		this._radius = radius;
		this._updatePosition();
	}

	get phi() {
		return this._phi;
	}

	set phi(phi) {
		this._phi = phi;
		this._updatePosition();
	}

	get theta() {
		return this._theta;
	}

	set theta(theta) {
		this._theta = theta;
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
		({offset: this._offset, radius: this._radius, phi: this._phi = this._phi, theta: this._theta = this._theta} = OrbitControl.lookAtParameters(object3d, direction));
		this._updatePosition();
	}

	reset() {
		this._offset.fill(0.0);
		this._theta = OrbitControl.HALFPI;
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
		OrbitControl.position(this._offset, this._radius, this._phi, this._theta, this._position);
		OrbitControl.orientation(this._phi, this._theta, this._azimuth, this._inclination);

		this._target.setPosition(this._position);
		this._target.setOrientation(this._azimuth);
	}
}

OrbitControl.HALFPI = Math.PI / 2.0;
OrbitControl.TWOPI = 2.0 * Math.PI;
OrbitControl.SQRT3 = Math.sqrt(3);
OrbitControl.DEFAULT_SENSITIVITY = 0.005;
OrbitControl.DEFAULT_SENSITIVITY_MODIFIER = 0.1;
OrbitControl.DEFAULT_RADIUS = 1.0;
OrbitControl.FOCUS_DISTANCE = 0.5;

