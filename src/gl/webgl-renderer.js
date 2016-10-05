/**
 * Class representing a 3D renderer that uses a WebGLRenderingContext.
 * @version 0.06
 */

'use strict';

import {dl, wl} from '../util/log.js';
import {UUIDv4} from '../crypto/uuid.js';
import Program from  './program.js';

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

		this._active_program = undefined;
		this._programs = new Map();

		this._active_buffer_object = undefined;
		this._buffer_objects = new Map();

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

		scene.sceneAttached(this);
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
	 * Returns this renderer context's aspect ratio
	 */
	aspectRatio() {
		return this._context.drawingBufferWidth / this._context.drawingBufferHeight;
	}

	/**
	 * Creates (loads, compiles and links) a Program with the specified name.
	 *
	 * @return {Program} - The newly created program.
	 */
	createProgram(name, path, ProgramClass) {
		if(!ProgramClass || !(ProgramClass.prototype instanceof Program))
			throw new Error(`${ProgramClass} is unknown or does not extends Program.`);

		if(this._programs.has(name)) {
			wl(`Program ${name} already exists.`);
			return false;
		}

		const configuration = {
			context: this._context,
			name: name
		};

		if(path)
			configuration['path'] = path;

		const program = new ProgramClass(configuration);
		this._programs.set(name, program);

		return program;
	}

	/**
	 * Sets this context active program.
	 *
	 * @param {String} name - Name of the program to be used.
	 * @return {Boolean} - true if the program with the specified name exists and was activated, false otherwise.
	 */
	useProgram(name) {
		if(!this._programs.has(name)) {
			wl(`Program ${name} does not exists.`);
			return false;
		}

		if(this._active_program == name) {
			wl(`Program already active. Try minimizing program switching.`);
			return true;
		}

		const p = this._programs.get(name);
		this._active_program = name;
		this._context.useProgram(p.program);

		return true;
	}

	/**
	 * Gets this context current active program.
	 *
	 * @param {String} name - Name of the program to be returned.
	 * @return {Program} - the current active program or undefined if no program is in use.
	 */
	getActiveProgram() {
		if(!this._active_program) {
			wl(`There is no active program at the moment.`);
			return undefined;
		}

		return this._programs.get(this._active_program);
	}


	/**
	 * Creates a new buffer object with the specified id and allocates the underlying buffer object's storage.
	 *
	 * @param {String} id - id of the buffer object to be created.
	 * @param {GLsizeiptr} size - size of the buffer to allocate.
	 * @param {GLenum} [buffer_type=ARRAY_BUFFER] - type of buffer to create.
	 * @param {GLenum} [buffer_usage=STATIC_DRAW] - usage of the buffer.
	 * @return {Boolean} - true if the buffer was successfully created, false otherwise.
	 */
	createBufferObject(buffer_id, size, buffer_type = WebGLRenderingContext.ARRAY_BUFFER, buffer_usage = WebGLRenderingContext.STATIC_DRAW) {
		if(this._buffer_objects.has(buffer_id)) {
			wl(`The vertex buffer object with id ${buffer_id} already exists.`);
			return false;
		}

		const buffer_object = this._context.createBuffer();
		this._buffer_objects.set(buffer_id, buffer_object);
		this._context.bindBuffer(buffer_type, buffer_object);
		this._context.bufferData(buffer_type, size, buffer_usage);
		return buffer_id;
	}

	/**
	 * Delete the buffer object with the specified id if it exists.
	 *
	 * @return {Boolean} - true if the buffer object exists and was successfully deleted, false otherwise.
	 */
	deleteBufferObject(buffer_id) {
		if(!this._buffer_objects.has(buffer_id)) {
			wl(`The vertex buffer object with id ${buffer_id} does not exists`);
			return false;
		}

		return this._buffer_objects.delete(buffer_id);
	}

	/**
	 * Make the buffer object with the specified id active.
	 *
	 * @param {String} buffer_id - id of the buffer object to make active.
	 * @param {GLenum} buffer_type - type of buffer to bind.
	 * possible values are WebGLRenderingContext.ARRAY_BUFFER or WebGLRenderingContext.ELEMENT_ARRAY_BUFFER.
	 * @return {Boolean} - true if the buffer object with the specified exists and was activated, false otherwise.
	 */
	activateBufferObject(buffer_id, buffer_type = WebGLRenderingContext.ARRAY_BUFFER) {
		if(this._active_buffer_object == buffer_id) {
			wl(`Buffer with id ${buffer_id} already active.`);
			return false;
		}

		const buffer_object = this._buffer_objects.get(buffer_id);

		if(!buffer_object) {
			wl(`The vertex buffer object with id ${buffer_id} does not exists`);
			return false;
		}

		this._context.bindBuffer(buffer_type, buffer_object);
		return true;
	}

	/**
	 * Updates data of the buffer object with the specified id.
	 *
	 * @param {String} buffer_id - id of the buffer object to make active.
	 * @param {ArrayBuffer} buffer_data - new data to be copied.
	 * @param {GLintptr} [offset=0] - offset indicating where to start the data replacement.
	 * @param {GLenum} [buffer_type=ARRAY_BUFFER] - type of buffer to update.
	 */
	updateBufferObjectData(buffer_id, buffer_data, offset = 0, buffer_type = WebGLRenderingContext.ARRAY_BUFFER) {
		this.activateBufferObject(buffer_id, buffer_type);
		this._context.bufferSubData(buffer_type, offset, buffer_data);
	}

	/**
	 * Starts this renderer animation loop.
	 */
	start() {
		let previous_timestamp = 0;

		/**
		 * Execute one update and rendering pass.
		 * Then asks to be called again on the next available animationFrame.
		 */
		const __loop = (current_timestamp) => {
			const delta_t = current_timestamp - previous_timestamp;
			previous_timestamp = current_timestamp;

			this._animation_frame = window.requestAnimationFrame(__loop);
			this.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
			this._scenes.forEach((scene) => {
				scene.update(delta_t);
				scene.render(this);
			});
		};

		__loop(0);
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
}

WebGLRenderer.DEFAULT_WEBGL_OPTIONS = {
	alpha: false,
	premultipliedAlpha: false
};

