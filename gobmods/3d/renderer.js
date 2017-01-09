(function(window, document, undefined){
	'use strict';

	class Renderer {
		constructor(options = {}, rendering_context, ready_callback) {
			this._name = options.name || _.GUID();
			this._children = new Set();
			this._origin = _.v3.fromArray(options.origin || [0.0,0.0,0.0]);
			this._orientation = _.quat.fromEulerAngles(
					_.v3.fromArray(options.orientation || [0.0,0.0,0.0]));
			this._scale = _.v3.fromArray(options.scale || [1.0,1.0,1.0]);
			this._program_id = options.program;
			this._properties = options.properties;

			if(this._program_id)
				this._createRenderingProgram(rendering_context, ready_callback);
		}

		_createRenderingProgram(rendering_context, callback) {
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

		addChild(child) {
			if (this._children.add(child)) {
				child._parent = this;
			}
		}

		removeChild(child) {
			if (this._children.delete(child)) {
				child._parent = undefined;
			}
		}

		hasChild(child) {
			return this._children.has(child);
		}

		clearChildren() {
			this._children.clear();
		}

		updateModelMatrix() {
			this._model = this._pmodel || _.m4.identity();
			this._model.translate(this._origin);
			this._model.rotateQuat(this._orientation);
			this._model.scale(this._scale);

			this._children.forEach((child) => {
				child._pmodel = this._model.clone();
			});

			this._pmodel = undefined;
		}

		render(rendering_context) {
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

		doUpdate(delta_t) {
			this.updateModelMatrix();
			this.update(delta_t);

			this._children.forEach((child) => {
				child.doUpdate(delta_t);
			});
		}

		get name() {
			return this._name;
		}

		get origin() {
			return this._origin.clone();
		}

		get scale() {
			return this._scale.clone();
		}

		get orientation() {
			return this._orientation.clone();
		}

		set name(name) {
			this._name = name;
		}

		set origin(origin) {
			this._origin.copy(origin);
		}

		set scale(scale) {
			this._scale.copy(scale);
		}

		set orientation(orientation) {
			this._orientation.copy(orientation);
		}

		toWorldRoot(vec3) {
			return vec3.clone().transform4(this._model);
		}

		preRender() {}
		draw() {}
		update() {}
	}

	Goblin.extend('Renderer', Renderer);

})(this, this.document);
