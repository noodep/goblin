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
	 * @param {Object} configuration - This program configuration {@see Program}.
	 * @return {module:gl.programs.SimpleProgram} - The newly created SimpleProgram.
	 */
	constructor(configuration) {
		super(configuration)
	}

	/**
	 * Applies the state of this program to the specified renderer.
	 */
	applyState(renderer, projection, view) {
		const c = renderer._context;

		c.uniformMatrix4fv(this.getUniform('projection'), false, projection.matrix);
		c.uniformMatrix4fv(this.getUniform('view'), false, view.matrix);
	}
}

