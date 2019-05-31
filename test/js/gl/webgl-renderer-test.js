/**
 * @file Test suite for webgl rendering.
 *
 * @author Noodep
 * @version 0.47
 */

import { Logger, DEFAULT_LOGGER as DL } from '/src/util/log.js';
import WebGLRenderer from '/src/gl/webgl-renderer.js';
import SimpleProgram from '/src/gl/programs/simple.js';
import SamplerProgram from '/src/gl/programs/sampler.js';
import Geometry from '/src/gl/geometry/geometry.js';
import IndexedGeometry from '/src/gl/geometry/indexed-geometry.js';
import BufferAttribute from '/src/gl/buffer-attribute.js';
import Vec3 from '/src/math/vec3.js';
import Quat from '/src/math/quat.js';
import Scene from '/src/3d/scene.js';
import Renderable from '/src/gl/renderable.js';
import Camera from '/src/3d/camera/camera.js';
import OrbitControl from '/src/3d/control/orbit.js';

import Box from '/src/3d/geometry/box.js';
import Icosahedron from '/src/3d/geometry/icosahedron.js';
import Plane from '/src/3d/geometry/plane.js';
import TextUtils from '/src/text/text-utils.js';

export default class WebGLRendererTest {

	static runAll() {
		console.log(`%c----- Testing /src/gl/webgl-renderer.js -----`,'color:teal;');
		console.time('Perf');

		DL.level = Logger.LEVELS.NONE;

		WebGLRendererTest.testScene();
		WebGLRendererTest.testObjectRotation();
		WebGLRendererTest.testCameraPose();
		WebGLRendererTest.benchmarkMesh();
		WebGLRendererTest.benchmarkStaticMesh();
		WebGLRendererTest.benchmarkStaticIndexedMesh();
		WebGLRendererTest.testIndexedGeometryWithNormals();
		WebGLRendererTest.testIndexedColoredGeometryOutline();
		WebGLRendererTest.testIndexedColoredGeometryWithNormals();
		WebGLRendererTest.sceneModification();
		WebGLRendererTest.textDisplay();
		WebGLRendererTest.testIcosahedron();

		console.timeEnd('Perf');
		console.log(`%c---------------------------------------`,'color:teal;');
		console.log('\n');
	}

	static createWebGLContext(id) {
		return WebGLRendererTest.createWebGL2TestInstance(id);
	}

	static createWebGLTestInstance(id) {
		const body = document.querySelector('body');
		const canvas = document.createElement('canvas');
		canvas.id = id;
		canvas.width = body.clientWidth;
		canvas.height = body.clientHeight;
		body.appendChild(canvas);
		const renderer = new WebGLRenderer({ canvas: canvas });
		renderer.start();
		return renderer;
	}

	static createWebGL2TestInstance(id) {
		const body = document.querySelector('body');
		const canvas = document.createElement('canvas');
		canvas.id = id;
		body.appendChild(canvas);
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		const renderer = new WebGLRenderer({
			canvas: canvas,
			context_type: 'webgl2',
			webgl_options: {
				antialias: true
			}
		});
		renderer.start();
		return renderer;
	}

	static testScene() {
		const r = WebGLRendererTest.createWebGLContext('testScene');
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();

		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		scene.addCamera(camera);

		const cube = Renderable.create({
			id: name,
			geometry: Box.createBoxGeometry(),
			program: 'simple',
		});
		scene.addChild(cube);

		scene.addListener('update', (delta_t) => {
			cube.rotateX(delta_t / 2000.0);
			cube.rotateY(delta_t / 1000.0);
		});

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static testObjectRotation() {
		const r = WebGLRendererTest.createWebGLContext('testObjectRotation');
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0,0.0,20.0));
		scene.addCamera(camera);

