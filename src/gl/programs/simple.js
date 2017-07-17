/**
 * @fileOverview Class representing a simple OpenGL ES program.
 *
 * @author Noodep
 * @version 0.03
 */

'use strict';

import Mat4 from '../../math/mat4.js';
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
		super(configuration);

		// Buffer for multiplying the projection and view matrices to avoid
		// allocation of new matrices every applyState().
		this._view_projection = new Mat4();
	}

	/**
	 * Applies the state of this program to the specified renderer.
	 */
	applyState(renderer, projection, view) {
		const c = renderer._context;

		this._view_projection.copy(projection).multiply(view);
		c.uniformMatrix4fv(this.getUniform('view_projection'),
				false, this._view_projection.matrix);
	}
}

