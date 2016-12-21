/**
 * @fileOverview Renderable class that represent a Object3D  thst can be rendered on screen.
 * Such object has a shader program associated with it and a geometry of some kind.
 * @author Noodep
 * @version 0.03
 */
'use strict';

import {dl, wl} from '../util/log.js';
import {UUIDv4} from '../crypto/uuid.js';
import Object3D from '../3d/object3d.js';

export default class Renderable extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Renderable
	 *
	 * @param {String} renderable_id - This object id.
	 * @param {Array} geometry - This object geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	constructor(renderable_id, geometry, program_name) {
		super({id: renderable_id});
		this._vao = undefined;
		this._geometry = geometry;

		this._program_name = program_name;
	}

	get programName() {
		return this._program_name;
	}

	initialize(renderer) {
		dl(`Initializing Renderable with id ${this.id}.`);

		this._geometry.initializeContextBuffers(renderer);
		this._vao = this._geometry.initializeVertexArrayProcedure(renderer, this._program_name);
	}

	setShaderState(renderer) {
		renderer.activateVertexArray(this._vao);
	}

	cleanShaderState(renderer) {
		renderer.activateVertexArray(null);
	}

	render(renderer) {
		this._geometry.render(renderer);
	}
}
