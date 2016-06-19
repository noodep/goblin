'use strict';

import Program from '../../../src/gl/program.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('webgl');

const simple = new Program({
	context: ctx,
	name: 'simple',
	path: '/test/shaders/'
});


simple.ready();
console.log(simple);
