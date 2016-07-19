'use strict';

import {Logger, DEFAULT_LOGGER as DL} from '../../../src/log.js';
import WebGLRenderer from '../../../src/gl/webgl-renderer.js';
import Program from '../../../src/gl/program.js';
import SimpleProgram from '../../../src/gl/programs/simple.js';
import Vec3 from '../../../src/math/vec3.js';
import Mat4 from '../../../src/math/mat4.js';
import Scene from '../../../src/3d/scene.js';
import Mesh3D from '../../../src/3d/mesh3d.js';

export default class WebGLRendererTest {

	static runAll() {
		console.log(`%c----- Testing src/gl/webgl-renderer.js -----`,'color:blue;');
		console.time('Perf');

		DL.level = Logger.LEVELS.NONE;

		// Fix issue with multiple instance not being possible.
		WebGLRendererTest.createTestInstance();

		// WebGLRendererTest.testScene();
		WebGLRendererTest.benchmarkMesh3D();
		// WebGLRendererTest.benchmarkStaticMesh3D();

		console.timeEnd('Perf');
		console.log(`%c---------------------------------------`,'color:blue;');
		console.log('\n');
	}

	static createTestInstance() {
		const body = document.querySelector('body');
		const canvas = document.createElement('canvas');
		canvas.width = body.clientWidth;
		canvas.height = body.clientHeight;
		body.appendChild(canvas);
		const renderer = new WebGLRenderer({ canvas: canvas });
		renderer.start();
		WebGLRendererTest.renderer = renderer;

	}

	static testScene() {
		const r = WebGLRendererTest.renderer;
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		scene.addCamera(new Mat4().perspective(45, r.aspectRatio(), 0.1, 100.0));

		const cube = new Mesh3D('cube', boxGeometry(0,0,0,1), 'simple');
		cube.translateZ(-5);
		scene.addChild(cube);

		r._context.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.useProgram('simple');
			r.addScene(scene);
		});
	}

	static benchmarkStaticMesh3D() {
		const r = WebGLRendererTest.renderer;
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		scene.addCamera(new Mat4().perspective(45, r.aspectRatio(), 0.1, 100.0));


		const NUM = 27;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const SCALE = 0.3 / SIZE;
		const OFFSET = 2.0 / 0.3 * SCALE;

		const BYTE_OFFSET = 6*2*3*3;
		const geometry = new Float32Array(NUM * BYTE_OFFSET);
		for(let i = 0 ; i < NUM ; i++) {
			// const cube = new Mesh3D('cube' + i, boxGeometry(), 'simple');
			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			geometry.set(boxGeometry(-1.0 + ix * OFFSET, -1.0 + iy * OFFSET, -1.0 + iz * OFFSET, SCALE), BYTE_OFFSET * i);
		}

		const cube = new Mesh3D('cube', geometry , 'simple');
		cube.translateZ(-3.0);
		scene.addChild(cube);
		scene.addUpdateListener((delta_t) => {
			cube.model.rotateX(delta_t / 10000);
			cube.model.rotateZ(delta_t / 10000);
		});


		r._context.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static benchmarkMesh3D() {
		const r = WebGLRendererTest.renderer;
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		scene.addCamera(new Mat4().perspective(45, r.aspectRatio(), 0.1, 100.0));

		const NUM = 27;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const SCALE = 0.3 / SIZE;
		const OFFSET = 2.0 / 0.3 * SCALE;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);

		const BYTE_OFFSET = 6*2*3*3;
		const geometry = new Float32Array(NUM * BYTE_OFFSET);
		for(let i = 0 ; i < NUM ; i++) {
			const cube = new Mesh3D('cube' + i, boxGeometry(0,0,0,1), 'simple');
			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			cube.translateX(-1.0 + ix * OFFSET);
			cube.translateY(-1.0 + iy * OFFSET);
			cube.translateZ(-1.0 + iz * OFFSET);
			cube.translateZ(-3.0);
			cube.model.scale(SCALE_VECTOR);

			scene.addChild(cube);
			scene.addUpdateListener((delta_t) => {
				cube.model.rotateX(delta_t / 10000);
				cube.model.rotateZ(delta_t / 10000);
			});
		}

		r._context.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}
}

function boxGeometry(ox, oy, oz, s) {
	const i = 1.0;
	const p0 = [ox + i * s, oy + i * s, oz + i * s];
	const p1 = [ox - i * s, oy + i * s, oz + i * s];
	const p2 = [ox - i * s, oy - i * s, oz + i * s];
	const p3 = [ox + i * s, oy - i * s, oz + i * s];
	const p4 = [ox + i * s, oy - i * s, oz - i * s];
	const p5 = [ox + i * s, oy + i * s, oz - i * s];
	const p6 = [ox - i * s, oy + i * s, oz - i * s];
	const p7 = [ox - i * s, oy - i * s, oz - i * s];

	// 6 face * 2 triangles by face * 3 points per triangle * 3 components by points
	const vertices = new Float32Array(6*2*3*3);

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

