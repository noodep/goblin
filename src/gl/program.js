'use strict';

const DEFAULT_SHADER_PATH = '/shaders/';

/**
 * Class representing an OpenGL ES program
 * @version 0.10
 */
export default class Program {

	/**
	 * Creates a shader program with the specified name.
	 * If no path is specified, the function will look for shaders
	 * in the folder {@code DEFAULT_SHADER_PATH/name/name.{vert|frag}}
	 * 
	 * @param {WebGLContext} context with which this program will be associated.
	 * @param {string} name of this program.
	 * @constructor
	 */
	constructor({context, name, path = DEFAULT_SHADER_PATH}) {
		this._context = context;
		this._name = name;
		this._path = path;
	}

	/**
	 * Return a promise that succeed when the program is loaded and ready to be used.
	 * @return {Promise} a promise that succeed when this program is ready.
	 */
	ready() {
		return Promise.all(
			this.createVertexShader(),
			this.createFragmentShader()
		);
	}
}
