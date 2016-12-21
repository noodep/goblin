/**
 * @fileOverview Triangular box geometry generation.
 *
 * @author Noodep
 * @version 0.11
 */

import Vec3 from '../../math/vec3.js';
import BufferAttribute from '../../gl/buffer-attribute.js';
import Geometry from '../../gl/geometry/geometry.js';
import IndexedGeometry from '../../gl/geometry/indexed-geometry.js';

export default class Box {
	static generateBoxVertices(origin = new Vec3(), scale = Vec3.identity()) {
		const i = 1.0;
		return [
			[origin.x + i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z],
			[origin.x - i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z],
			[origin.x - i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z],
			[origin.x + i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z],
			[origin.x + i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z],
			[origin.x + i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z],
			[origin.x - i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z],
			[origin.x - i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z]
		];
	}

	static generateBoxIndices(index_offset = 0) {
		return [
			// Front
			0 + index_offset, 1 + index_offset, 2 + index_offset, 0 + index_offset, 2 + index_offset, 3 + index_offset,
			// Right
			0 + index_offset, 3 + index_offset, 4 + index_offset, 0 + index_offset, 4 + index_offset, 5 + index_offset,
			// Top
			0 + index_offset, 5 + index_offset, 6 + index_offset, 0 + index_offset, 6 + index_offset, 1 + index_offset,
			// Left
			1 + index_offset, 6 + index_offset, 7 + index_offset, 1 + index_offset, 7 + index_offset, 2 + index_offset,
			// Bottom
			7 + index_offset, 4 + index_offset, 3 + index_offset, 7 + index_offset, 3 + index_offset, 2 + index_offset,
			// Back
			4 + index_offset, 7 + index_offset, 6 + index_offset, 4 + index_offset, 6 + index_offset, 5 + index_offset
		];
	}

	static generateBoxMesh(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
		const vertices = Box.generateBoxVertices(origin, scale);
		// 6 faces * 2 triangles by face * 3 vertices per triangle * 3 components by vertex
		const data = new vertex_typed_array(6 * 2 * 3 * 3);
		const box = Box.generateBoxIndices();
		const stride = 3;
		let offset = 0;
		box.forEach(index => {
			data.set(vertices[index], stride * offset++);
		});
		return data;
	}

	static createBoxGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
		const data = Box.generateBoxMesh(origin, scale, vertex_typed_array);

		const geometry = new Geometry(data, data.length / 3, WebGLRenderingContext.TRIANGLES);
		geometry.addAttribute('position', new BufferAttribute(3));

		return geometry;
	}

	static createIndexedBoxGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
		// 8 vertices * 3 components by vertex
		const data = Box.generateBoxMesh(origin, scale, vertex_typed_array);
		const indices = new index_typed_array(Box.generateBoxIndices(offset));

		const geometry = new IndexedGeometry(indices, data, WebGLRenderingContext.TRIANGLES, index_type);
		geometry.addAttribute('position', new BufferAttribute(3));
		return geometry;
	}

	static createIndexedBoxGeometryWithNormals(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, index_type = WebGLRenderingContext.UNSIGNED_BYTE) {
		const vertices = Box.generateBoxVertices(origin, scale);
		// 6 faces * 2 triangles by face * 3 vertices per triangle * 6 components.
		// 6 components = 1 point per vertex * 3 components per point + 1 normal per vertex * 3 components per normal.
		const data = new vertex_typed_array(6 * 2 * 3 * 6);
		const box = Box.generateBoxIndices();
		const indices = new index_typed_array([
			0 , 1 , 2 , 0 , 2 , 3 ,
			4 , 5 , 6 , 4 , 6 , 7 ,
			8 , 9 , 10, 8 , 10, 11,
			12, 13, 14, 12, 14, 15,
			16, 17, 18, 16, 18, 19,
			20, 21, 22, 20, 22, 23
		]);
		const structure = [
			// Front
			{ vertices: [0,1,2,3], normal: [ 0.0, 0.0, 1.0] },
			// Right
			{ vertices: [0,3,4,5], normal: [ 1.0, 0.0, 0.0] },
			// Top
			{ vertices: [0,5,6,1], normal: [ 0.0, 1.0, 0.0] },
			// Left
			{ vertices: [1,6,7,2], normal: [-1.0, 0.0, 0.0] },
			// Bottom
			{ vertices: [7,4,3,2], normal: [ 0.0,-1.0, 0.0] },
			// Back
			{ vertices: [4,7,6,5], normal: [ 0.0, 0.0,-1.0] },
		];

		let offset = 0;
		structure.forEach(face => {
			face.vertices.forEach(vertex => {
				data.set(vertices[vertex], offset)
				offset += 3;
				data.set(face.normal, offset)
				offset += 3;
			});
		});

		const geometry = new IndexedGeometry(indices, data, WebGLRenderingContext.TRIANGLES, index_type);
		const stride = 6 * vertex_typed_array.BYTES_PER_ELEMENT;
		geometry.addAttribute('position', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 0, stride));
		geometry.addAttribute('normal', new BufferAttribute(3, WebGLRenderingContext.FLOAT, 3 * vertex_typed_array.BYTES_PER_ELEMENT, stride));
		return geometry;
	}
}

