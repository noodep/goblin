/**
 * @fileOverview IndexedMesh3D class that represent a indexed Renderable drawn with draw elements.
 * @author Noodep
 * @version 0.03
 */
'use strict';

import {UUIDv4} from '../crypto/uuid.js';
import Renderable from './renderable.js';

export default class IndexedMesh3D extends Renderable {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias IndexedMesh3D
	 *
	 * @param {String} mesh_id - This object id.
	 * @param {IndexedGeometry} indexed-geometry - This object triangular geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @return {module:3d.Mesh3D} - The newly created Mesh3D.
	 */
	constructor(mesh_id, geometry, program_name) {
		super(mesh_id, geometry.vertices, program_name);
		this._index_buffer_id = UUIDv4();
		this._index_type = geometry.type;
		this._indices = geometry.indices;
	}

	initialize(renderer) {
		// debugger;
		super.initialize(renderer);

		renderer.createBufferObject(
			this._index_buffer_id,
			this._indices.byteLength,
			WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
			WebGLRenderingContext.STATIC_DRAW
		);

		renderer.updateBufferObjectData(this._index_buffer_id, this._indices, 0, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
	}

	setShaderState(renderer) {
		const p = renderer.getActiveProgram();
		const c = renderer._context;
		c.uniformMatrix4fv(p.getUniform('u_model_mat'), false, this.worldModel.matrix);
		renderer.activateBufferObject(this._buffer_id, WebGLRenderingContext.ARRAY_BUFFER);
		renderer.activateBufferObject(this._index_buffer_id, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);

		const avp = p.getAttribute('a_vertex_position');
		c.vertexAttribPointer(avp, 3, WebGLRenderingContext.FLOAT, false, 0, 0);
		c.enableVertexAttribArray(avp);
	}

	render(renderer) {
		var l = this._indices.length;
		renderer._context.drawElements(WebGLRenderingContext.TRIANGLES, l, this._index_type, 0);
	}
}

