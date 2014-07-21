(function(window, document, undefined) {
	'use strict';

	// Default paths
	var DEFAULT_SHADER_PATH = '/shaders/';
	var DEFAULT_TEXTURE_PATH = '/textures/';

	// Defines local factory
	var WEBGLContext = {};

	/**
	 * Creates an instance of a WEBGLContext.
	 *
	 * @param	{string}	canvas	The id of the canvas on which the context will be instanciated.
	 * @throws	{Error}		If canvas element with id canvas_id doesn't exist.
	 * @return	{WGLC}		The new WGLC object.
	 */
	WEBGLContext.create = function(canvas_id) {
		var canvas = _.G(canvas_id);
		if(canvas == undefined) throw new Error('Unable to find canvas element with id "' + canvas_id + '"');
		var options = {
			camera: new _.Camera({position: new _.v3(0,0,-2)}),
			renderCallback: undefined
		};
		return new WGLC(canvas, options);
	}

	/**
	 * Creates an instance of a WEBGLContext
	 *
	 * @constructor
	 * @this	{WGLC}
	 * @param	{DOMElement}	canvas	The canvas element on which the context will be instanciated
	 * @param	{object}		options	A javascript object containing the context parameters
	 *									- camera
	 *									- renderCallback
	 * @return {WGLC} The new WGLC object.
	 */
	function WGLC(canvas, options) {
		this._canvas = canvas;
		this._camera = options.camera;
		this._angle_y = 0;

		if(!this._canvas)
			throw new Error('Unable to retreive the provided canvas element :' + canvas);

		this._context = this.c = this.initContext();

		this._activeBuffer = null;
		this._vbos = [];
		this._programs = [];

		this._projection_mat = new _.m4();
		this._model_mat = _.m4.identity();
	}

	/**
	 * Initialize the context attribute with an instance of a webgl canvas context 
	 *
	 * @this{WGLC}
	 * @throws {Error} If unable to create a webgl context.
	 */
	WGLC.prototype.initContext = function() {
		this._context = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
		if(!this._context)
			throw new Error('Unable to create webgl context');
	};


	/**
	 * Creates a shader program with given name and associates it with current context object
	 * if no path is specified the function will look for them under the folder :
	 * DEFAULT_SHADER_PATH/name/name.(vert|frag)
	 * This function creates and loads the program. It adds an entry to the loading queue.
	 * if you specify a callback, it will be call when the program is ready
	 * 
	 * @param  {object} options
	 *		name 					Name of the program to create. Must be unique.
	 *		path (optional)			Path under which the function will look for the shaders.
	 *		callback (optional)		Callback to be called when the program is ready.
	 *
	 * @throws {Error}	If name of the shader isn't specified.
	 */
	WGLC.prototype.createProgram = function(options) {
		options = options || {};
		if(!options.name) throw new Error('you need to specify a name for your program');

		var name = options.name;
		var path = options.path || DEFAULT_SHADER_PATH + options.name + '/';
		var callback = options.callback || function(){};

		var vs_file = path + options.name + '.vert';
		var fs_file = path + options.name + '.frag';

		var program = {
			state: 'notready',
			name: name,
			vs: undefined,
			fs:undefined,
			program: undefined,
			uniforms: {},
			attributes: {},
			callback: callback
		};

		this._programs[name] = program;

		var self = this;

		// Requests the vertex shader
		_.ajax.request(vs_file, function(response) {
			program.vs =  self.createShader(response, self.c.VERTEX_SHADER);			
			if(program.fs) {
				program.state = 'compiling';
				self.compileProgram(name);
			}
		});

		// Requests the fragment shader
		_.ajax.request(fs_file, function(response) {
			program.fs =  self.createShader(response, self.c.FRAGMENT_SHADER);
			if(program.vs) {
				program.state = 'compiling';
				self.compileProgram(name);
			}
		});
	}

	/**
	 * Creates and compile a new shader object based on the given OPENGL ES source
	 * @param  {string}		src		OPENGL ES source code
	 * @param  {constant}	type 	Type of the shader to create. FRAGMENT_SHADER | VERTEX_SHADER.
	 * 
	 * @throws {Error} If Shader fails to compile.
	 * 
	 * @return {object}	The newly created shader.
	 */
	WGLC.prototype.createShader = function(src, type) {
		// Compiles the shader
		var shader = this.c.createShader(type);
		this.c.shaderSource(shader, src);
		this.c.compileShader(shader);

		if(!this.c.getShaderParameter(shader, this.c.COMPILE_STATUS)) {
			throw new Error("Error compiling shader: " + this.c.getShaderInfoLog(shader));
		}
		return shader;
	}

	/**
	 * Creates a new program object and attach shaders to it.
	 * This function initialize references to uniforms and attributes as specified in options
	 * 
	 * @param {string} name	Name of the program to compile. 
	 *
	 * @throws {Error} If the program fails to link or validate.
	 */
	WGLC.prototype.compileProgram = function(name) {
		var p = this._programs[name];
		p.program = this.c.createProgram();
		this.c.attachShader(p.program, p.vs);
		this.c.attachShader(p.program, p.fs);
		this.c.linkProgram(p.program);

		if(!this.c.getProgramParameter(p.program, this.c.LINK_STATUS)) {
			p.state = 'failed';
			throw new Error("Unable to initialize the shader program.");
		}
		
		this.qualify(p, 'u');
		this.qualify(p, 'a');

		this.c.validateProgram(p.program);
		if (!this.c.getProgramParameter(p.program, this.c.VALIDATE_STATUS))
			throw new Error('Unable to validate prgram');

		p.state = 'ready';
		p.callback(p);
	}

	/**
	 * Dynamically locates attributes or uniforms for a given program.
	 * Stores pointers in the given program object.
	 * @param  {program object}	p		Program on which to look for qualifiers.
	 * @param  {string}			type	Type of qualifier to identify
	 * 										'u' for uniforms
	 * 										'a' for attributes
	 * 										
	 * @throws {Error} 		If type of qualifier is different from 'u' or 'a'
	 */
	WGLC.prototype.qualify = function (p, type) {
		var res, pname, fname;
		if(type === 'u') {
			pname = this.c.ACTIVE_UNIFORMS;
			fname = 'Uniform';
			res = p.uniforms;
		} else if ( type == 'a') {
			pname = this.c.ACTIVE_ATTRIBUTES;
			fname = 'Attrib';
			res = p.attributes;
		} else { throw new Error(' type must be "u" for uniforms or "a" for attributes');}

		var len = this.c.getProgramParameter(p.program, pname);

		for(var index = 0 ; index < len ; index++) {
			// Dynamically call appropriate function getActive{uniform || attribute}
			var qualifier = this.c['getActive' + fname](p.program, index).name;	
			_.dl('Looking for ' + fname + ' ' + qualifier + ' location.');
			res[qualifier] = this.c['get'+ fname + 'Location'](p.program, qualifier);
			_.dl('found : ' + res[qualifier]);
		}
	}

	/**
	 * Changes the program currently used by this context
	 * @param  {string} program_id The program identifier.
	 */
	WGLC.prototype.useProgram = function(program_id) {
		var p = this.getProgram(program_id);
		this.c.useProgram(p.program);
	};

	/**
	 * Returns a program identified by the identifier program_id
	 * @param  {string} program_id Identifier of the program to return.
	 *
	 * @throws {Error} If program with id program_id doesn't exist.
	 * 
	 * @return {program object} The program with identifier program_id
	 */
	WGLC.prototype.getProgram = function(program_id) {
		if(!programExists(program_id)) throw new Error('Unknown program : ' + program_id);
		var p = this._programs[program_id];		
		return p;
	};

	/**
	 * Checks if the current program with given id program_id exists.
	 * @param  {string} program_id The identifier of the program to look for.
	 * @return {program object}
	 */
	WGLC.prototype.programExists = function(program_id) {
		return this._programs[program_id] !== undefined;
	}

	// VBO Manipulation
	WGLC.prototype.createVBO = function(id) {
		this._vbos[id] = this.c.createBuffer();
		this.c.bindBuffer(this.c.ARRAY_BUFFER, this._vbos[id]);
		return this._vbos[id];
	}

	WGLC.prototype.makeVBOActive = function(id) {
		if(this._activeBuffer != id) {
			this.c.bindBuffer(this.c.ARRAY_BUFFER, this._vbos[id]);
			this._activeBuffer = id;
		}
	}

	WGLC.prototype.setVBOData = function(id, data) {
		this.makeVBOActive(id);
		this._vbos[id].size = data.length;
		this.c.bufferData(this.c.ARRAY_BUFFER, new Float32Array(data), this.c.STATIC_DRAW);
	}


	WGLC.prototype.linkUniform1f = function(uniform, value) {
		this.c.uniform1f(uniform, value);
	}

	WGLC.prototype.linkAtribute = function(attribute) {
		this.c.enableVertexAttribArray(attribute);	
		this.c.vertexAttribPointer(attribute, 3, this.c.FLOAT, false, 0, 0);
	}

	WGLC.prototype.linkProjectionUniform = function(uniform) {
		this.c.uniformMatrix4fv(uniform, false, this._projection_mat.m);
	}

	WGLC.prototype.render = function(offset, size) {
		// var size = this._vbos[this._activeBuffer].size
		this.c.drawArrays(this.c.LINE_LOOP, offset, size);
	}

	// Initializes a new webgl context for the current object canvas : this._canvas

	WGLC.prototype.setDimension = function(width, height) {
		this._canvas.width = width;
		this._canvas.height = height;
		this.updateViewport();
	};

	WGLC.prototype.updateViewport = function() {
		this.c.viewport(0, 0, this._canvas.width, this._canvas.height);
		this._projection_mat.perspective(45, this._canvas.width / this._canvas.height, 0, 100.0);
	};

	// Model change
	WGLC.prototype.getCam = function() {
		return this._camera;
	}

	WGLC.prototype.rotateY = function(angle) {
		this._angle_y = angle;
	}

	WGLC.prototype.updateCamera = function(delta_t) {
		this._camera.update(delta_t);
		var view = this._camera.getMatrix();
		view.rotateY(this._angle_y);
		this.c.uniformMatrix4fv(this.getProgram('context').uniforms.u_model_view_mat, false, view.m);
	}

	// Changes clear color
	//	color = array of floats [red, green, blue, alpha]. Floats will be clamped between [0,1]
	WGLC.prototype.setBackground = function(color) {
		this.c.clearColor(color[0],color[1],color[2],color[3]);
	};

	WGLC.prototype.clear = function() {
		this.c.clear(this.c.COLOR_BUFFER_BIT || this.c.DEPTH_BUFFER_BIT);
	};

	Goblin.addModule('WGLC', WEBGLContext);
})(this, this.document);