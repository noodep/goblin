/**
 * @file object manipulation through orbit control
 *
 * @author noodep
 * @version 1.68
 */

import Quat from '../../math/quat.js';
import Vec3 from '../../math/vec3.js';

export default class OrbitControl {

	constructor(target, options = {}) {
		this._target = target;

		({
			element: this._element = document,
			radius: this._radius = OrbitControl.DEFAULT_RADIUS,
			sensitivity: this._sensitivity = OrbitControl.DEFAULT_SENSITIVITY,
			sensitivity_modifier: this._sensitivity_modifier = OrbitControl.DEFAULT_SENSITIVITY_MODIFIER
		} = options);

		this._azimuth = 0.0;
		this._inclination = OrbitControl.HALFPI;
		this._offset = new Vec3();

		this._position = new Vec3();
		this._orientation = new Quat();
		this._inclination_orientation = new Quat();

		this._initUserInputs();
		this._updatePosition();
	}

	/**
	 * Computes an orbital position in cartesian space, using the specified parameters.
	 *
	 * @param {Vec3}   offset                   - origin of the orbital sphere.
	 * @param {Number} radius                   - radius of the orbital sphere.
	 * @param {Number} azimuth                  - azimuth of the point to compute (from positive x).
	 * @param {Number} inclination              - inclination of the point to compute (from positive z).
	 * @param {Vec3}   [postition = new Vec3()] - vector holding the result of the computation (also returned by this function).
	 *
	 * @retrun {Vec3} - computed postion.
	 */
	static position(offset, radius, azimuth, inclination, position = new Vec3()) {

		const xy_projection_inclination_magnitude = Math.sin(inclination) * radius;

		position.x = offset.x + Math.cos(azimuth) * xy_projection_inclination_magnitude;
		position.y = offset.y + Math.sin(azimuth) * xy_projection_inclination_magnitude;
		position.z = offset.z + Math.cos(inclination) * radius;

		return position;
	}

	/**
	 * computes an orbital orientation to look at the center of the sphere from the point described by the specified parameters
	 *
	 * @param {Number} azimuth                            - azimuth of the point from which to look at the center (counter clockwise from positive x)
	 * @param {Number} inclination                        - inclination of the point from which to look at the center (from positive z)
	 * @param {Quat}   [orientation = new Quat()]         - quaternion holding the result of the computation (also returned by this function)
	 * @param {Quat}   [azimuth_orientation = new Quat()] - quaternion holding the azimuthal orientation (useful for avoiding the creation of a new quaternion every time this function is called)
	 *
	 * @retrun {Quat} - the computed orientation
	 */
	static orientation(azimuth, inclination, orientation = new Quat(), inclination_orientation = new Quat()) {
		// substracting PI/2 gives the orientation to which the camera should point
		// it effectively mirrors along the inclination normal plane
		// in a xyz right handed coordinate system, if the camera is in the positive octant, it should look towards the negative octant
		// computes the inclination
		inclination_orientation.fromAxisRotation(inclination - OrbitControl.HALFPI, Vec3.Y_AXIS);

		// comuputes the azimuthal rotation
		orientation.fromAxisRotation(azimuth, Vec3.Z_AXIS);

		// rotates the azimuth by the inclination
		orientation.multiply(inclination_orientation);

		return orientation;
	}

	get offset() {
		return this._offset;
	}

	set offset(offset) {
		this._offset.copy(offset);
		this._updatePosition();
	}

	get radius() {
		return this._radius;
	}

	set radius(radius) {
		this._radius = radius;
		this._updatePosition();
	}

	get azimuth() {
		return this._azimuth;
	}

	set azimuth(azimuth) {
		this._azimuth = azimuth;
		this._updatePosition();
	}

	get inclination() {
		return this._inclination;
	}

	set inclination(inclination) {
		this._inclination = inclination;
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
		({
			offset: this._offset,
			radius: this._radius,
			azimuth: this._azimuth = this._azimuth,
			inclination: this._inclination = this._inclination
		} = OrbitControl.lookAtParameters(object3d, direction));

		this._updatePosition();
	}

	/**
	 * offsets the center of the virtual sphere from the perspective of the camera.
	 */
	offsetOrigin(horizontal_delta, vertical_delta) {
		const sin_azimuth = Math.sin(this._azimuth);
		const cos_azimuth = Math.cos(this._azimuth);

		const delta_proj = -Math.cos(this._inclination) * vertical_delta;

		this._offset.x += cos_azimuth * delta_proj + sin_azimuth * horizontal_delta;
		this._offset.y += sin_azimuth * delta_proj - cos_azimuth * horizontal_delta;
		this._offset.z += Math.sin(this._inclination) * vertical_delta;

		this._updatePosition();
	}

	/**
	 * Moves the camera on the virtual sphere.
	 */
	moveOnSphere(horizontal_delta, vertical_delta) {
		this._azimuth = (this._azimuth + horizontal_delta) % OrbitControl.TWOPI;
		this._inclination = Math.max(Math.min(this._inclination + vertical_delta, Math.PI), 0);
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
		this._element.addEventListener('wheel', this._handleMouseWheel.bind(this));
		this._mouseMoveHandler = this._handleMouseMove.bind(this);
	}

	/**
	 * Handles mouse down events.
	 */
	_handleMouseDown() {
		this._element.addEventListener('mousemove', this._mouseMoveHandler);
	}

	/**
	 * Handles mouse up events.
	 */
	_handleMouseUp() {
		this._element.removeEventListener('mousemove', this._mouseMoveHandler);
	}

	/**
	 * Handles dragging of the target.
	 */
	_handleMouseMove(e) {
		const horizontal_delta = this._sensitivityAdjustedDisplacement(e, e.movementX);
		const vertical_delta = this._sensitivityAdjustedDisplacement(e, e.movementY);

		if(e.shiftKey)
			this.offsetOrigin(horizontal_delta, vertical_delta);
		else
			// draging the visual sphere means moving the camera in the opposite direction, hence the negation
			this.moveOnSphere(-horizontal_delta, -vertical_delta);
	}

	/**
	 * Handles dragging of the target.
	 */
	_handleMouseWheel(e) {
		e.preventDefault();

		const delta = this._sensitivityAdjustedDisplacement(e, Math.sign(e.deltaY) * OrbitControl.DEFAULT_ZOOM_SENSITIVITY);
		this._radius = Math.max(this._radius + delta, 0);
		this._updatePosition();
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
		OrbitControl.position(this._offset, this._radius, this._azimuth, this._inclination, this._position);
		OrbitControl.orientation(this._azimuth, this._inclination, this._orientation, this._inclination_orientation);

		this._target.setPose(this._position, this._orientation);
	}

}

OrbitControl.HALFPI = Math.PI / 2.0;
OrbitControl.TWOPI = 2.0 * Math.PI;
OrbitControl.SQRT3 = Math.sqrt(3);
OrbitControl.DEFAULT_SENSITIVITY = 0.005;
OrbitControl.DEFAULT_ZOOM_SENSITIVITY = 10.0;
OrbitControl.DEFAULT_SENSITIVITY_MODIFIER = 0.1;
OrbitControl.DEFAULT_RADIUS = 1.0;
OrbitControl.FOCUS_DISTANCE = 0.5;

