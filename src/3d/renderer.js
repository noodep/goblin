/**
 * @fileOverview Renderer class that represent a object that can be rendered and manipulated in a 3d environment.
 * @author Noodep
 * @version 0.21
 */

'use strict';

import {UUIDv4} from '../crypto/uuid.js';
import Mat4 from '../math/mat4.js';

export default class Renderer {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Renderer
	 *
	 * @return {module:3d.Renderer} - The newly created renderer.
	 */
	constructor({ id = UUIDv4(), program_id, origin, orientation, scale } = {}) {
		this._id = id;
		this._program_id = program_id;
		this._children = new Map();
		this._initModel(origin, orientation, scale);
	}

	/**
	 * Getter for this renderer id.
	 *
	 * @return {String} - This renderer id.
	 */
	get id() {
		return this._id;
	}

	/**
	 * Getter for this renderer origin.
	 *
	 * @return {module:math.Vec3} - This renderer origin.
	 */
	get origin() {
		return this._origin;
	}

	/**
	 * Getter for this renderer orientation.
	 *
	 * @return {module:math.Vec3} - This renderer orientation.
	 */
	get orientation() {
		return this._orientation;
	}

	/**
	 * Getter for this renderer scaling.
	 *
	 * @return {module:math.Vec3} - This renderer scaling.
	 */
	get scale() {
		return this._scale;
	}

	/**
	 * Getter for this renderer model matrix.
	 *
	 * @return {module:math.Mat4} - This renderer model matrix.
	 */
	get model() {
		return this._model;
	}

	/**
	 * Getter for this renderer children.
	 *
	 * @return {Iterator} - This renderer children.
	 */
	get children() {
		return this._children.values();
	}

	/**
	 * Sets this renderer model matrix values to the values of the specified matrix.
	 */
	set model(mat4) {
		this._model.copy(mat4);
	}

	/**
	 * Adds a child to this renderer
	 *
	 * @param {module:3d.Renderer} - The renderer to be added as a child.
	 */
	addChild(renderer) {
		this._children.set(renderer.id, renderer);
	}

	/**
	 * Removes a child from this renderer if possible.
	 *
	 * @param {module:3d.Renderer} - The renderer to be removed.
	 * @return {Boolean} - true if the renderer was removed, false if the renderer was not a child of this renderer.
	 */
	removeChild(renderer) {
		if(!this._children.has(renderer.id))
			return false;

		this._children.delete(renderer.id);
		return true;
	}

	/**
	 * Translate this renderer by the specified vector.
	 *
	 * @param {module:math.Vec3} v - The vector by which to translate this renderer.
	 */
	translate(v) {
		this._model.translate(v);
	}

	/**
	 * Translate this renderer along its x axis.
	 *
	 * @param {Number} delta_x - the amount by which to translate this renderer.
	 */
	translateX(delta_x) {
		this._model.translateX(delta_x);
	}

	/**
	 * Translate this renderer along its y axis.
	 *
	 * @param {Number} delta_y - the amount by which to translate this renderer.
	 */
	translateY(delta_y) {
		this._model.translateY(delta_y);
	}

	/**
	 * Translate this renderer along its z axis.
	 *
	 * @param {Number} delta_z - the amount by which to translate this renderer.
	 */
	translateZ(delta_z) {
		this._model.translateZ(delta_z);
	}

	/**
	 * Initializes this matrix model according to the specified parameters.
	 */
	_initModel(origin, orientation, scale) {
		this._model = new Mat4();

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

