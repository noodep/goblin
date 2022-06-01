'use strict';

import LogTest from './util/log-test.js';
import Vec2Test from './math/vec2-test.js';
import Vec3Test from './math/vec3-test.js';
import Vec4Test from './math/vec4-test.js';
import Mat4Test from './math/mat4-test.js';
import ProgramTest from './gl/program-test.js';
import WebGLRendererTest from './gl/webgl-renderer-test.js';
import Object3DTest from './3d/object3d-test.js';

document.addEventListener('DOMContentLoaded', (e) => {
	LogTest.runAll();
	Vec2Test.runAll();
	Vec3Test.runAll();
	Vec4Test.runAll();
	Mat4Test.runAll();
	ProgramTest.runAll();
	WebGLRendererTest.runAll();
	Object3DTest.runAll();
});