		const cubes = [];
		let y_offset = 4.0;
		let x_offset = -8.0;
		for(let axis_idx = 0; axis_idx < 3; axis_idx++) {
			cubes[axis_idx] = [];
			for(let rotation_type_idx = 0; rotation_type_idx < 5; rotation_type_idx++) {
				const cube = Renderable.create({
					id: `cube_${axis_idx}_${rotation_type_idx}`,
					origin: Vec3.from([x_offset, y_offset, 0.0]),
					geometry: Box.createBoxGeometry(),
					program: 'simple',
				});
				cubes[axis_idx][rotation_type_idx] = cube;
				scene.addChild(cube);
				x_offset += 4.0;
			}
			y_offset -= 4.0;
			x_offset = -8.0;
		}

		const AXIS = [new Vec3(1.0, 0.0, 0.0), new Vec3(0.0, 1.0, 0.0), new Vec3(0.0, 0.0, 1.0)];
		const CUBE_ORIENTATIONS = [new Quat(), new Quat(), new Quat()];
		const ROTATION_FUNC = ['X', 'Y', 'Z'];

		let angle = 0;

		scene.addListener('update', (delta_t) => {
			const SPEED = 1000.0;
			angle += delta_t / SPEED;

			for(let axis_idx = 0; axis_idx < 3; axis_idx++) {
				let cube = undefined;
				CUBE_ORIENTATIONS[axis_idx].fromAxisRotation(angle, AXIS[axis_idx]);

				// First rotation type
				cube = cubes[axis_idx][0]
				cube.orientation = CUBE_ORIENTATIONS[axis_idx];

				// Second rotation type
				cube = cubes[axis_idx][1]
				cube.localModel[`setRotation${ROTATION_FUNC[axis_idx]}`](angle);
				cube.localModel.translation = cube.origin;
				cube._computeWorldModel();

				// Third rotation type
				cube = cubes[axis_idx][2]
				cube.localModel.setFromAxisRotation(angle, AXIS[axis_idx]);
				cube.localModel.translation = cube.origin;
				cube._computeWorldModel();

				// Fourth rotation type
				cube = cubes[axis_idx][3]
				cube.rotate(delta_t / SPEED, AXIS[axis_idx]);

				// Fourth rotation type
				cube = cubes[axis_idx][4]
				cube[`rotate${ROTATION_FUNC[axis_idx]}`](delta_t / SPEED);
			}
		});

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static testCameraPose() {
		const r = WebGLRendererTest.createWebGLContext('testCameraPose');
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		scene.addCamera(camera);

		const cube = Renderable.create({
			id: 'cube',
			geometry: Box.createBoxGeometry(),
			program: 'simple',
		});
		scene.addChild(cube);

		// Camera pose update
		const z_axis = new Vec3(0.0, 0.0, 1.0);
		const camera_orientation = new Quat();
		let angle = 0;

		scene.addListener('update', (delta_t) => {
			angle += delta_t / 10000;
			camera_orientation.fromAxisRotation(angle, z_axis);
			camera.setOrientation(camera_orientation);
			camera.setPosition(new Vec3(0.0, 0.0, 3.0));
		});

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static benchmarkMesh() {
		const r = WebGLRendererTest.createWebGLContext('benchmarkMesh');
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene('main-scene');
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0, 0.0, 6.0));
		scene.addCamera(camera);

		const control = new OrbitControl(camera, {element: r._canvas});

