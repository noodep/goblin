/**
 * @fileOverview Object3d class that represent a object that can be manipulated in a 3d environment.
 * @author Noodep
 * @version 0.33
 */

'use strict';

import {UUIDv4} from '../crypto/uuid.js';
import Mat4 from '../math/mat4.js';
import Quat from '../math/quat.js';
import Vec3 from '../math/vec3.js';

/**
 * Map between IDs of Object3Ds and the objects themselves.
 * TODO Consider implementing this as a WeakSet. Using a (non-weak) Map keeps
 * references to the values and so does not allow for garbage collection. Using
 * a WeakMap would have the same problem since the Object3D instances would be
 * values and references to them would exist in the map. Using a WeakSet would
 * not allow for iteration over all objects, though this may not be a problem.
 */
const CREATED_OBJECT3DS = new Map();

/**
 * Register the ID with the Object3D instance in CREATED_OBJECT3DS. If an object
 * with the specified ID already exists, an error is thrown.
 */
function registerObject3D(id, object) {
	if (!object || CREATED_OBJECT3DS.has(id)) {
		throw new Error(`Object3D already created with ID ${id}.`);
	}

	CREATED_OBJECT3DS.set(id, object);
}


export default class Object3D {

	/**
	 * Gets the Object3D with the specified ID or undefined if one does not
	 * exist. This also returns the input if the input is already an instance of
	 * Object3D so that IDs can be replaced in usage with the objects
	 * themselves.
	 */
	static getObject3D(id) {
		if (id instanceof Object3D) {
			return id;
		} else {
			return CREATED_OBJECT3DS.get(id);
		}
	}

	/**
	 * Returns an iterator over the created Object3Ds.
	 */
	static allObject3Ds() {
		return CREATED_OBJECT3DS.values();
	}

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Object3d
	 *
	 * @param {String} [id=uuidv4()] - this object id.
	 * @param {Array} [origin] - a 3 dimensional array containing this object origin.
	 * @param {Array} [orientation] - a 3 dimensional array containing this object orientation. Euler angles in radians around XYZ.
	 * @param {Array} [scale] - a 3 dimensional array containing this object scaling.
	 * @return {module:3d.Object3d} - The newly created Object3d.
	 */
	constructor({ id = UUIDv4(), origin = new Vec3(), orientation = Quat.identity(), scale = Vec3.identity() } = {}) {
		registerObject3D(id, this);
		this._id = id;
		this._parent = undefined;
		this._children = new Map();
		this._origin = origin;
		this._orientation = orientation;
		this._scale = scale;
		this._is_model_valid = false;
		this._local_model = Mat4.identity();
		this._world_model = Mat4.identity();

		// Temporary quaternion used for rotations. This avoids creating one each time.
		this._tmp_quaternion = new Quat();
	}

	/**
	 * Getter for this Object3d id.
	 *
	 * @return {String} - This Object3d id.
	 */
	get id() {
		return this._id;
	}

	/**
	 * Getter for this Object3d parent.
	 *
	 * @return {module:3d.object3d} - This Object3d parent.
	 */
	get parent() {
		return this._parent;
	}

	/**
	 * Setter for this Object3d parent.
	 *
	 * @param {module:3d.object3d} parent - This Object3d new parent.
	 */
	set parent(parent) {
		this._parent = parent;
		this.invalidateModel();
	}

	/**
	 * Getter for this Object3d origin.
	 *
	 * @return {module:math.Vec3} - This Object3d origin.
	 */
	get origin() {
		return this._origin;
	}

	/**
	 * Setter for this Object3d origin.
	 *
	 * @param {module:math.Vec3} v3 - This Object3d new origin.
	 */
	set origin(v3) {
		this._origin.copy(v3);
		this.invalidateModel();
	}

	/**
	 * Getter for this Object3d orientation.
	 *
	 * @return {module:math.Quat} - This Object3d orientation.
	 */
	get orientation() {
		return this._orientation;
	}

	/**
	 * Setter for this Object3d orientation.
	 *
	 * @param {module:math.Quat} q - This Object3d new orientation.
	 */
	set orientation(q) {
		this._orientation.copy(q)
		this.invalidateModel();
	}

	/**
	 * Getter for this Object3d scaling.
	 *
	 * @return {module:math.Vec3} - This Object3d scaling.
	 */
	get size() {
		return this._scale;
	}

	/**
	 * Setter for this Object3d scaling.
	 *
	 * @param {module:math.Vec3} v3 - This Object3d new scaling.
	 */
	set size(v3) {
		this._scale.copy(v3);
		this.invalidateModel();
	}


	/**
	 * Getter for this Object3d children.
	 *
	 * @return {Iterator} - This Object3d children.
	 */
	get children() {
		return this._children.values();
	}

	/**
	 * Getter for this Object3d local model matrix.
	 *
	 * @return {module:math.Mat4} - This Object3d local model matrix.
	 */
	get localModel() {
		return this._local_model;
	}

	/**
	 * Sets this Object3d local model matrix values to the values of the specified matrix.
	 * Invalidate the model so it will be recomputed during the next update.
	 */
	set localModel(mat4) {
		this._local_model.copy(mat4);
		this.invalidateModel();
	}

