/**
 * @file object manipulation through orbit control
 *
 * @author noodep
 * @version 2.27
 */

import Quat from '../../math/quat.js';
import Vec3 from '../../math/vec3.js';

export default class OrbitControl extends EventTarget {

	static HALF_PI = Math.PI / 2.0;
	static TWO_PI = 2.0 * Math.PI;
	static SQRT_3 = Math.sqrt(3);
	static DEFAULT_RADIUS = 1.0;
	static DEFAULT_AZIMUTH = 0.0;
	static DEFAULT_INCLINATION = OrbitControl.HALF_PI;

	constructor(target, options = {}) {
		super();
		this._target = target;

		({
			radius: this._radius = OrbitControl.DEFAULT_RADIUS,
			azimuth: this._azimuth = OrbitControl.DEFAULT_AZIMUTH,
			inclination: this._inclination = OrbitControl.DEFAULT_INCLINATION,
			offset: this._offset = new Vec3(),
		} = options);

		this._position = new Vec3();
		this._orientation = new Quat();
		this._inclination_orientation = new Quat();

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
		inclination_orientation.fromAxisRotation(inclination - OrbitControl.HALF_PI, Vec3.Y_AXIS);

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
		this._radius = Math.max(radius, 0);
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
		this._azimuth = (this._azimuth + horizontal_delta) % OrbitControl.TWO_PI;
		this._inclination = Math.max(Math.min(this._inclination + vertical_delta, Math.PI), 0);

		this._updatePosition();
		this.dispatchEvent(new CustomEvent('orientation'));
	}

	setOnSphere(azimuth, inclination) {
		this._azimuth = azimuth;
		this._inclination = inclination;

		this._updatePosition();
		this.dispatchEvent(new CustomEvent('orientation'));
	}

	reset() {
		this._offset.fill(0.0);
		this._theta = OrbitControl.HALF_PI;
		this._phi = 0.0;
		this._radius = OrbitControl.DEFAULT_RADIUS;

		this._updatePosition();
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
