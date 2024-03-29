/**
 * @file class representing a simple webgl sampler program
 *
 * @author noodep
 * @version 0.07
 */

import Mat4 from '../../math/mat4.js';
import Program from '../program.js';

export default class SamplerProgram extends Program {

	/**
	 * @constructor
	 * @memberOf module:gl.programs
	 * @alias SamplerProgram
	 *
	 * @param {Object} configuration - This program configuration {@see Program}.
	 * @return {module:gl.programs.SamplerProgram} - The newly created SamplerProgram.
	 */
	constructor(configuration, options) {
		super(configuration);
		this._sampler_unit = options.sampler_unit;

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
		c.uniformMatrix4fv(this.getUniform('view_projection'), false, this._view_projection.matrix);
		c.uniform1i(this.getUniform('sampler'), this._sampler_unit);
	}

}
