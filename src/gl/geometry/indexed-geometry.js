/**
 * @fileOverview Geometry object containing data and its description.
 * This geometry is to be rendered with draw elements.
 *
 * @author Noodep
 * @version 0.1
 */

import {UUIDv4} from '../../crypto/uuid.js';
import Geometry from './geometry.js';

export default class IndexedGeometry extends Geometry {

	constructor(indices, buffer, rendering_type = WebGLRenderingContext.TRIANGLES, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		super(buffer, indices.length, rendering_type);
		this._ebo_id = UUIDv4();
		this._indices = indices;
		this._index_type = index_type;
	}

	get indices() {
		return this._indices;
	}

	get indexType() {
		return this._index_type;
	}

	initializeContextBuffers(renderer) {
		super.initializeContextBuffers(renderer);

		renderer.createBuffer(
			this._ebo_id,
			this._indices.byteLength,
			WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
			WebGLRenderingContext.STATIC_DRAW
		);

		renderer.updateBufferData(this._ebo_id, this._indices, 0, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
	}

	initializeVertexArrayProcedure(renderer) {
		const vao = super.initializeVertexArrayProcedure(renderer);

		renderer.activateVertexArray(vao);
		renderer.activateBuffer(this._ebo_id, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
		renderer.activateVertexArray(null);

		return vao;
	}

	render(renderer) {
		renderer._context.drawElements(this._rendering_type, this._size, this._index_type, 0);
	}
}

