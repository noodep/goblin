/**
 * @file Scene.
 *
 * @author noodep
 * @version 0.34
 */

import Renderable from '../gl/renderable.js';
import Object3D from './object3d.js';

/**
 * Scene to render a hierarchy of Renderables.
 *
 * Fires the following events, in addition to those in Object3D:
 */
export default class Scene extends Object3D {

	_lights = new Set();
	_cameras = new Array();
	_active_camera = 0;
	_program_cache = new Map();

	/**
	 * Returns an array of all renderable objects in this scene, in no
	 * particular order.
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

	sceneAttached(renderer) {
		this.initializeObject3D(renderer, this);
	}

	/**
	 * Adds a camera projection matrix
	 */
	addCamera(camera) {
		this._cameras.push(camera);
	}

	/**
	 * Recursive initialization of the specified Object3D.
	 */
	initializeObject3D(renderer, object) {
		if(object instanceof Renderable) {
			object.initialize(renderer);
			this.addRenderableToProgramCache(object);
		}

		for(let child_object of object.children)
			this.initializeObject3D(renderer, child_object);
	}

	/**
	 * Recursively uninitialization of the specified Object3D.
	 * This undoes the action of initializeObject3D() by recursively removing
	 * event listeners on Object3D instances and removing Renderables in the
	 * hierarchy at and below the specified object from the program cache.
	 *
	 * TODO Should renderables be destroyed via Renderable#destroy() when
	 * uninitialized, or still be allowed to exist in case they are later
	 * re-added (current behavior) ?
	 */
	uninitializeObject3D(object) {
		if (object instanceof Renderable)
			this.removeRenderableFromProgramCache(object);

		for (let child_object of object.children)
			this.uninitializeObject3D(child_object);
	}

	/**
	 * Add the specified {@code Renderable} to this {@code Scene} program cache.
	 */
	addRenderableToProgramCache(renderable) {
		const program_name = renderable.program;
		if(!this._program_cache.has(program_name))
			this._program_cache.set(program_name, new Set());

		this._program_cache.get(program_name).add(renderable);
	}

	/**
	 * Remove the specified {@code Renderable} from this {@code Scene} program
	 * cache.
	 */
	removeRenderableFromProgramCache(renderable) {
		const program_name = renderable.program;
		if (this._program_cache.has(program_name)) {
			let cache = this._program_cache.get(program_name);
			cache.delete(renderable);

			// Remove the program altogether if there are no more renderables in
			// it.
			if (cache.size === 0) {
				this._program_cache.delete(program_name);
			}
		}
	}

	/**
	 * Render this Scene using program batches.
	 */
	render(renderer) {
		this._program_cache.forEach((renderables, program_name) => {
			this.applyProgramState(renderer, program_name);

			for(let renderable of renderables) {
				renderable.setShaderState(renderer);
				renderable.render(renderer);
				renderable.cleanShaderState(renderer);
			}
		});

		renderer.useProgram(null);
	}

	/**
	 * Applies the specified program rendering state to the specified renderer.
	 * Camera and View for now. Fog and Overrides later.
	 */
	applyProgramState(renderer, program_name) {
		renderer.useProgram(program_name);
		const program = renderer.activeProgram;
		const camera = this._cameras[this._active_camera];

		program.applyState(renderer, camera.projection, camera.view);
	}

}
