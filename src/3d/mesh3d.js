/**
 * @fileOverview Mesh3D class that represent a Renderable with an underlying triangular mesh.
 * @author Noodep
 * @version 0.11
 */
'use strict';

import Renderable from '../gl/renderable.js';

export default class Mesh3D extends Renderable {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Mesh3D
	 *
	 * @param {String} mesh_id - This object id.
	 * @param {Array} geometry - This object triangular geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @return {module:3d.Mesh3D} - The newly created Mesh3D.
	 */
	constructor(mesh_id, geometry, program_name) {
		super(mesh_id, geometry, program_name);
	}

	setShaderState(renderer) {
		super.setShaderState(renderer);
		const p = renderer.getActiveProgram();
		const c = renderer._context;

		c.uniformMatrix4fv(p.getUniform('model'), false, this.worldModel.matrix);
	}

}