		const NUM = Math.pow(8, 3);
		const WIDTH = 2.0;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const OFFSET = WIDTH / (SIZE + 1);
		const SCALE = 0.25 * OFFSET;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);

		for(let i = 0 ; i < NUM ; i++) {
			const cube = Renderable.create({
				id: `cube${i}`,
				geometry: Box.createBoxGeometry(),
				program: 'simple',
			});

			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			cube.translateX(-1.0 + (ix + 1) * OFFSET);
			cube.translateY(-1.0 + (iy + 1) * OFFSET);
			cube.translateZ(-1.0 + (iz + 1) * OFFSET);
			cube.scale(SCALE_VECTOR);

			scene.addListener('update', (delta_t) => {
				cube.rotateX(delta_t / 10000);
				cube.rotateZ(delta_t / 10000);
			});
			scene.addChild(cube);
		}

		scene.addListener('update', (delta_t) => {
			scene.rotateX(delta_t / 20000);
			scene.rotateZ(delta_t / 30000);
		});

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static benchmarkStaticMesh() {
		const r = WebGLRendererTest.createWebGLContext('benchmarkStaticMesh');
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		scene.addCamera(camera);
		const control = new OrbitControl(camera, {element: r._canvas});

		const NUM = Math.pow(16, 3);
		const WIDTH = 2.0;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const OFFSET = WIDTH / (SIZE + 1);
		const SCALE = 0.25 * OFFSET;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);

		const BYTE_OFFSET = 6*2*3*3;
		const buffer = new Float32Array(NUM * BYTE_OFFSET);
		const box_origin = new Vec3();
		for(let i = 0 ; i < NUM ; i++) {
			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			box_origin.x = -1.0 + (ix + 1) * OFFSET;
			box_origin.y = -1.0 + (iy + 1) * OFFSET;
			box_origin.z = -1.0 + (iz + 1) * OFFSET;
			buffer.set(Box.generateBoxMesh(box_origin, SCALE_VECTOR), BYTE_OFFSET * i);
		}

		const geometry = new Geometry(buffer, buffer.length / 3, WebGLRenderingContext.TRIANGLES);
		geometry.addAttribute('position', new BufferAttribute(3));

		const cube = Renderable.create({
			id: 'cube',
			geometry: geometry,
			program: 'simple',
		});

		scene.addChild(cube);
		scene.addListener('update', (delta_t) => {
			cube.rotateX(delta_t / 10000);
			cube.rotateZ(delta_t / 10000);
		});

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static benchmarkStaticIndexedMesh() {
		const r = WebGLRendererTest.createWebGLContext('benchmarkStaticIndexedMesh');
		const simple_p = r.createProgram('simple', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		scene.addCamera(camera);
		const control = new OrbitControl(camera, {element: r._canvas});

		const NUM = Math.pow(16, 3);
		const WIDTH = 2.0;
		const SIZE = Math.floor(Math.cbrt(NUM));
		const OFFSET = WIDTH / (SIZE + 1);
		const SCALE = 0.25 * OFFSET;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);

		const vertices = new Float32Array(NUM * 8 * 3);
		const indices = new Uint32Array(NUM * 36);
		const box_origin = new Vec3();
		for(let i = 0 ; i < NUM ; i++) {
			const ix = (i%SIZE);
			const iy = Math.floor(i / (SIZE*SIZE));
			const iz = Math.floor(i % (SIZE*SIZE) / SIZE);

			box_origin.x = -1.0 + (ix + 1) * OFFSET;
			box_origin.y = -1.0 + (iy + 1) * OFFSET;
			box_origin.z = -1.0 + (iz + 1) * OFFSET;
			const local_mesh = Box.generateBoxVertices(box_origin, SCALE_VECTOR);
			for(let vertex_idx = local_mesh.length - 1 ; vertex_idx >= 0 ; vertex_idx--) {
				vertices.set(local_mesh[vertex_idx], 8*3*i + vertex_idx*3);
			}
			const local_indices = Box.generateBoxIndices(i*8);
			indices.set(local_indices, 36*i);
		}

		const indexed_geometry = new IndexedGeometry(indices, vertices, WebGLRenderingContext.TRIANGLES, WebGLRenderingContext.UNSIGNED_INT);
		indexed_geometry.addAttribute('position', new BufferAttribute(3));
		const cubes = Renderable.create({
			id: 'cubes',
			geometry: indexed_geometry,
			program: 'simple',
		});

		scene.addChild(cubes);

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static testIndexedColoredGeometryOutline() {
		const r = WebGLRendererTest.createWebGLContext('testIndexedColoredGeometryOutline');
		const light_p = r.createProgram('color', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		scene.addCamera(camera);
		const control = new OrbitControl(camera, {element: r._canvas});
		camera.setPosition(new Vec3(0.0, 0.0, 2.0));


		const NUM = Math.pow(4, 3);
		const SIZE = 5.0;
		const SCALE = Math.sqrt(SIZE);

		for(let i = 0 ; i < NUM ; i++) {
			const cube = Renderable.create({
				id: `cube_${i}`,
				origin: Vec3.random().add(new Vec3(-0.5, -0.5, -0.5)).scale(SIZE),
				scale: Vec3.random().scale(1 / SIZE),
				geometry: Box.createIndexedColoredBoxOutlineGeometry(),
				program: 'color',
			});

			scene.addChild(cube);
		}

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		light_p.ready().then((e) => {
			r.addScene(scene);
		});
	}
	static testIndexedGeometryWithNormals() {
		const r = WebGLRendererTest.createWebGLContext('testIndexedGeometryWithNormals');
		const light_p = r.createProgram('light', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		scene.addCamera(camera);
		const control = new OrbitControl(camera, {element: r._canvas});
		camera.setPosition(new Vec3(0.0, 0.0, 2.0));


		const NUM = Math.pow(4, 3);
		const SIZE = 5.0;
		const SCALE = Math.sqrt(SIZE);

		for(let i = 0 ; i < NUM ; i++) {
			const cube = Renderable.create({
				id: `cube_${i}`,
				origin: Vec3.random().add(new Vec3(-1, -0.5, -0.5)).scale(SIZE),
				scale: Vec3.random().scale(1 / SIZE),
				geometry: Box.createIndexedBoxGeometryWithNormals(),
				program: 'light',
			});

			const plane = Renderable.create({
				id: `plane_${i}`,
				origin: Vec3.random().add(new Vec3(0, -0.5, -0.5)).scale(SIZE),
				scale: Vec3.random().scale(1 / SIZE),
				geometry: Plane.createIndexedPlaneGeometryWithNormals(),
				program: 'light',
			});

			scene.addChild(cube);
			scene.addChild(plane);
		}

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		light_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static testIndexedColoredGeometryWithNormals() {
		const r = WebGLRendererTest.createWebGLContext('testIndexedColoredGeometryWithNormals');
		const light_p = r.createProgram('light', '/test/shaders/', SimpleProgram);
		const scene = new Scene();
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		scene.addCamera(camera);
		const control = new OrbitControl(camera, {element: r._canvas});
		camera.setPosition(new Vec3(0.0, 0.0, 2.0));


		const NUM = Math.pow(4, 3);
		const SIZE = 5.0;
		const SCALE = Math.sqrt(SIZE);

		for(let i = 0 ; i < NUM ; i++) {
			const cube = Renderable.create({
				id: `cube_${i}`,
				origin: Vec3.random().add(new Vec3(-0.5, -0.5, -0.5)).scale(SIZE),
				scale: Vec3.random().scale(1 / SIZE),
				geometry: Box.createIndexedColoredBoxGeometryWithNormals(Vec3.random()),
				program: 'light',
			});

			scene.addChild(cube);
		}

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];
		r.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		light_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static sceneModification() {
		const r = WebGLRendererTest.createWebGLContext('sceneModification');
		const simple_p = r.createProgram('color', '/test/shaders/', SimpleProgram);
		const scene = new Scene('main-scene');
		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0, 0.0, 6.0));
		scene.addCamera(camera);
		const control = new OrbitControl(camera, {element: r._canvas});

		const SCALE = 0.01;
		const SCALE_VECTOR = new Vec3(SCALE, SCALE, SCALE);
		const BYTE_OFFSET = 6*2*3*3;

		const sun = Renderable.create({
			id: 'sun',
			geometry: Box.createIndexedColoredBoxGeometry(new Vec3(0.99, 0.72, 0.07), new Vec3(), SCALE_VECTOR),
			program: 'color',
		});

		scene.addChild(sun);
		scene.addListener('update', (delta_t) => {
			sun.rotateZ(delta_t / 20000);
		});

		const createRandomBox = (parent, dist, create) => {
			const color = Vec3.random();

			const cube = Renderable.create({
				id: `cube${Math.random()}`,
				geometry: Box.createIndexedColoredBoxGeometry(color, new Vec3(), SCALE_VECTOR),
				program: 'color',
			});

			cube.translateX(Math.random() * dist - dist / 2.0);
			scene.addListener('update', (delta_t) => {
				cube.rotateZ(delta_t / 5000 * dist);
			});
			parent.addChild(cube);

			if(create > 0.4)
				createRandomBox(cube, dist/3, create / 2);

			return cube;
		}

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];

		simple_p.ready().then((e) => {
			r.addScene(scene);

			// Repeatedly add and then remove boxes orbiting the sun
			setInterval(() => {
				var random_box = createRandomBox(sun, 1 + Math.random() * 3, Math.random());
				setTimeout(() => {
					sun.removeChild(random_box);
					random_box.destroy();
				}, Math.random() * 4000);
			}, Math.random() * 4000);
		});
	}

	static textDisplay() {
		const r = WebGLRendererTest.createWebGLContext('textDisplay')
		const c = r._context;
		const sampler = r.createProgram('sampler', '/test/shaders/', SamplerProgram, {sampler_unit: 0});

		const scene = new Scene();

		const camera = new Camera({aspect_ratio: r.aspectRatio});
		scene.addCamera(camera);

		const control = new OrbitControl(camera, {element: r._canvas});
		camera.setPosition(new Vec3(0.0, 0.0, 2.0));

		const atlas = TextUtils.createAtlas(TextUtils.GLYPH_SETS['basic+digits'], 64, 'monospace');

		const texture = c.createTexture();
		c.activeTexture(WebGLRenderingContext.TEXTURE0);
		c.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture);
		c.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.LINEAR);
		c.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR_MIPMAP_NEAREST);
		c.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, true);
		c.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGBA, atlas.texture.width, atlas.texture.height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE, atlas.texture);
		c.generateMipmap(WebGLRenderingContext.TEXTURE_2D);

		const string = '!"#$%&\'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNOPQRSTUVWXYZ [\\]^_` abcdefghijklmnopqrstuvwxyz';
		const text_geometry = TextUtils.createTextGeometry(string, atlas);
		const text_width = TextUtils.getTextWidth(string, atlas);

		const hello_world = Renderable.create({
			id: 'hello-world',
			origin: new Vec3(-text_width / 2.0, 0.0, 0.0),
			orientation: Quat.fromAxisRotation(-Math.PI / 2.0, Vec3.X_AXIS),
			geometry: text_geometry,
			program: 'sampler',
		});
		scene.addChild(hello_world);

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.enable(WebGLRenderingContext.BLEND);
		c.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
		r.background = [0.1, 0.2, 0.3, 1.0];

		sampler.ready().then((e) => {
			r.addScene(scene);
		});
	}

	static testIcosahedron() {
		const r = WebGLRendererTest.createWebGLContext('testIcosahedron');
		const simple_p = r.createProgram('color', '/test/shaders/', SimpleProgram);
		const scene = new Scene();

		const camera = new Camera({aspect_ratio: r.aspectRatio});
		camera.setPosition(new Vec3(0.0,0.0,3.0));
		const control = new OrbitControl(camera, {element: r._canvas});
		scene.addCamera(camera);

		const icosahedron = Renderable.create({
			id: name,
			geometry: Icosahedron.createIndexedColoredIcosahedronOutlineGeometry(),
			program: 'color',
		});
		scene.addChild(icosahedron);

		scene.addListener('update', (delta_t) => {
			icosahedron.rotateX(delta_t / 2000.0);
			icosahedron.rotateY(delta_t / 1000.0);
		});

		r.enable(WebGLRenderingContext.DEPTH_TEST);
		r.background = [0.1, 0.2, 0.3, 1.0];

		simple_p.ready().then((e) => {
			r.addScene(scene);
		});
	}

}

