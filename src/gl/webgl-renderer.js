/**
 * Class representing a 3D renderer that uses a WebGLRenderingContext.
 * @version 0.04
 */

'use strict';

import {dl, wl} from '../log.js';

export default class WebGLRenderer {

	/**
	 * @constructor
	 * @memberOf module:gl
	 * @alias WebGLRenderer
	 *
	 * Creates a WebGLRenderer that uses a WebGLRenderingContext as rendering support.
	 * 
	 * @param {HTMLCanvasElement} canvas - the canvas element to be used as context.
	 * @param {Object} webgl_options - options that will be passed as argument when trying to instanciate the WebGLRenderingContext.
	 * @return {module:gl.WebGLRenderer} - The newly created renderer.
	 */
	constructor({ canvas, webgl_options } = {}) {
		dl('Creating WebGlRenderer.')
		this._canvas = canvas;
		this._scenes = new Map();
		this._context = undefined;
		this._animation_frame = undefined;

		this._initContext(webgl_options);
	}

	/**
	 * Sets this renderer background color as specified by the rgba array.
	 *
	 * @param {Array} rgba - An array containing red green blue alpha values (between 0.0 and 1.0).
	 */
	set background(rgba) {
		dl(`Setting background color to ${rgba}`);
		this._context.clearColor(rgba[0],rgba[1],rgba[2],rgba[3]);
	}

	/**
	 * Clears this renderer specified buffers.
	 */
	clear(buffers) {
		this._context.clear(buffers);
	}

	/**
	 * Adds a scene to this renderer unless a scene with the same id is already present.
	 *
	 * @return {Boolean} - true if the scene was successfully added, false otherwise.
	 */
	addScene(scene) {
		if(this._scenes.has(scene.id)) {
			wl(`Scene with id ${scene.id} is already present. The specified scene will not be added.\n` +
				`The existing scene needs to be removed before adding this one.`);
			return false;
		}

		this._scenes.set(scene.id, scene);

		return true;
	}

	/**
	 * Removes a scene from this renderer if it exists.
	 *
	 * @return {Boolean} - true if the scene was successfully removed, false otherwise.
	 */
	removeScene(scene) {
		if(this._scenes.has(scene.id)) {
			return this._scenes.delete(scene.id);
		}

		wl(`Scene with id ${scene.id} does not exists.`);
		return false;
	}

	/**
	 * Starts this renderer animation loop.
	 */
	start() {
		this._loop(0);
	}

	/**
	 * Initialize this renderer context with and instance of a WebGLRenderingContext.
	 *
	 * @throws {Error} - if unable to create a webgl context.
	 */
	_initContext(options = WebGLRenderer.DEFAULT_WEBGL_OPTIONS) {
		dl(`Creating WebGlRenderer context with options ${options}.`);
		this._context = this._canvas.getContext('webgl', options);

		if(!this._context)
			throw new Error('Unable to create webgl context.');
	}

	/**
	 * Execute one update and rendering pass.
	 * Then asks to be called again on the next available animationFrame.
	 */
	_loop(delta_t) {
		this._animation_frame = window.requestAnimationFrame(this._loop.bind(this));
		this.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);

		this._scenes.forEach((scene) => {
			scene.render(this._context);
		});
	}
}

WebGLRenderer.DEFAULT_WEBGL_OPTIONS = {
	alpha: false,
	premultipliedAlpha: false
};

