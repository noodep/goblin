/**
 * @fileOverview Object3d class that represent a object that can be manipulated in a 3d environment.
 * @author Noodep
 * @version 0.30
 */

'use strict';

import {UUIDv4} from '../crypto/uuid.js';
import Mat4 from '../math/mat4.js';

export default class Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Object3d
	 *
	 * @return {module:3d.Object3d} - The newly created Object3d.
	 */
	constructor({ id = UUIDv4(), program_id, origin, orientation, scale } = {}) {
		this._id = id;
		this._program_id = program_id;
		this._children = new Map();
		this._initModel(origin, orientation, scale);
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
	 * Getter for this Object3d origin.
	 *
	 * @return {module:math.Vec3} - This Object3d origin.
	 */
	get origin() {
		return this._origin;
	}

	/**
	 * Getter for this Object3d orientation.
	 *
	 * @return {module:math.Vec3} - This Object3d orientation.
	 */
	get orientation() {
		return this._orientation;
	}

	/**
	 * Getter for this Object3d scaling.
	 *
	 * @return {module:math.Vec3} - This Object3d scaling.
	 */
	get scale() {
		return this._scale;
	}

	/**
	 * Getter for this Object3d model matrix.
	 *
	 * @return {module:math.Mat4} - This Object3d model matrix.
	 */
	get model() {
		return this._model;
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
	 * Sets this Object3d model matrix values to the values of the specified matrix.
	 */
	set model(mat4) {
		this._model.copy(mat4);
	}

	/**
	 * Adds a child to this Object3d
	 *
	 * @param {module:3d.Object3d} object - The Object3d to be added as a child.
	 */
	addChild(object) {
		this._children.set(object.id, object);
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
	 * Translate this Object3d by the specified vector.
	 *
	 * @param {module:math.Vec3} v - The vector by which to translate this Object3d.
	 */
	translate(v) {
		this._model.translate(v);
	}

	/**
	 * Translate this Object3d along its x axis.
	 *
	 * @param {Number} delta_x - the amount by which to translate this Object3d.
	 */
	translateX(delta_x) {
		this._model.translateX(delta_x);
	}

	/**
	 * Translate this Object3d along its y axis.
	 *
	 * @param {Number} delta_y - the amount by which to translate this Object3d.
	 */
	translateY(delta_y) {
		this._model.translateY(delta_y);
	}

	/**
	 * Translate this Object3d along its z axis.
	 *
	 * @param {Number} delta_z - the amount by which to translate this Object3d.
	 */
	translateZ(delta_z) {
		this._model.translateZ(delta_z);
	}

	/**
	 * Initializes this matrix model according to the specified parameters.
	 */
	_initModel(origin, orientation, scale) {
		this._model = Mat4.identity();

		if(origin)
			this._model.translateXYZ(origin[0], origin[1], origin[2]);

		if(scale)
			this._model.scaleXYZ(scale[0], scale[1], scale[2]);

		if(orientation) {
			this._model.rotateX(orientation[0]);
			this._model.rotateY(orientation[1]);
			this._model.rotateZ(orientation[2]);
		}
	}
}

