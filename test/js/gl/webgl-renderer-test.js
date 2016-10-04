'use strict';

import {Logger, DEFAULT_LOGGER as DL} from '../../../src/log.js';
import WebGLRenderer from '../../../src/gl/webgl-renderer.js';
import Program from '../../../src/gl/program.js';
import SimpleProgram from '../../../src/gl/programs/simple.js';
import Vec3 from '../../../src/math/vec3.js';
import Mat4 from '../../../src/math/mat4.js';
import Quat from '../../../src/math/quat.js';
import Scene from '../../../src/3d/scene.js';
import Mesh3D from '../../../src/3d/mesh3d.js';
import Camera from '../../../src/3d/camera/camera.js';

import createBoxGeometry from '../../../src/3d/geometry/box.js';

export default class WebGLRendererTest {

	static runAll() {
		console.log(`%c----- Testing src/gl/webgl-renderer.js -----`,'color:blue;');
		console.time('Perf');

		DL.level = Logger.LEVELS.NONE;

		// Fix issue with multiple instance not being possible.
		WebGLRendererTest.createTestInstance();

		// WebGLRendererTest.testScene();
		WebGLRendererTest.testObjectRotation();
		// WebGLRendererTest.testCameraPose();
		// WebGLRendererTest.benchmarkStaticMesh3D();
		// WebGLRendererTest.benchmarkMesh3D();

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

		const camera = new Camera({aspect_ratio: r.aspectRatio()});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		scene.addCamera(camera);

		const cube = new Mesh3D('cube', createBoxGeometry(), 'simple');
		scene.addChild(cube);

		scene.addUpdateListener((delta_t) => {
			cube.model.rotateX(delta_t / 2000.0);
			cube.model.rotateY(delta_t / 1000.0);
		});

		r._context.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];

