/**
 * @fileOverview Class representing a simple OpenGL ES program with a sampler.
 *
 * @author Noodep
 * @version 0.02
 */

'use strict';

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
		super(configuration)
		this._sampler_unit = options.sampler_unit;
	}

	/**
	 * Applies the state of this program to the specified renderer.
	 */
	applyState(renderer, projection, view) {
		const c = renderer._context;

		c.uniformMatrix4fv(this.getUniform('projection'), false, projection.matrix);
		c.uniformMatrix4fv(this.getUniform('view'), false, view.matrix);
		c.uniform1i(this.getUniform('sampler'), this._sampler_unit);
	}
}

