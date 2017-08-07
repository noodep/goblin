/**
 * @fileOverview Renderable class that represent a Object3D  thst can be rendered on screen.
 * Such object has a shader program associated with it and a geometry of some kind.
 *
 * @author Noodep
 * @version 0.04
 */

'use strict';

import {dl, wl} from '../util/log.js';
import {UUIDv4} from '../crypto/uuid.js';
import Object3D from '../3d/object3d.js';

/**
 * A class to represent an Object3D that can be rendered on a screen (by a
 * WebGLRenderer).
 *
 * Fires the following events (in addition to those of Object3D):
 *	'destroy' - Directly after destroy() has been called
 */
export default class Renderable extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Renderable
	 *
	 * @param {Array} geometry - This object geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @param {Object} options - Object3D options - id, origin, orientation, scale.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	constructor({ geometry, program, options } = {}) {
		super(options);
		this._vao = undefined;
		this._geometry = geometry;
		this._program = program;
		this._model_uniform_location = undefined;

		// Place to store a geometry between being set with the setter and being
		// initialized later in setShaderState().
		this._new_geometry = null;
	}

	get program() {
		return this._program;
	}

	get geometry() {
		return this._geometry;
	}

	set geometry(geometry) {
		this._new_geometry = geometry;
	}

	initialize(renderer) {
		dl(`Initializing Renderable with id ${this.id}.`);

		renderer.useProgram(this._program);
		const program = renderer.activeProgram;

		this._model_uniform_location = program.getUniform('model');

		this._initializeGeometry(renderer);
	}

	_initializeGeometry(renderer) {
		this._geometry.initializeContextBuffers(renderer);
		this._vao = this._geometry.initializeVertexArrayProcedure(renderer);
	}

	setShaderState(renderer) {
		if (this._new_geometry) {
			// Destroy isn't final, we are just changing to a new geometry and
			// vao.
			this.destroy(renderer);
			this._geometry = this._new_geometry;
			this._new_geometry = null;

			this._initializeGeometry(renderer);
		}

		renderer.activateVertexArray(this._vao);
		renderer._context.uniformMatrix4fv(this._model_uniform_location, false, this.worldModel.matrix);
	}

	cleanShaderState(renderer) {
		renderer.activateVertexArray(null);
	}

	render(renderer) {
		this._geometry.render(renderer);
	}

	/**
	 * Deletes the geometry and the vertex array object used from GPU memory.
	 */
	destroy(renderer) {
		this._geometry.destroy(renderer);
		renderer.deleteVertexArray(this._vao);
		this.notify('destroy');
	}
}