		simple_p.ready().then((e) => {
			r.useProgram('simple');
			r.addScene(scene);
		});
	}

	static testObjectRotation() {
		const r = WebGLRendererTest.renderer;
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio()});
		camera.setPosition(new Vec3(0.0,0.0,20.0));
		scene.addCamera(camera);


		const cube_x_1 = new Mesh3D('cube_x_1', createBoxGeometry(), 'simple');
		const cube_x_2 = new Mesh3D('cube_x_2', createBoxGeometry(), 'simple');
		const cube_x_3 = new Mesh3D('cube_x_3', createBoxGeometry(), 'simple');
		const cube_x_4 = new Mesh3D('cube_x_4', createBoxGeometry(), 'simple');
		const cube_x_5 = new Mesh3D('cube_x_5', createBoxGeometry(), 'simple');
		scene.addChild(cube_x_1);
		scene.addChild(cube_x_2);
		scene.addChild(cube_x_3);
		scene.addChild(cube_x_4);
		scene.addChild(cube_x_5);

		const cube_y_1 = new Mesh3D('cube_y_1', createBoxGeometry(), 'simple');
		const cube_y_2 = new Mesh3D('cube_y_2', createBoxGeometry(), 'simple');
		const cube_y_3 = new Mesh3D('cube_y_3', createBoxGeometry(), 'simple');
		const cube_y_4 = new Mesh3D('cube_y_4', createBoxGeometry(), 'simple');
		const cube_y_5 = new Mesh3D('cube_y_5', createBoxGeometry(), 'simple');
		scene.addChild(cube_y_1);
		scene.addChild(cube_y_2);
		scene.addChild(cube_y_3);
		scene.addChild(cube_y_4);
		scene.addChild(cube_y_5);

		const cube_z_1 = new Mesh3D('cube_z_1', createBoxGeometry(), 'simple');
		const cube_z_2 = new Mesh3D('cube_z_2', createBoxGeometry(), 'simple');
		const cube_z_3 = new Mesh3D('cube_z_3', createBoxGeometry(), 'simple');
		const cube_z_4 = new Mesh3D('cube_z_4', createBoxGeometry(), 'simple');
		const cube_z_5 = new Mesh3D('cube_z_5', createBoxGeometry(), 'simple');
		scene.addChild(cube_z_1);
		scene.addChild(cube_z_2);
		scene.addChild(cube_z_3);
		scene.addChild(cube_z_4);
		scene.addChild(cube_z_5);

		const X_AXIS = new Vec3(1.0, 0.0, 0.0);
		const Y_AXIS = new Vec3(0.0, 1.0, 0.0);
		const Z_AXIS = new Vec3(0.0, 0.0, 1.0);

		const cube_x_orientation = new Quat();
		const cube_y_orientation = new Quat();
		const cube_z_orientation = new Quat();

		let angle = 0;

		scene.addUpdateListener((delta_t) => {
			let y_offset = 4.0;
			let x_offset = -8.0;

			angle += delta_t / 1000.0;

			// X Rotations
			cube_x_orientation.fromAxisRotation(angle, X_AXIS);
			cube_x_1.model.setRotationFromQuaternion(cube_x_orientation);
			cube_x_1.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_x_2.model.setRotationX(angle);
			cube_x_2.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_x_3.model.setFromAxisRotation(angle, X_AXIS);
			cube_x_3.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_x_4.model.rotate(delta_t / 1000.0, X_AXIS);
			cube_x_4.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_x_5.model.rotateX(delta_t / 1000.0);
			cube_x_5.model.translation = new Vec3(x_offset, y_offset, 0.0);

			// Y Rotations
			y_offset -= 4.0;
			x_offset = -8.0;
			cube_y_orientation.fromAxisRotation(angle, Y_AXIS);
			cube_y_1.model.setRotationFromQuaternion(cube_y_orientation);
			cube_y_1.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_y_2.model.setRotationY(angle);
			cube_y_2.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_y_3.model.setFromAxisRotation(angle, Y_AXIS);
			cube_y_3.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_y_4.model.rotate(delta_t / 1000.0, Y_AXIS);
			cube_y_4.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_y_5.model.rotateY(delta_t / 1000.0);
			cube_y_5.model.translation = new Vec3(x_offset, y_offset, 0.0);

			// Y Rotations
			y_offset -= 4.0;
			x_offset = -8.0;
			cube_z_orientation.fromAxisRotation(angle, Z_AXIS);
			cube_z_1.model.setRotationFromQuaternion(cube_z_orientation);
			cube_z_1.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_z_2.model.setRotationZ(angle);
			cube_z_2.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_z_3.model.setFromAxisRotation(angle, Z_AXIS);
			cube_z_3.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_z_4.model.rotate(delta_t / 1000.0, Z_AXIS);
			cube_z_4.model.translation = new Vec3(x_offset, y_offset, 0.0);

			x_offset += 4.0;
			cube_z_5.model.rotateZ(delta_t / 1000.0);
			cube_z_5.model.translation = new Vec3(x_offset, y_offset, 0.0);

		});

		r._context.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.useProgram('simple');
			r.addScene(scene);
		});
	}

	static testCameraPose() {
		const r = WebGLRendererTest.renderer;
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio()});
		scene.addCamera(camera);

		const cube = new Mesh3D('cube', createBoxGeometry(), 'simple');
		scene.addChild(cube);

		// Camera pose update
		const z_axis = new Vec3(0.0, 0.0, 1.0);
		const camera_orientation = new Quat();
		let angle = 0;

		scene.addUpdateListener((delta_t) => {
			angle += delta_t / 10000;
			camera_orientation.fromAxisRotation(angle, z_axis);
			camera.setOrientation(camera_orientation);
			camera.setPosition(new Vec3(0.0, 0.0, 3.0));
		});

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
		const camera = new Camera({aspect_ratio: r.aspectRatio()});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		scene.addCamera(camera);

		const NUM = Math.pow(64, 3);
		const WIDTH = 2.0;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const OFFSET = WIDTH / (SIZE + 1);
		const SCALE = 0.25 * OFFSET;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);

		const BYTE_OFFSET = 6*2*3*3;
		const geometry = new Float32Array(NUM * BYTE_OFFSET);
		const box_origin = new Vec3();
		for(let i = 0 ; i < NUM ; i++) {
			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			box_origin.x = -1.0 + (ix + 1) * OFFSET;
			box_origin.y = -1.0 + (iy + 1) * OFFSET;
			box_origin.z = -1.0 + (iz + 1) * OFFSET;
			geometry.set(createBoxGeometry(box_origin, SCALE_VECTOR), BYTE_OFFSET * i);
		}

		const cube = new Mesh3D('cube', geometry , 'simple');
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
		const camera = new Camera({aspect_ratio: r.aspectRatio()});
		camera.setPosition(new Vec3(0.0, 0.0, 3.0));
		scene.addCamera(camera);

		const NUM = Math.pow(8, 3);
		const WIDTH = 2.0;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const OFFSET = WIDTH / (SIZE + 1);
		const SCALE = 0.25 * OFFSET;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);

		const BYTE_OFFSET = 6*2*3*3;
		const geometry = new Float32Array(NUM * BYTE_OFFSET);
		for(let i = 0 ; i < NUM ; i++) {
			const cube = new Mesh3D('cube' + i, createBoxGeometry(), 'simple');
			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			cube.translateX(-1.0 + (ix + 1) * OFFSET);
			cube.translateY(-1.0 + (iy + 1) * OFFSET);
			cube.translateZ(-1.0 + (iz + 1) * OFFSET);
			cube.model.scale(SCALE_VECTOR);

			scene.addUpdateListener((delta_t) => {
				cube.model.rotateX(delta_t / 10000);
				cube.model.rotateZ(delta_t / 10000);
			});

			scene.addChild(cube);
		}

		r._context.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}
}
