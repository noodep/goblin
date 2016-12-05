/**
 * @fileOverview Triangular box geometry generation.
 *
 * @author Noodep
 * @version 0.11
 */

import Vec3 from '../../math/vec3.js';
import IndexedGeometry from './indexed-geometry.js';

export function createBoxGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array) {
	const i = 1.0;
	const p0 = [origin.x + i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z];
	const p1 = [origin.x - i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z];
	const p2 = [origin.x - i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z];
	const p3 = [origin.x + i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z];
	const p4 = [origin.x + i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z];
	const p5 = [origin.x + i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z];
	const p6 = [origin.x - i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z];
	const p7 = [origin.x - i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z];

	// 6 faces * 2 triangles by face * 3 points per triangle * 3 components by points
	const vertices = new vertex_typed_array(6*2*3*3);

	let idx = 0;
	const stride = 3*3;

	// Front
	vertices.set(Array.prototype.concat(p0,p1,p2), stride * idx++);
	vertices.set(Array.prototype.concat(p0,p2,p3), stride * idx++);
	// Back
	vertices.set(Array.prototype.concat(p4,p5,p6), stride * idx++);
	vertices.set(Array.prototype.concat(p4,p6,p7), stride * idx++);
	// Left
	vertices.set(Array.prototype.concat(p1,p6,p7), stride * idx++);
	vertices.set(Array.prototype.concat(p1,p7,p2), stride * idx++);
	// Right
	vertices.set(Array.prototype.concat(p0,p3,p4), stride * idx++);
	vertices.set(Array.prototype.concat(p0,p4,p5), stride * idx++);
	// Top
	vertices.set(Array.prototype.concat(p0,p5,p6), stride * idx++);
	vertices.set(Array.prototype.concat(p0,p6,p1), stride * idx++);
	// Bottom
	vertices.set(Array.prototype.concat(p3,p2,p7), stride * idx++);
	vertices.set(Array.prototype.concat(p3,p7,p4), stride * idx++);

	return vertices;
}

export function createIndexedBoxGeometry(origin = new Vec3(), scale = Vec3.identity(), vertex_typed_array = Float32Array, index_typed_array = Uint8Array, type = WebGLRenderingContext.UNSIGNED_BYTE, index_offset = 0) {
	const i = 1.0;

	// 8 vertices * 3 components by vertex
	const vertices = new vertex_typed_array([
		origin.x + i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z,
		origin.x - i * scale.x, origin.y + i * scale.y, origin.z + i * scale.z,
		origin.x - i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z,
		origin.x + i * scale.x, origin.y - i * scale.y, origin.z + i * scale.z,
		origin.x + i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z,
		origin.x + i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z,
		origin.x - i * scale.x, origin.y + i * scale.y, origin.z - i * scale.z,
		origin.x - i * scale.x, origin.y - i * scale.y, origin.z - i * scale.z
	]);

	const indices = new index_typed_array([
		0 + index_offset, 1 + index_offset, 2 + index_offset, 0 + index_offset, 2 + index_offset, 3 + index_offset,
		0 + index_offset, 3 + index_offset, 4 + index_offset, 0 + index_offset, 4 + index_offset, 5 + index_offset,
		0 + index_offset, 5 + index_offset, 6 + index_offset, 0 + index_offset, 6 + index_offset, 1 + index_offset,
		1 + index_offset, 6 + index_offset, 7 + index_offset, 1 + index_offset, 7 + index_offset, 2 + index_offset,
		7 + index_offset, 4 + index_offset, 3 + index_offset, 7 + index_offset, 3 + index_offset, 2 + index_offset,
		4 + index_offset, 7 + index_offset, 6 + index_offset, 4 + index_offset, 6 + index_offset, 5 + index_offset
	]);

	return new IndexedGeometry(indices, vertices, WebGLRenderingContext.UNSIGNED_BYTE);
}
