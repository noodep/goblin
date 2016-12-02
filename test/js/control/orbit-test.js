'use strict';

import {Logger, DEFAULT_LOGGER as DL} from 'src/util/log.js';
import WebGLRenderer from 'src/gl/webgl-renderer.js';
import SimpleProgram from 'src/gl/programs/simple.js';
import Vec3 from 'src/math/vec3.js';
import Scene from 'src/3d/scene.js';
import Mesh3D from 'src/3d/mesh3d.js';
import Camera from 'src/3d/camera/camera.js';
import OrbitControl from 'src/3d/control/orbit.js';

import createBoxGeometry from 'src/3d/geometry/box.js';

export default class OrbitTest {

	static runAll() {
		console.log(`%c----- Testing src/control/orbit.js -----`,'color:blue;');
		console.time('Perf');

		DL.level = Logger.LEVELS.NONE;

		// Fix issue with multiple instance not being possible.
		OrbitTest.createTestInstance();
		OrbitTest.testOrbitControl();

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
		OrbitTest.renderer = renderer;
	}

	static testOrbitControl() {
		const r = OrbitTest.renderer;
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();

		const camera = new Camera({aspect_ratio: r.aspectRatio()});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		scene.addCamera(camera);

		const control = new OrbitControl(camera);

		const NUM = Math.pow(4, 3);
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

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}
}

