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
	 * @throws	{Error}		If canvas element with id canvas_id doesn't 
	 * exist.
	 * @return	{WGLC}		The new WGLC object.
	 */
	WEBGLContext.create = function(canvas_id) {
		var canvas = _.G(canvas_id);
		if(canvas == undefined) throw new Error('Unable to find canvas element with id "' + canvas_id + '"');
		var options = {
			camera: new _.Camera({position: new _.v3(0,0,-6)}),
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
	 *		camera
	 *		renderCallback
	 *		
	 * @return {WGLC} The new WGLC object.
	 */
	function WGLC(canvas, options) {
		this._canvas = canvas;
		this._camera = options.camera;

		if(!this._canvas)
			throw new Error('Unable to retreive the provided canvas element :' + canvas);

		this.initContext();
		this.c.clearDepth(0.0);

		this._active_buffer = null;
		this._active_framebuffer = null;
		this._active_program = null;
		this._vbos = [];
		this._fbos = [];
		this._rbos = [];
		this._texs = [];
		this._programs = [];
		this._scenes = [];

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
		this._context = this.c = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
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

		if(this.programExists(name)) {
			var p = this.getProgram(name);
			_.dl('Program already exists with status ' + p.state);
			// program already download and compile
			// directly call the callback
			if(p.state === 'ready')
				callback(p);
			// if program not ready yet push current callback to program callback list to be called when ready
			else
				p.callbacks.push(callback);
			
			return;
		}

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
			callbacks: [callback]
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

		for(var c = 0 ; c < p.callbacks.length ; c++) {
			var callback = p.callbacks[c];
			callback(p);
		}
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
		if(this._active_program != program_id) {
			this._active_program = program_id
			this.c.useProgram(p.program);
		}
		return p;
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
		if(!this.programExists(program_id)) throw new Error('Unknown program : ' + program_id);
		var p = this._programs[program_id];		
		return p;
	};

	/**
	 * Checks if the current program with given id program_id exists.
	 * @param  {string} program_id The identifier of the program to look for.
	 * @return {boolean} returns true if a program with id program_id exists
	 */
	WGLC.prototype.programExists = function(program_id) {
		return this._programs[program_id] !== undefined;
	}

	/**
	 * Sets the dimension of the canvas in pixels.
	 * This function updates the viewport and the projection matrix accordingly
	 * @param {Number} width  width of the canvas in pixels
	 * @param {Number} height height of the canvas in pixels
	 */
	WGLC.prototype.setDimension = function(width, height) {
		this._canvas.width = width;
		this._canvas.height = height;
		this.updateViewport();
	}

	/**
	 * Updates the viewport and the projection of the rendering context.
	 */
	WGLC.prototype.updateViewport = function() {
		this.c.viewport(0, 0, this._canvas.width, this._canvas.height);
		this._camera.updateProjection(this._canvas.width, this._canvas.height);
	}

	/**
	 * Adds a new scene object
	 * @param  {object} scene_object scene_object to be added
	 */
	WGLC.prototype.addScene = function(scene_object) {
		this._scenes[scene_object.id] = scene_object;
	}

	/**
	 * Returns a scene identified by the identifier scen_id
	 * @param  {string} scene_id Identifier of the scene to return.
	 *
	 * @throws {Error} If scene with id scene_id doesn't exist.
	 * 
	 * @return {scene object} The scene with identifier scene_id
	 */
	WGLC.prototype.getScene = function(scene_id) {
		if(!this.sceneExists(scene_id)) throw new Error('Unknown scene : ' + scene_id);
		return this._scenes[scene_id];		
	};

	/**
	 * Checks if the scene with given id scene_id exists.
	 * @param  {string}		scene_id The identifier of the scene to look for.
	 * @return {boolean}	returns true if scene with id scene_id exists.
	 */
	WGLC.prototype.sceneExists = function(scene_id) {
		return this._scenes[scene_id] !== undefined;
	}

	/**
	 * Runs necessary updates for the selected scene
	 * @param  {string} scene_id identifier of the scene to update
	 */
	WGLC.prototype.updateScene = function(scene_id, delta_t) {
		var scene = this._scenes[scene_id];
		this._camera.update(delta_t);
		for (var i = scene.objects.length - 1; i >= 0; i--) {
			var object = scene.objects[i];
			object.update(delta_t);
		};

	}

	/**
	 * Renders the Scene identified by the identifier scene_id
	 * @param  {string} scene_id identifier of the scene to render
	 */
	WGLC.prototype.renderScene = function(scene_id) {
		this.makeFBOActive(undefined);
		var scene = this.getScene(scene_id);
		for (var i = scene.objects.length - 1; i >= 0; i--) {
			var object = scene.objects[i];
			object.render(this);
		};
	}

	/**
	 * Creates a VertexBufferObject with given id
	 * @param  {type} id
	 * @return {VertexBufferObject}		The created vertex buffer object.
	 */
	WGLC.prototype.createVBO = function(id) {
		this._vbos[id] = this.c.createBuffer();
		return this._vbos[id];
	}

	WGLC.prototype.makeVBOActive = function(id) {
		if(this._active_buffer != id) {
			this.c.bindBuffer(this.c.ARRAY_BUFFER, this._vbos[id]);
			this._active_buffer = id;
		}
	}

	WGLC.prototype.makeEBOActive = function(id) {
		if(this._active_buffer != id) {
			this.c.bindBuffer(this.c.ELEMENT_ARRAY_BUFFER, this._vbos[id]);
			this._active_buffer = id;
		}
	}

	WGLC.prototype.setVBOData = function(id, data) {
		this.makeVBOActive(id);
		this._vbos[id].size = data.length;
		this.c.bufferData(this.c.ARRAY_BUFFER, new Float32Array(data), this.c.STATIC_DRAW);
	}

	WGLC.prototype.setDynamicVBOData = function(id, data) {
		this.makeVBOActive(id);
		this._vbos[id].size = data.length;
		this.c.bufferData(this.c.ARRAY_BUFFER, data, this.c.DYNAMIC_DRAW);
	}

	WGLC.prototype.makeEBOActive = function(id) {
		if(this._active_buffer != id) {
			this.c.bindBuffer(this.c.ELEMENT_ARRAY_BUFFER, this._vbos[id]);
			this._active_buffer = id;
		}
	}

	WGLC.prototype.setEBOData = function(id, data) {
		this.makeEBOActive(id);
		this._vbos[id].size = data.length;
		this.c.bufferData(this.c.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), this.c.STATIC_DRAW);
	}

	WGLC.prototype.createFrameBuffer = function(buffer_id) {

		// var tex = this.c.createTexture();
		// this._texs[_.GUID()] = tex;

		// this.c.bindTexture(this.c.TEXTURE_2D, tex);
		// this.c.texParameteri(this.c.TEXTURE_2D, this.c.TEXTURE_MAG_FILTER, this.c.NEAREST);
		// this.c.texParameteri(this.c.TEXTURE_2D, this.c.TEXTURE_MIN_FILTER, this.c.NEAREST);
		// this.c.texParameteri(this.c.TEXTURE_2D, this.c.TEXTURE_WRAP_S, this.c.CLAMP_TO_EDGE);
		// this.c.texParameteri(this.c.TEXTURE_2D, this.c.TEXTURE_WRAP_T, this.c.CLAMP_TO_EDGE);
		// this.c.texImage2D(this.c.TEXTURE_2D, 0, this.c.RGBA, this._canvas.width, this._canvas.height, 0, this.c.RGBA, this.c.UNSIGNED_BYTE, null);

		var rb = this.c.createRenderbuffer();
		this._rbos[_.GUID()] = rb;
		this.c.bindRenderbuffer(this.c.RENDERBUFFER, rb);
		this.c.renderbufferStorage(this.c.RENDERBUFFER, this.c.RGBA4, this._canvas.width, this._canvas.height);

		//Creates framebuffer
		var fb = this.c.createFramebuffer();
		this._fbos[buffer_id] = fb;
		this.makeFBOActive(buffer_id);
		this.c.framebufferRenderbuffer(this.c.FRAMEBUFFER, this.c.COLOR_ATTACHMENT0, this.c.RENDERBUFFER, rb);

		if (this.c.checkFramebufferStatus(this.c.FRAMEBUFFER) != this.c.FRAMEBUFFER_COMPLETE) {
   			_.el("this combination of attachments does not work");
   			return;
   		}

   		return fb;
	}

	WGLC.prototype.makeFBOActive = function(id) {
		if(this._active_framebuffer != id) {
			var buffer = null;
			if(id != undefined)
				buffer = this._fbos[id];

			this.c.bindFramebuffer(this.c.FRAMEBUFFER, buffer);
			this._active_framebuffer = id;
		}
	}


	WGLC.prototype.linkUniform1f = function(uniform, value) {
		this.c.uniform1f(uniform, value);
	}

	WGLC.prototype.linkUniform4f = function(uniform, value) {
		this.c.uniform4f(uniform, value[0], value[1], value[2], value[3]);
	}

	WGLC.prototype.linkAtribute = function(attribute, qualifier_size , stride, offset) {
		var s = stride || 0;
		var o = offset || 0;
		this.c.enableVertexAttribArray(attribute);	
		this.c.vertexAttribPointer(attribute, qualifier_size, this.c.FLOAT, false, s, o);
	}

	WGLC.prototype.linkProjectionUniform = function(uniform) {
		this.c.uniformMatrix4fv(uniform, false, this._projection_mat.m);
	}
	
	WGLC.prototype.renderPoint = function(offset, size) {

		this.c.drawArrays(this.c.POINTS, offset, size);
	}

	WGLC.prototype.renderLineLoop = function(offset, size) {
		this.c.drawArrays(this.c.LINE_LOOP, offset, size);
	}

	WGLC.prototype.renderTriangleFan = function(offset, size) {
		this.c.drawArrays(this.c.TRIANGLE_FAN, offset, size);
	}

	// Model change
	WGLC.prototype.getCamera = function() {
		return this._camera;
	}

	WGLC.prototype.updateCamera = function(delta_t) {
		this._camera.update(delta_t);
	}

	// Changes clear color
	//	color = array of floats [red, green, blue, alpha]. Floats will be clamped between [0,1]
	WGLC.prototype.setBackground = function(color) {
		this.c.clearColor(color[0],color[1],color[2],color[3]);
	}

	WGLC.prototype.clear = function() {
		this.c.clear(this.c.COLOR_BUFFER_BIT | this.c.DEPTH_BUFFER_BIT);
	}

	WGLC.prototype.enableDepthTest = function(enable) {
		
		if(enable)
			this.c.enable(this.c.DEPTH_TEST);
		else
			this.c.disable(this.c.DEPTH_TEST);

		this.c.depthFunc(this.c.GREATER);
	}

	WGLC.prototype.enableBlending = function(enable) {
		this.c.blendFunc(this.c.SRC_ALPHA, this.c.ONE_MINUS_SRC_ALPHA);

		if(enable)
			this.c.enable(this.c.BLEND);
		else
			this.c.disable(this.c.BLEND);
	}

	Goblin.addModule('WGLC', WEBGLContext);
})(this, this.document);
