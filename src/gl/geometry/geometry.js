/**
 * @fileOverview Geometry object containing data and it description.
 *
 * @author Noodep
 * @version 0.3
 */

'use strict';

import {UUIDv4} from '../../crypto/uuid.js';

export default class Geometry {

	constructor(buffer, size, rendering_type = WebGLRenderingContext.TRIANGLES) {
		this._attributes = new Map();
		this._vbo_id = UUIDv4();

		this._buffer = buffer;
		this._size = size;
		this._rendering_type = rendering_type;
	}

	get attributes() {
		return this._attributes;
	}

	get buffer() {
		return this._buffer;
	}

	get renderingType() {
		return this._rendering_type;
	}

	get byteLength() {
		return this._buffer.byteLength;
	}

	get size() {
		return this._size;
	}

	addAttribute(name, attribute) {
		if(this._attributes.has(name))
			throw new Error(`Attribute ${name} already exists in this geometry.`);

		this._attributes.set(name, attribute);
	}

	initializeContextBuffers(renderer) {
		renderer.createBuffer(
			this._vbo_id,
			this._buffer.byteLength,
			WebGLRenderingContext.ARRAY_BUFFER,
			WebGLRenderingContext.STATIC_DRAW
		);

		renderer.updateBufferData(this._vbo_id, this._buffer, 0, WebGLRenderingContext.ARRAY_BUFFER);
	}

	initializeVertexArrayProcedure(renderer) {
		const vao = renderer.createVertexArray();

		renderer.activateVertexArray(vao);
		renderer.activateBuffer(this._vbo_id);

		this._attributes.forEach((attribute, name) => {
			renderer.enableAttribute(name, attribute);
		});

		// Prevents procedure to get additional steps
		renderer.activateVertexArray(null);

		return vao;
	}

	render(renderer) {
		renderer._context.drawArrays(this._rendering_type, 0, this._size);
	}
}

