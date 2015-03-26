(function(window, document, undefined){
	'use strict';

	function Renderer(options, rendering_context, ready_callback) {
		this._name = options.name || _.GUID();
		this._orig = options.origin || [0.0,0.0,0.0];
		this._orientation = options.orientation || [0.0,0.0,0.0];
		this._scale = options.scale || [1.0,1.0,1.0];
		this._prog = options.program;
		this._properties = options.properties;
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
		if(p.state == 'notready') return;

		if(this._vbo == undefined)
			this.initVBO(rendering_context, p);

		rendering_context.makeVBOActive(this._vbo_id);

		this.preRender(p, rendering_context);
		this.draw(rendering_context);
	}

	Renderer.prototype.preRender = function() {}
	Renderer.prototype.draw = function() {}
	Renderer.prototype.update = function() {}


	Renderer.transformRenderer = function(parent, child) {
		if(!parent.origin || !parent.orientation || !parent.scale)
			throw new Error('Parent is missing origin, orientation or scale');

		child.origin = child.origin || [0.0,0.0,0.0];
		child.orientation = child.orientation || [0.0,0.0,0.0];
		child.scale = child.scale || [1.0,1.0,1.0];

		for(var coord_index = parent.origin.length-1 ; coord_index >= 0 ; coord_index--)
			child.origin[coord_index] += parent.origin[coord_index];

		for(var angle_index = parent.orientation.length-1 ; angle_index >= 0 ; angle_index--)
			child.orientation[angle_index] += parent.orientation[angle_index];

		for(var scale_index = parent.scale.length-1 ; scale_index >= 0 ; scale_index--)
			child.scale[scale_index] *= parent.scale[scale_index];
	}
	
	Goblin.extend('Renderer', Renderer);

})(this, this.document);
