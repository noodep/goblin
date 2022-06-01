'use strict';

import TextUtils from '/src/text/text-utils.js';

const TEST_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 26, 32, 36, 40];

const TEST_FONTS = [
	'Menlo, monospace',
	'Times',
	'Arial',
	'Tahoma',
	'Georgia',
	'Courier',
	'Verdana',
	'serif',
	'sans-serif'
];

const TEST_GLYPHS = [
	TextUtils.GLYPH_SETS['basic'],
	TextUtils.GLYPH_SETS['basic+digits'],
];

document.addEventListener('DOMContentLoaded', (e) => {
	const body = document.querySelector('body');

	TEST_SIZES.forEach(size => {
		TEST_FONTS.forEach(font => {
			TEST_GLYPHS.forEach(glyph_set => {
				const atlas = TextUtils.createAtlas(glyph_set, size, font, 'black');
				console.log(atlas);
				atlas.texture.title = `${size} ${font}`;
				body.appendChild(atlas.texture);
			});
		});
	});

});