	/**
	 * Getter for this Object3d world model matrix.
	 *
	 * @return {module:math.Mat4} - This Object3d world model matrix.
	 */
	get worldModel() {
		return this._world_model;
	}

	/**
	 * Sets this Object3d world model matrix values to the values of the specified matrix.
	 * Invalidate the model so it will be recomputed during the next update.
	 */
	set worldModel(mat4) {
		this._world_model.copy(mat4);
		this.invalidateModel();
	}

	/**
	 * Adds a child to this Object3d
	 *
	 * @param {module:3d.Object3d} object - The Object3d to be added as a child.
	 */
	addChild(object) {
		if(object.parent)
			throw new Error('Unable to add the specified object to this node as it already has a parent.');

		this._children.set(object.id, object);
		object.parent = this;
	}

	/**
	 * Removes a child from this Object3d if possible.
	 *
	 * @param {module:3d.Object3d} object - The Object3d to be removed.
	 * @return {Boolean} - true if the object was removed, false if the object was not a child of this Object3d.
	 */
	removeChild(object) {
		if(!this._children.has(object.id))
			return false;

		this._children.delete(object.id);
		return true;
	}

	/**
	 * Updates this object model matrix.
	 */
	update() {
		if(!this._is_model_valid)
			this._revalidateModel();

		for(let child of this.children)
			child.update();
	}

	/**
	 * Invalidates this object model matrix.
	 * An invalid matrix will be recomputed during the next update.
	 */
	invalidateModel() {
		this._is_model_valid = false;
		for(let child of this._children.values())
			child.invalidateModel();
	}

	/**
	 * Scales this Object3d by the specified vector.
	 *
	 * @param {module:math.Vec3} v - The vector by which to translate this Object3d.
	 */
	scale(v) {
		this._scale.multiply(v);
		this.invalidateModel();
	}

	/**
	 * Translates this Object3d by the specified vector.
	 *
	 * @param {module:math.Vec3} v - The vector by which to translate this Object3d.
	 */
	translate(v) {
		this._origin.add(v);
		this.invalidateModel();
	}

	/**
	 * Translates this Object3d along its X axis.
	 *
	 * @param {Number} delta_x - the amount by which to translate this Object3d.
	 */
	translateX(delta_x) {
		this._origin.translateX(delta_x);
		this.invalidateModel();
	}

	/**
	 * Translates this Object3d along its Y axis.
	 *
	 * @param {Number} delta_y - the amount by which to translate this Object3d.
	 */
	translateY(delta_y) {
		this._origin.translateY(delta_y);
		this.invalidateModel();
	}

	/**
	 * Translates this Object3d along its Z axis.
	 *
	 * @param {Number} delta_z - the amount by which to translate this Object3d.
	 */
	translateZ(delta_z) {
		this._origin.translateZ(delta_z);
		this.invalidateModel();
	}

	/**
	 * Applies a rotation around the specified axis to this object.
	 *
	 * @param {Number} theta - The angle (in radians) by which to rotate.
	 * @param {module:math.Vec3} axis - The axis to rotate around.
	 * @return {module:3d.object3d} - The rotated object.
	 */
	rotate(theta, axis) {
		this._tmp_quaternion.fromAxisRotation(theta, axis);
		this._orientation.multiply(this._tmp_quaternion);
		this.invalidateModel();
		return this;
	}

	/**
	 * Applies a rotation in R3 around the X axis to this object.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 */
	rotateX(theta) {
		this._tmp_quaternion.fromAxisRotation(theta, Vec3.X_AXIS);
		this._orientation.multiply(this._tmp_quaternion);
		this.invalidateModel();
	}

	/**
	 * Applies a rotation in R3 around the Y axis to this object.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 */
	rotateY(theta) {
		this._tmp_quaternion.fromAxisRotation(theta, Vec3.Y_AXIS);
		this._orientation.multiply(this._tmp_quaternion);
		this.invalidateModel();
	}

	/**
	 * Applies a rotation in R3 around the Z axis to this object.
	 *
	 * @param {Number} theta - Angle in radians by which to rotate.
	 */
	rotateZ(theta) {
		this._tmp_quaternion.fromAxisRotation(theta, Vec3.Z_AXIS);
		this._orientation.multiply(this._tmp_quaternion);
		this.invalidateModel();
	}

	/**
	 * Recomputes this object model matrix.
	 */
	_revalidateModel() {
		this._local_model.identity();
		this._local_model.orientation = this._orientation;
		this._local_model.translation = this._origin;
		this._local_model.scale = this._scale;

		this._computeWorldModel();

		for(let child of this._children.values())
			child.invalidateModel();

		this._is_model_valid = true;
	}

	/**
	 * Computes this object world matrix based on the local model and this object parent world matrix.
	 */
	_computeWorldModel() {
		if(this._parent) {
			this._world_model.copy(this._parent.worldModel);
			this._world_model.multiply(this._local_model);
		} else {
			this._world_model.copy(this._local_model);
		}
	}

}

