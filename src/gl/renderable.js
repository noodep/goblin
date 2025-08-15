/**
 * @file Renderable class that represent a Object3D  thst can be rendered on screen
 * Such object has a shader program associated with it and a geometry of some kind
 *
 * @author noodep
 * @version 0.20
 */

import { dl } from '../util/log.js';
import Object3D from '../3d/object3d.js';

/** @typedef {import('../gl/geometry/geometry.js')} Geometry */

/**
 * A class to represent an Object3D that can be rendered on a screen (by a
 * WebGLRenderer).
 */
export default class Renderable extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Renderable
	 *
	 * @param {String} id - The unique identifier of this object.
	 * @param {String} name - The name of this object.
	 * @param {VecLike} origin - The origin position of this object.
	 * @param {QuatLike} orientation - The orientation of this object.
	 * @param {VecLike} scale - The scale of this object.
	 * @param {Geometry} geometry - This object geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	constructor(id, name, origin, orientation, scale, geometry, program) {
		super(id, name, origin, orientation, scale);
		/** @type {Geometry} */ this._geometry = geometry;
		/** @type {String} */ this._program = program;
		/** @type {WebGLUniformLocation|undefined} */ this._model_uniform_location = undefined;

		// Place to store a geometry between being set with the setter and being
		// initialized later in setShaderState().
		/** @type {Geometry} */ this._new_geometry = null;
	}

	/**
	 * Creates a new Renderable instance.
	 *
	 * @param {Object} params - The parameters for the Renderable.
	 * @param {String} params.id - The unique identifier of this object.
	 * @param {String} params.name - The name of this object.
	 * @param {Vec3} params.origin - The origin position of this object.
	 * @param {Quaternion} params.orientation - The orientation of this object.
	 * @param {Vec3} params.scale - The scale of this object.
	 * @param {Geometry} params.geometry - This object geometry.
	 * @param {String} params.program - The name of this object rendering program.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	static create({ id, name, origin, orientation, scale, geometry, program } = {}) {
		return new Renderable(id, name, origin, orientation, scale, geometry, program);
	}

	/** @returns {string} The name of the object rendering program. */
	get program() {
		return this._program;
	}

	/** @returns {Geometry} The geometry of the object. */
	get geometry() {
		return this._geometry;
	}

	/** @param {Geometry} geometry - The geometry of the object. */
	set geometry(geometry) {
		this._new_geometry = geometry;
	}

	/** @param {WebGLRenderer} renderer - Initialize GPU state for this renderable. */
	initialize(renderer) {
		dl(`Initializing Renderable with id ${this.id}.`);

		renderer.useProgram(this._program);
		const program = renderer.activeProgram;

		this._model_uniform_location = program.getUniform('model');

		// Only initialize geometry if it hasn't been initialized yet
		if (!this._geometry.isInitialized) {
			this._geometry.initialize(renderer);
		}
	}

	/** @param {WebGLRenderer} renderer - Bind Vertex Array Object and pre-draw uniforms. */
	setShaderState(renderer) {
		if (this._new_geometry) {
			if (this._geometry.isInitialized) this._geometry.destroy(renderer);
			this._geometry = this._new_geometry;
			this._geometry.initialize(renderer);
			this._new_geometry = null;
		}

		renderer.activateVertexArray(this._geometry.vao);
		renderer._context.uniformMatrix4fv(this._model_uniform_location, false, this.worldModel.matrix);
	}

	/** @param {WebGLRenderer} renderer - Unbind Vertex Array Object and post-draw cleanup. */
	cleanShaderState(renderer) {
		renderer.activateVertexArray(null);
	}

	/** @param {WebGLRenderer} renderer - Issue draw call for this renderable. */
	render(renderer) {
		this._geometry.render(renderer);
	}

	/**
	 * Deletes the geometry and the vertex array object used from GPU memory.
	 * The Renderable can still be re-initialized later.
	 */
	destroy() {
		this._geometry.destroy();
		super.destroy();
	}

}
