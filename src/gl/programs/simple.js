/**
 * @fileOverview Class representing a simple OpenGL ES program
 * @author Noodep
 * @version 0.02
 */
'use strict';

import Program from '../program.js';

export default class SimpleProgram extends Program {

	/**
	 * @constructor
	 * @memberOf module:gl.programs
	 * @alias SimpleProgram
	 *
	 * @param {Object} options - This program options {@see Program}.
	 * @return {module:gl.programs.SimpleProgram} - The newly created SimpleProgram.
	 */
	constructor(options) {
		super(options)
	}

	/**
	 * Applies the state of this program to the specified renderer.
	 */
	applyState(renderer, projection, view) {
		const c = renderer._context;

		c.uniformMatrix4fv(this.getUniform('u_projection_mat'), false, projection.matrix);
		c.uniformMatrix4fv(this.getUniform('u_view_mat'), false, view.matrix);

		const avp = this.getAttribute('a_vertex_position');
		c.enableVertexAttribArray(avp);
		c.vertexAttribPointer(avp, 3, WebGLRenderingContext.FLOAT, false, 0, 0);
	}
}
