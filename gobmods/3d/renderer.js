(function(window, document, undefined){
	'use strict';

	function Renderer(options, rendering_context, ready_callback) {
		this._name = options.name || _.GUID();
		this._children = new Set();
		this._origin = options.origin || [0.0,0.0,0.0];
		this._orientation = options.orientation || [0.0,0.0,0.0];
		this._scale = options.scale || [1.0,1.0,1.0];
		this._program_id = options.program;
		this._properties = options.properties;

		if(this._program_id)
			this._createRenderingProgram(rendering_context, ready_callback);
	}

	Renderer.prototype._createRenderingProgram = function(rendering_context, callback) {
		try {
			var program_config = {
				name : this._program_id,
			};
			if(callback !== undefined)
				program_config.callback = callback.bind(this);

			rendering_context.createProgram(program_config);

		} catch(e) {
			_.el('Error while creating shader : ' + e);
			return -1;
		}
	}

	Renderer.prototype.addChild = function(child) {
		this._children.add(child);
	}

	Renderer.prototype.removeChild = function(child) {
		this._children.delete(child);
	}

	Renderer.prototype.updateModelMatrix = function() {
		this._model = this._pmodel || _.m4.identity();

		this._model.translate(this._origin);
		this._model.scale(this._scale);
		this._model.rotateX(this._orientation[0]);
		this._model.rotateY(this._orientation[1]);
		this._model.rotateZ(this._orientation[2]);

		this._children.forEach((child) => {
			child._pmodel = this._model.clone();
		});

		// reset parent model for next iteration
		this._pmodel = undefined;
	}

	Renderer.prototype.render = function(rendering_context) {
		this.updateModelMatrix();
		if(this._program_id) {

			var p = rendering_context.useProgram(this._program_id);
			if(p.state == 'notready') return;

			if(this._vbo == undefined)
				this.initVBO(rendering_context, p);

			rendering_context.makeVBOActive(this._vbo_id);

			this.preRender(p, rendering_context);
			this.draw(rendering_context);
		}

		this._children.forEach((child) => {
			child.render(rendering_context);
		});
	}

	Renderer.prototype.doUpdate = function(delta_t) {
		this.update(delta_t);

		this._children.forEach((child) => {
			child.doUpdate(delta_t);
		});
	}

	Renderer.prototype.preRender = function() {}
	Renderer.prototype.draw = function() {}
	Renderer.prototype.update = function() {}

	Goblin.extend('Renderer', Renderer);

})(this, this.document);
