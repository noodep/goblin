'use strict';

const DEFAULT_SHADER_PATH = '/shaders/';
const SHADER_EXTENSIONS = new Map();
	SHADER_EXTENSIONS.set(WebGLRenderingContext.VERTEX_SHADER, '.vert');
	SHADER_EXTENSIONS.set(WebGLRenderingContext.FRAGMENT_SHADER, '.frag');

const QUALIFYING_FUNCTION = new Map();
	QUALIFYING_FUNCTION.set(WebGLRenderingContext.ACTIVE_UNIFORMS, 'Uniform');
	QUALIFYING_FUNCTION.set(WebGLRenderingContext.ACTIVE_ATTRIBUTES, 'Attrib');

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
		if(!name)
			throw new Error('Name required for creating a program.');

		this._name = name;
		this._shaders = new Map();
		this._program = undefined;
		this._parameters = new Map();
		this._parameters.set(WebGLRenderingContext.ACTIVE_UNIFORMS, new Map());
		this._parameters.set(WebGLRenderingContext.ACTIVE_ATTRIBUTES, new Map());

		if(!path.endsWith('/'))
			path += '/';
		this._path = `${path}${name}/`;
	}

	/**
	 * Return a promise that succeed when the program is loaded and ready to be used.
	 * @return {Promise} a promise that succeed when this program is ready.
	 */
	ready() {
		const shaders = [
			this.createShader(WebGLRenderingContext.VERTEX_SHADER),
			this.createShader(WebGLRenderingContext.FRAGMENT_SHADER)
		];

		return Promise.all(shaders)
			.then(this.compileProgram.bind(this))
			.then(this.qualifyAll.bind(this));
	}

	createShader(type) {
		const file = this._path + this._name + SHADER_EXTENSIONS.get(type);
		const c = this._context;
		return fetch(file)
			.then(response => response.text())
			.then((body) => {
				const shader = c.createShader(type);
				c.shaderSource(shader, body);
				c.compileShader(shader);
				if(!c.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS))
					throw new Error("Error compiling shader: " + c.getShaderInfoLog(shader));
				this._shaders.set(type, shader);
				return shader;
			});
	}

	compileProgram(shaders) {
		const c = this._context;
		this._program = c.createProgram();
		shaders.forEach(shader => c.attachShader(this._program, shader));

		c.linkProgram(this._program);
		if(!c.getProgramParameter(this._program, WebGLRenderingContext.LINK_STATUS))
			throw new Error(`Unable to initialize the shader program : ${this._name}`);

		c.validateProgram(this._program);
		if(!c.getProgramParameter(this._program, WebGLRenderingContext.VALIDATE_STATUS))
			throw new Error(`Unable to validate the shader program : ${this._name}`);
	}

	qualifyAll() {
		const params = [
			this.qualify(WebGLRenderingContext.ACTIVE_UNIFORMS),
			this.qualify(WebGLRenderingContext.ACTIVE_ATTRIBUTES)
		];

		return Promise.all(params);
	}

	qualify(parameter) {
		const c = this._context;
		const num = c.getProgramParameter(this._program, parameter);
		const p_func = QUALIFYING_FUNCTION.get(parameter);
		const a_func = `getActive${p_func}`;
		const l_func = `get${p_func}Location`;

		for(let idx = 0 ; idx < num ; idx++) {
			const info = c[a_func](this._program, idx);
			const location = c[l_func](this._program, info.name);
			this._parameters.get(parameter).set(info.name, location);
			console.log(`Found ${p_func} : ${info.name} with index ${location}`);
		}
	}
}

