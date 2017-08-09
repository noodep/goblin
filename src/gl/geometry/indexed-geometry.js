/**
 * @fileOverview Geometry object containing data and its description.
 * This geometry is to be rendered with draw elements.
 *
 * @author Noodep
 * @version 0.3
 */

'use strict';

import Geometry from './geometry.js';
import {UUIDv4} from '../../crypto/uuid.js';

/**
 * Function to assign to the destroy property after the VBO and EBO are created.
 */
function _destroyBuffers(renderer) {
	renderer.deleteBuffer(this._vbo);
	renderer.deleteBuffer(this._ebo);
	renderer.deleteVertexArray(this._vao);
	this._vbo = null;
	this._ebo = null;
	this._vao = null;
	this.destroy = Geometry.prototype.destroy; // Reset to empty function
	this._initialized = false;
}

export default class IndexedGeometry extends Geometry {

	constructor(indices, buffer, rendering_type = WebGLRenderingContext.TRIANGLES, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		super(buffer, indices.length, rendering_type);
		this._ebo = null;
		this._indices = indices;
		this._index_type = index_type;
	}

	get indices() {
		return this._indices;
	}

	get indexType() {
		return this._index_type;
	}

	initialize(renderer) {
		super.initialize(renderer);

		this._ebo = renderer.createBuffer(
			this._indices.byteLength,
			WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
			WebGLRenderingContext.STATIC_DRAW
		);

		renderer.updateBufferData(this._ebo, this._indices, 0, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);

		renderer.activateVertexArray(this._vao);
		renderer.activateBuffer(this._ebo, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
		renderer.activateVertexArray(null);

		this.destroy = _destroyBuffers.bind(this, renderer);
	}

	render(renderer) {
		renderer._context.drawElements(this._rendering_type, this._size, this._index_type, 0);
	}
}

