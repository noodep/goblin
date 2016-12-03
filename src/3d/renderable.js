/**
 * @fileOverview Renderable class that represent a Object3D  thst can be rendered on screen.
 * Such object has a shader program associated with it and a geometry of some kind.
 * @author Noodep
 * @version 0.03
 */
'use strict';

import {dl, wl} from '../util/log.js';
import {UUIDv4} from '../crypto/uuid.js';
import Object3D from './object3d.js';

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
		this._buffer_id = UUIDv4();
		this._geometry = geometry;
		this._program_name = program_name;
	}

	get programName() {
		return this._program_name;
	}

	initialize(renderer) {
		dl(`Initializing Renderable with id ${this.id}.`);
		renderer.createBufferObject(
			this._buffer_id,
			this._geometry.byteLength,
			WebGLRenderingContext.ARRAY_BUFFER,
			WebGLRenderingContext.STATIC_DRAW
		);

		renderer.updateBufferObjectData(this._buffer_id, this._geometry);
	}

	setShaderState() {
		wl('Cannot set the shader state of a Renderable directly. The setShaderState function needs to be implemented in the extending class.');
	}

	render() {
		wl('Cannot render a Renderable directly. The render function needs to be implemented in the extending class.');
	}
}

