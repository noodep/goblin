/**
 * @file Renderable class that represent a Object3D  thst can be rendered on screen
 * Such object has a shader program associated with it and a geometry of some kind
 *
 * @author noodep
 * @version 0.20
 */

import { dl } from '../util/log.js';
import Object3D from '../3d/object3d.js';

/** @typedef {import('../gl/geometry/geometry.js')} Geometry */

/**
 * A class to represent an Object3D that can be rendered on a screen (by a
 * WebGLRenderer).
 */
export default class Renderable extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Renderable
	 *
	 * @param {String} id - The unique identifier of this object.
	 * @param {String} name - The name of this object.
	 * @param {VecLike} origin - The origin position of this object.
	 * @param {QuatLike} orientation - The orientation of this object.
	 * @param {VecLike} scale - The scale of this object.
	 * @param {Geometry} geometry - This object geometry.
	 * @param {String} program - The name of this object rendering program.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	constructor(id, name, origin, orientation, scale, geometry, program) {
		super(id, name, origin, orientation, scale);
		/** @type {Geometry} */ this._geometry = geometry;
		/** @type {String} */ this._program = program;
		/** @type {WebGLUniformLocation|undefined} */ this._model_uniform_location = undefined;
		/** @type {boolean} */ this._blend_preference = false; // Default to opaque

		// Place to store a geometry between being set with the setter and being
		// initialized later in setShaderState().
		/** @type {Geometry} */ this._new_geometry = null;
	}

	/**
	 * Creates a new Renderable instance.
	 *
	 * @param {Object} params - The parameters for the Renderable.
	 * @param {String} params.id - The unique identifier of this object.
	 * @param {String} params.name - The name of this object.
	 * @param {Vec3} params.origin - The origin position of this object.
	 * @param {Quaternion} params.orientation - The orientation of this object.
	 * @param {Vec3} params.scale - The scale of this object.
	 * @param {Geometry} params.geometry - This object geometry.
	 * @param {String} params.program - The name of this object rendering program.
	 * @return {module:3d.Renderable} - The newly created Renderable.
	 */
	static create({ id, name, origin, orientation, scale, geometry, program } = {}) {
		return new Renderable(id, name, origin, orientation, scale, geometry, program);
	}

	/** @returns {string} The name of the object rendering program. */
	get program() {
		return this._program;
	}

	/** 
	 * Sets the rendering program and notifies Scene for automatic cache management.
	 * 
	 * **Scene Cache Integration:**
	 * Program changes trigger Scene cache updates since renderables are organized
	 * by shader program for efficient batching. The Scene listens for 'program' events
	 * and moves the renderable between program-specific cache buckets.
	 * 
	 * **Event Payload Format:**
	 * Notifies with {old: previousProgram, new: newProgram} for targeted cache updates.
	 * This allows Scene to remove from specific old program bucket rather than
	 * searching all buckets for identity-based removal.
	 * 
	 * **Batching Performance:**
	 * Objects with the same program are rendered together to minimize shader switches,
	 * which are expensive WebGL state changes.
	 * 
	 * @param {string} name - The name of the new rendering program
	 */
	set program(name) {
		if (this._program !== name) {
			const oldProgram = this._program;
			this._program = name;
			try { 
				// Notify Scene with old/new program for efficient cache management
				this.notify('program', { old: oldProgram, new: name }); 
			} catch (e) { /* ignore notification errors */ }
		}
	}

	/** @returns {Geometry} The geometry of the object. */
	get geometry() {
		return this._geometry;
	}

	/** @param {Geometry} geometry - The geometry of the object. */
	set geometry(geometry) {
		this._new_geometry = geometry;
	}

	/** 
	 * Gets the blend preference of this renderable.
	 * 
	 * **Recommended Transparency Approach:**
	 * This is the preferred way for renderables to communicate transparency requirements
	 * to the Scene. The Scene listens for changes and automatically handles cache management.
	 * 
	 * **Automatic Scene Integration:**
	 * When changed, triggers Scene to move renderable between opaque and transparent
	 * rendering passes for optimal performance and correct alpha blending order.
	 * 
	 * **Alternative Scene APIs:**
	 * While this property-based approach is recommended, Scene also provides direct
	 * methods (makeRenderableBlend, makeRenderableOpaque) for external control.
	 * 
	 * @returns {boolean} True if this renderable requests transparent rendering
	 */
	get blendPreference() {
		return this._blend_preference;
	}

	/** 
	 * Sets the blend preference and notifies the Scene for automatic cache management.
	 * 
	 * This is the recommended way for renderables to request blend state changes.
	 * The Scene provides alternative API methods (makeRenderableBlend, makeRenderableOpaque,
	 * setRenderableBlend) for external programmatic control when needed.
	 * 
	 * @param {boolean} shouldBlend - Whether this renderable requires transparent rendering
	 */
	set blendPreference(shouldBlend) {
		if (this._blend_preference !== shouldBlend) {
			this._blend_preference = shouldBlend;
			this.notifyBlendChange();
		}
	}

	/**
	 * Notifies listeners (typically the Scene) that the blend requirement has changed.
	 * This allows the Scene to automatically move the renderable between opaque and blend caches.
	 */
	notifyBlendChange() {
		try {
			this.notify('blend', this._blend_preference);
		} catch (e) {
			// Scene may not be listening yet or renderable may not be attached
		}
	}

	/**
	 * Sets the blend preference without notifying listeners.
	 * Used internally by Scene APIs to prevent re-entrant event handling.
	 * @param {boolean} shouldBlend - Whether this renderable should use blending.
	 * @private
	 */
	_setBlendPreferenceQuiet(shouldBlend) {
		this._blend_preference = shouldBlend;
	}

	/** @param {WebGLRenderer} renderer - Initialize GPU state for this renderable. */
	initialize(renderer) {
		dl(`Initializing Renderable with id ${this.id}.`);

		renderer.useProgram(this._program);
		const program = renderer.activeProgram;

		this._model_uniform_location = program.getUniform('model');

		// Only initialize geometry if it hasn't been initialized yet
		if (!this._geometry.isInitialized) {
			this._geometry.initialize(renderer);
		}
	}

	/**
	 * Bind Vertex Array Object and configure per-renderable shader uniforms.
	 * 
	 * **Geometry Replacement Handling:**
	 * Handles deferred geometry updates when new geometry was set via the setter.
	 * This allows geometry changes during rendering without breaking the rendering loop.
	 * 
	 * **Scene Integration Notes:**
	 * - Called by Scene during both opaque and transparent rendering passes
	 * - Individual renderables should not modify global blend state here
	 * - Scene manages blend state transitions between opaque and transparent passes
	 * - Focus on renderable-specific uniforms and vertex array binding
	 * 
	 * **WebGL State Responsibilities:**
	 * - Renderable: VAO binding, model matrix uniforms, texture binding
	 * - Scene: Blend state, depth mask, view/projection matrices
	 * - Renderer: Program activation, global WebGL state management
	 * 
	 * @param {WebGLRenderer} renderer - The WebGL renderer managing the rendering context
	 */
	setShaderState(renderer) {
		// Handle deferred geometry replacement from geometry setter
		// This allows safe geometry updates during the rendering loop
		if (this._new_geometry) {
			if (this._geometry.isInitialized) this._geometry.destroy(renderer);
			this._geometry = this._new_geometry;
			this._geometry.initialize(renderer);
			this._new_geometry = null;
		}

		// Activate this renderable's vertex array and set model matrix
		renderer.activateVertexArray(this._geometry.vao);
		renderer._context.uniformMatrix4fv(this._model_uniform_location, false, this.worldModel.matrix);
	}

	/** @param {WebGLRenderer} renderer - Unbind Vertex Array Object and post-draw cleanup. */
	cleanShaderState(renderer) {
		renderer.activateVertexArray(null);
	}

	/** @param {WebGLRenderer} renderer - Issue draw call for this renderable. */
	render(renderer) {
		this._geometry.render(renderer);
	}

	/**
	 * Determines if this renderable requires blending based on its geometry and textures.
	 * 
	 * **Automatic Transparency Detection:**
	 * This utility helps determine when a renderable should request transparency
	 * based on its material properties, geometry characteristics, or texture content.
	 * 
	 * **Common Transparency Indicators:**
	 * - Material opacity less than 1.0
	 * - Textures with alpha channels
	 * - Alpha test/discard in shaders
	 * - Additive or custom blend modes
	 * 
	 * @returns {boolean} True if this renderable likely needs transparent rendering
	 */
	requiresBlending() {
		// Check geometry for transparency indicators
		if (this._geometry && this._geometry.hasAlphaVertices) {
			return true;
		}
		
		// Check for alpha textures (implementation would depend on texture system)
		// This is a placeholder for texture-based transparency detection
		// In a complete implementation, this would check bound textures for alpha channels
		
		// Override in subclasses for specific transparency logic
		return false;
	}

	/**
	 * Deletes the geometry and the vertex array object used from GPU memory.
	 * The Renderable can still be re-initialized later.
	 */
	destroy() {
		this._geometry.destroy();
		super.destroy();
	}

}
