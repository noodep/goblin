(function(window, document, undefined){
	'use strict';

	// Default paths
	var DEFAULT_SHADER_PATH = '/shaders/';
	var DEFAULT_TEXTURE_PATH = '/textures/';

	// Defines local factory
	var WEBGLContext = {};

	// Creates and returns a simple context
	WEBGLContext.create = function(canvas, options) {
		options = options || {};

		var canvas = _.G(canvas);

		return new WGLC(canvas);
	}


	// Webgl Context object
	function WGLC(canvas) {
		this._canvas = canvas;

		if(!this._canvas)
			throw new Error('Unable to retreive the provided canvas element :' + canvas);

		this._context = this.c = this.initContext();
		if(!this._context)
			throw new Error('Unable to create webgl context');

		this._activeBuffer = null;
		this._vbos = [];
		this._programs = [];

		this._projection_mat = mat4.create();
		this._model_mat = mat4.create();
		mat4.identity(this._model_mat);
	}

	//	Creates a shader program with given name and associates it with current context object
	//	if no path is specified the function will look for them under the folder :
	//	DEFAULT_SHADER_PATH/name/name.(vert|frag)
	//	This function creates and loads the program. It adds an entry to the loading queue.
	//	if you specify a callback, it will be call when the program is ready
	//	Options format:
	//		name 					= name of the program to create. Must be unique.
	//		path (optional)			= path under which the function will look for the shaders.
	//		callback (optional)		= this callback will be called when the program is ready.
	//		uniforms (optional)		= list of uniforms defined in the shaders.
	//		attributes (optional)	= list of attributes defined in the shaders.
	WGLC.prototype.createProgram = function(options) {
		options = options || {};
		if(!options.name) throw new Error('you need to specify a name for your program');

		var name = options.name;
		var path = options.path || DEFAULT_SHADER_PATH + options.name + '/';
		var callback = options.callback || function(){};
		var uniforms = options.uniforms || {};
		var attributes = options.attributes || {};

		var vs_file = path + options.name + '.vert';
		var fs_file = path + options.name + '.frag';

		var program = {
			'state': 'notready',
			'name': name,
			'vs': undefined,
			'fs':undefined,
			'program': undefined,
			'uniforms': uniforms,
			'attributes': attributes,
			'callback': callback
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

	// Creates and compile a new shader object based on the given OPENGL ES source
	// shader	= OPENGL ES source code
	// type		= defines the type of shader to create. FRAGMENT_SHADER | VERTEX_SHADER
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

	// Creates a new program object and attach shaders to it.
	// This function initialize references to uniforms and attributes as specified in options
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

		for (var uniform in p.uniforms) {
			var name = p.uniforms[uniform];
			_.dl('Looking for uniform ' + name);
			p.uniforms[uniform] = this.c.getUniformLocation(p.program, name);
			_.dl('found : ' + p.uniforms[uniform]);
		};
		
		for (var attribute in p.attributes) {
			var name = p.attributes[attribute];
			_.dl('Looking for attribute ' + name);
			p.attributes[attribute] = this.c.getAttribLocation(p.program, name);
			_.dl('found : ' + p.attributes[attribute]);
		};
		
		this.c.validateProgram(p.program);
		if (!this.c.getProgramParameter(p.program, this.c.VALIDATE_STATUS))
			throw new Error('Unable to validate prgram');

		p.state = 'ready';
		p.callback(p);
	}

	// Changes the program currently used by this context
	// If the specified program doesn't exists, it throws an exception.
	WGLC.prototype.useProgram = function(program_name) {
		var p = this.getProgram(program_name);
		this.c.useProgram(p.program);
	};

	// Returns a program identified by id program_name
	// If the specified program doesn't exists, it throws an exception.
	WGLC.prototype.getProgram = function(program_id) {
		var p = this._programs[program_id];
		if(!p) throw new Error('Unknown program : ' + program_id);
		return p;
	};


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
		this.c.bufferData(this.c.ARRAY_BUFFER, new Float32Array(data), this.c.STATIC_DRAW);
	}

	WGLC.prototype.linkAtribute = function(attribute) {
		this.c.enableVertexAttribArray(attribute);	
		this.c.vertexAttribPointer(attribute, 3, this.c.FLOAT, false, 0, 0);
	}

	WGLC.prototype.linkProjectionUniform = function(uniform) {
		this.c.uniformMatrix4fv(uniform, false, this._projection_mat);
		_.l(this._projection_mat);
	}

	WGLC.prototype.linkModelUniform = function(uniform) {
		this.c.uniformMatrix4fv(uniform, false, this._model_mat);
		_.l(this._model_mat);
	}

	WGLC.prototype.render = function() {
		this.c.drawArrays(this.c.TRIANGLES, 0, 3);
	}

	// Initializes a new webgl context for the current object canvas : this._canvas
	WGLC.prototype.initContext = function() {
		return this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
	};

	WGLC.prototype.setDimension = function(width, height) {
		this._canvas.width = width;
		this._canvas.height = height;
		this.updateViewport();
	};

	WGLC.prototype.updateViewport = function() {
		this.c.viewport(0, 0, this._canvas.width, this._canvas.height);
		mat4.perspective(this._projection_mat, 45, this._canvas.width / this._canvas.height, 0.1, 100.0);
	};

	// Model change
	WGLC.prototype.translate = function(x,y,z) {
		mat4.translate(this._model_mat, this._model_mat, [x,y,z]);
	};

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