(function(window, document, undefined){
	'use strict';

	function Renderer(options, rendering_context, ready_callback) {
		this._name = options.name;
		this._orig = options.origin;
		this._orientation = options.orientation;
		this._scale = options.scale;
		this._prog = options.program;
		this._createRenderingProgram(rendering_context, ready_callback);
	}

	Renderer.prototype._createRenderingProgram = function(rendering_context, callback) {
		try {
			var program_config = {
				name : this._prog,
			};
			if(callback !== undefined)
				program_config.callback = callback.bind(this);

			rendering_context.createProgram(program_config);

		} catch(e) {
			_.el('Error while creating shader : ' + e);
			return -1;
		}
	}

	Renderer.prototype.render = function(rendering_context) {
		var p = rendering_context.useProgram(this._prog);

		if(this._vbo == undefined)
			this.initVBO(rendering_context, p);

		rendering_context.makeVBOActive(this._vbo_id);

		this.preRender(p, rendering_context);
		this.draw(rendering_context);
	}

	Renderer.prototype.preRender = function() {}
	Renderer.prototype.draw = function() {}
	Renderer.prototype.update = function() {}

	Goblin.addModule('Renderer', Renderer);

})(this, this.document);
