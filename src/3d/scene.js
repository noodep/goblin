/**
 * @file Scene
 *
 * @author noodep
 * @author jdiemert
 * @version 0.25
 */

import Renderable from '../gl/renderable.js';
import Object3D from './object3d.js';

/**
 * Scene to render a hierarchy of Renderables.
 *
 * Fires the following events, in addition to those in Object3D:
 *	'update' - When the scene updates; passes the time since the last update
 */
export default class Scene extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Scene
	 *
	 * @param {String} [name] - This scene display name.
	 * @return {module:3d.Scene} - The newly created Scene.
	 */
	constructor(name) {
		super(undefined, name);
		this._lights = new Set();
		this._cameras = new Array();

		// Temporary test
		this._active_camera = 0;
		// Tempend

		/**
		 * @type {Map<string, Set<Renderable>>}
		 * Program → Set of renderables to be drawn.
		 */
		this._program_cache = new Map();

		/**
		 * @type {Map<string, Set<Renderable>>}
		 * Program → Set of renderables that are currently hidden (not drawn).
		 * These remain initialized and can be restored to the program cache.
		 */
		this._hidden_program_cache = new Map();

		// Private instance symbols used to store the bound 'add' and 'remove'
		// event handlers on each parent object so that the listeners can be
		// removed when an object is removed from the scene.
		this._add_handler_symbol = Symbol(`${this.id} add`);
		this._remove_handler_symbol = Symbol(`${this.id} remove`);
	}

	/**
	 * Returns an array of all visible (drawn) renderables in this scene, in no particular order.
	 * @returns {Renderable[]}
	 */
	getRenderables() {
		const renderables = [];
		for (let cache of this._program_cache.values()) {
			for (let renderable of cache) {
				renderables.push(renderable);
			}
		}
		return renderables;
	}

	/**
	 * Returns an array of all hidden (not drawn) renderables retained by the scene.
	 * @returns {Renderable[]}
	 */
	getHiddenRenderables() {
		const renderables = [];
		for (let cache of this._hidden_program_cache.values()) {
			for (let renderable of cache) {
				renderables.push(renderable);
			}
		}
		return renderables;
	}

	/**
	 * Returns an array of all renderables known to the scene (visible + hidden).
	 * @returns {Renderable[]}
	 */
	getAllRenderables() {
		return [...this.getRenderables(), ...this.getHiddenRenderables()];
	}

	/**
	 * Called by renderer when this scene is attached.
	 * @param {object} renderer
	 */
	sceneAttached(renderer) {
		this.initializeObject3D(renderer, this);
	}

	/**
	 * Adds a camera projection matrix.
	 * @param {object} camera
	 */
	addCamera(camera) {
		this._cameras.push(camera);
	}

	/**
	 * Recursive initialization of the specified Object3D.
	 * @param {object} renderer
	 * @param {Object3D} object
	 */
	initializeObject3D(renderer, object) {
		if (object instanceof Renderable) {
			object.initialize(renderer);
			this._addRenderableToProgramCache(object);
		}

		// Utilize (exploit) the fact that a renderer is passed to this function
		// to be able to initialize new objects added to the hierarchy without
		// having to wait until a reference to a renderer is available.
		//
		// Binding the functions to pass the this pointer and the renderer
		// creates new, anonymous functions; symbols private to this instance
		// are used to store the callbacks with the objects they are listening
		// to maintain references to them for removal in uninitializeObject3D().
		// (Even though the remove listener does not have to bind to the
		// renderer and could be defined as an arrow function in the
		// constructor, it is created with the add listener for conisistency and
		// possible future changes).
		const add_event_handler = this._addEventHandler.bind(this, renderer);
		const remove_event_handler = this._removeEventHandler.bind(this);

		object.addListener('add', add_event_handler);
		object.addListener('remove', remove_event_handler);
		object[this._add_handler_symbol] = add_event_handler;
		object[this._remove_handler_symbol] = remove_event_handler;

		for (let child_object of object.getChildren()) {
			this.initializeObject3D(renderer, child_object);
		}
	}

	/**
	 * Recursively uninitialization of the specified Object3D.
	 * This undoes the action of initializeObject3D() by recursively removing
	 * event listeners on Object3D instances and removing Renderables in the
	 * hierarchy at and below the specified object from the program cache.
	 * Removes any renderables from both the visible and hidden caches.
	 *
	 * @param {Object3D} object
	 */
	uninitializeObject3D(object) {
		if (object instanceof Renderable) {
			this._removeRenderableFromProgramCache(object);
			this._removeRenderableFromHiddenCache(object);
		}

		object.removeListener('add', object[this._add_handler_symbol]);
		object.removeListener('remove', object[this._remove_handler_symbol]);
		delete object[this._add_handler_symbol];
		delete object[this._remove_handler_symbol];

		for (let child_object of object.getChildren()) {
			this.uninitializeObject3D(child_object);
		}
	}

	/**
	 * Update this Scene.
	 * @param {number} delta_t - Time since last update in seconds.
	 */
	update(delta_t) {
		this.notify('update', delta_t);
		super.update(delta_t);
	}

	/**
	 * Render this Scene using program batches.
	 * @param {object} renderer
	 */
	render(renderer) {
		// render fully opaque objects first, deferring those that may blend colors
		const those_may_blend = new Map();
		this._program_cache.forEach((renderables, program_name) => {
			this.applyProgramState(renderer, program_name);

			let any_may_blend = false;
			for (let renderable of renderables) {
				if (renderable.may_blend) {
					any_may_blend = true;
					continue;
				}
				renderable.setShaderState(renderer);
				renderable.render(renderer);
				renderable.cleanShaderState(renderer);
			}
			if (any_may_blend)
				those_may_blend.set(program_name, renderables);
		});
		// if there are objects that may blend, render them
		if (those_may_blend.size > 0) {
			those_may_blend.forEach((renderables, program_name) => {
				this.applyProgramState(renderer, program_name);

				for (let renderable of renderables) {
					if (!renderable.may_blend) continue;

					renderable.setShaderState(renderer);
					renderable.render(renderer);
					renderable.cleanShaderState(renderer);
				}
			});
		}

		renderer.useProgram(null);
	}

	/**
	 * Applies the specified program rendering state to the specified renderer.
	 * Camera and View for now. Fog and Overrides later.
	 * @param {object} renderer
	 * @param {string} program_name
	 */
	applyProgramState(renderer, program_name) {
		renderer.useProgram(program_name);
		const program = renderer.activeProgram;
		const camera = this._cameras[this._active_camera];

		program.applyState(renderer, camera.projection, camera.view);
	}

	/**
	 * Hide a renderable by moving it from the visible program cache
	 * to the hidden cache. No GPU teardown is performed; the object
	 * remains initialized and can be restored quickly.
	 *
	 * @param {Renderable|string} renderable_or_id - The renderable instance or its id.
	 * @returns {boolean} - True if a renderable was moved; false otherwise.
	 */
	makeRenderableInvisible(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;

		// If it's already hidden, do nothing.
		if (this._isInHiddenCache(renderable)) return true;

		// Remove from visible cache (if present) and stash to hidden.
		const removed = this._removeRenderableFromProgramCache(renderable);
		this._addRenderableToHiddenCache(renderable);
		// Notify the renderable (compat listeners) that its visibility changed.
		try { renderable.notify('visibility', false); } catch (e) { /* ignore */ }
		return removed;
	}

	/**
	 * Show a previously hidden renderable by moving it from the hidden cache
	 * back to the visible program cache.
	 *
	 * @param {Renderable|string} renderable_or_id - The renderable instance or its id.
	 * @returns {boolean} - True if a renderable was restored; false otherwise.
	 */
	makeRenderableVisible(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;

		// If it's already visible, do nothing.
		if (this._isInProgramCache(renderable)) return true;

		const removed = this._removeRenderableFromHiddenCache(renderable);
		if (!removed) return false;

		this._addRenderableToProgramCache(renderable);
		// Notify the renderable (compat listeners) that its visibility changed.
		try { renderable.notify('visibility', true); } catch (e) { /* ignore */ }
		return true;
	}

	/**
	 * Toggle visibility of a renderable.
	 * @param {Renderable|string} renderable_or_id
	 * @param {boolean} should_be_visible
	 * @returns {boolean}
	 */
	setRenderableVisible(renderable_or_id, should_be_visible) {
		return should_be_visible
			? this.makeRenderableVisible(renderable_or_id)
			: this.makeRenderableInvisible(renderable_or_id);
	}

	/**
	 * Returns whether a renderable is currently considered visible (i.e., in the draw cache).
	 * @param {Renderable|string} renderable_or_id
	 * @returns {boolean}
	 */
	isRenderableVisible(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;
		return this._isInProgramCache(renderable);
	}

	/**
	 * Internal: add a renderable to the visible program cache.
	 * @param {Renderable} renderable
	 * @private
	 */
	_addRenderableToProgramCache(renderable) {
		const program_name = renderable.program;
		if (!this._program_cache.has(program_name))
			this._program_cache.set(program_name, new Set());
		this._program_cache.get(program_name).add(renderable);
	}

	/**
	 * Internal: remove a renderable from the visible program cache.
	 * @param {Renderable} renderable
	 * @returns {boolean} - True if removed from visible cache.
	 * @private
	 */
	_removeRenderableFromProgramCache(renderable) {
		const program_name = renderable.program;
		if (!this._program_cache.has(program_name)) return false;

		const cache = this._program_cache.get(program_name);
		const did_delete = cache.delete(renderable);

		if (cache.size === 0) {
			this._program_cache.delete(program_name);
		}
		return did_delete;
	}

	/**
	 * Internal: add a renderable to the hidden cache.
	 * @param {Renderable} renderable
	 * @private
	 */
	_addRenderableToHiddenCache(renderable) {
		const program_name = renderable.program;
		if (!this._hidden_program_cache.has(program_name))
			this._hidden_program_cache.set(program_name, new Set());
		this._hidden_program_cache.get(program_name).add(renderable);
	}

	/**
	 * Internal: remove a renderable from the hidden cache.
	 * @param {Renderable} renderable
	 * @returns {boolean} - True if removed from hidden cache.
	 * @private
	 */
	_removeRenderableFromHiddenCache(renderable) {
		const program_name = renderable.program;
		if (!this._hidden_program_cache.has(program_name)) return false;

		const cache = this._hidden_program_cache.get(program_name);
		const did_delete = cache.delete(renderable);

		if (cache.size === 0) {
			this._hidden_program_cache.delete(program_name);
		}
		return did_delete;
	}

	/**
	 * Internal: check if a renderable is in the visible cache.
	 * @param {Renderable} renderable
	 * @returns {boolean}
	 * @private
	 */
	_isInProgramCache(renderable) {
		const program_name = renderable.program;
		return this._program_cache.has(program_name) &&
			this._program_cache.get(program_name).has(renderable);
	}

	/**
	 * Internal: check if a renderable is in the hidden cache.
	 * @param {Renderable} renderable
	 * @returns {boolean}
	 * @private
	 */
	_isInHiddenCache(renderable) {
		const program_name = renderable.program;
		return this._hidden_program_cache.has(program_name) &&
			this._hidden_program_cache.get(program_name).has(renderable);
	}

	/**
	 * Internal: resolve a renderable from an instance or an id string.
	 * Searches both visible and hidden caches.
	 * @param {Renderable|string} renderable_or_id
	 * @returns {Renderable|null}
	 * @private
	 */
	_resolveRenderable(renderable_or_id) {
		if (renderable_or_id instanceof Renderable) return renderable_or_id;
		const id = String(renderable_or_id);
		for (let r of this.getAllRenderables()) {
			if (r.id === id) return r;
		}
		return null;
	}

	_addEventHandler(renderer, parent, child) {
		this.initializeObject3D(renderer, child);
	}

	_removeEventHandler(parent, child) {
		this.uninitializeObject3D(child);
	}

}
