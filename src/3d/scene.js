/**
 * @file Scene
 *
 * @author noodep
 * @author jdiemert
 * @version 0.27
 */

import Renderable from '../gl/renderable.js';
import Object3D from './object3d.js';
import Vec3 from '../math/vec3.js';

/**
 * Scene to render a hierarchy of Renderables using a two-pass rendering algorithm.
 *
 * **Rendering Pipeline:**
 * 1. **Opaque Pass**: Renders all non-transparent objects with depth testing and writing enabled
 * 2. **Transparent Pass**: Renders transparent objects back-to-front with blending enabled and depth writes disabled
 *
 * **Three-Cache System:**
 * - `_program_cache`: Opaque renderables grouped by shader program for efficient batching
 * - `_blend_program_cache`: Transparent renderables requiring alpha blending
 * - `_hidden_program_cache`: Temporarily hidden renderables that remain initialized for quick restoration
 *
 * **Transparency Sorting:**
 * - **Enabled (default)**: Transparent objects are depth-sorted for correct alpha blending but requires CPU sorting overhead each frame
 * - **Disabled**: No sorting overhead but may produce visual artifacts with overlapping transparent objects
 * - **Strategies**: Supports Z-coordinate sorting (fast) or eye-space distance sorting (accurate)
 *
 * **Performance Considerations:**
 * - Sorting cost scales with number of transparent objects (O(n log n))
 * - Disable sorting for scenes with few overlapping transparent objects
 * - Use object pooling and batch renderables by shader program to minimize state changes
 *
 * **Usage Examples:**
 * ```javascript
 * // Enable distance-based sorting for complex camera movements
 * scene.setDepthSortStrategy('distance');
 *
 * // Disable sorting for performance in simple scenes
 * scene.setTransparentSorting(false);
 * ```
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

		/**
		 * @type {Map<string, Set<Renderable>>}
		 * Program → Set of renderables that require blending (transparent rendering).
		 * These are rendered in a separate pass after opaque renderables.
		 */
		this._blend_program_cache = new Map();

		/**
		 * @type {boolean}
		 * Feature flag to enable depth sorting of transparent objects for proper alpha compositing.
		 */
		this._sort_transparents = true;

		/**
		 * @type {string|function}
		 * Strategy for computing depth in transparent object sorting.
		 * - 'z': Fast camera-space Z coordinate (may cause issues with camera rotations)
		 * - 'distance': Eye-space distance from camera (more accurate, slightly slower)
		 * - function: Custom depth calculation function(renderable) => number
		 */
		this._depthSortStrategy = 'distance';

		/**
		 * @type {WeakMap<Renderable, string>}
		 * Tracks which cache ('opaque'|'blend') hidden renderables came from.
		 */
		this._hidden_prev_cache = new WeakMap();

		/**
		 * @type {Map<string, Renderable>}
		 * Fast lookup map for renderables by ID to improve _resolveRenderable performance.
		 */
		this._renderables_by_id = new Map();

		/**
		 * @type {WeakSet<Renderable>}
		 * Set of renderables for which blend event notifications should be suppressed.
		 * Used to prevent re-entrant blend handling when Scene APIs update blendPreference.
		 */
		this._squelchBlendEvents = new WeakSet();

		/**
		 * @type {WeakMap<Renderable, number>}
		 * Frame-based cache of computed depth values to avoid expensive recalculation
		 * during sorting. Cleared at the start of each render cycle.
		 */
		this._depthCache = new WeakMap();

		/**
		 * @type {Renderable[]}
		 * Reusable array for collecting blend renderables to reduce GC pressure.
		 * @private
		 */
		this._blendRenderablesPool = [];

		// Private instance symbols used to store the bound 'add' and 'remove'
		// event handlers on each parent object so that the listeners can be
		// removed when an object is removed from the scene.
		this._add_handler_symbol = Symbol(`${this.id} add`);
		this._remove_handler_symbol = Symbol(`${this.id} remove`);
		this._blend_handler_symbol = Symbol(`${this.id} blend`);
		this._program_handler_symbol = Symbol(`${this.id} program`);
	}

	/**
	 * Returns an array of all visible (drawn) renderables in this scene, including both opaque and blend renderables, in no particular order.
	 * @returns {Renderable[]}
	 */
	getRenderables() {
		const renderables = [];
		const collect = (map) => {
			for (let cache of map.values()) {
				for (let renderable of cache) renderables.push(renderable);
			}
		};
		collect(this._program_cache);
		collect(this._blend_program_cache);
		return renderables;
	}

	/**
	 * Returns an array of all visible (drawn) renderables in this scene, including both opaque and blend renderables, in no particular order.
	 * This is an alias for getRenderables() with a more descriptive name.
	 * @returns {Renderable[]}
	 */
	getVisibleRenderables() {
		return this.getRenderables();
	}

	/**
	 * Returns an array of all opaque (non-blend) renderables in this scene.
	 * @returns {Renderable[]}
	 */
	getOpaqueRenderables() {
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
	 * Returns an array of all blend (transparent) renderables in this scene.
	 * @returns {Renderable[]}
	 */
	getBlendRenderables() {
		const renderables = [];
		for (let cache of this._blend_program_cache.values()) {
			for (let renderable of cache) {
				renderables.push(renderable);
			}
		}
		return renderables;
	}

	/**
	 * Returns an array of all renderables known to the scene (visible + hidden + blend).
	 * @returns {Renderable[]}
	 */
	getAllRenderables() {
		const renderables = [];
		const seen = new Set();

		// Collect from all caches without duplication
		const collectFromCache = (cache) => {
			for (let programRenderables of cache.values()) {
				for (let renderable of programRenderables) {
					if (!seen.has(renderable.id)) {
						seen.add(renderable.id);
						renderables.push(renderable);
					}
				}
			}
		};

		collectFromCache(this._program_cache);
		collectFromCache(this._hidden_program_cache);
		collectFromCache(this._blend_program_cache);

		return renderables;
	}

	/**
	 * Sets whether transparent objects should be depth-sorted during rendering.
	 *
	 * Trade-offs:
	 * - Enabled: Ensures correct alpha blending of overlapping transparent objects
	 *   but adds CPU sorting overhead each frame
	 * - Disabled: Better performance but may produce visual artifacts with
	 *   overlapping transparent objects (order-dependent transparency issues)
	 *
	 * @param {boolean} enabled - Whether to enable transparent object sorting
	 */
	setTransparentSorting(enabled) {
		this._sort_transparents = Boolean(enabled);
	}

	/**
	 * Gets whether transparent objects are currently being depth-sorted.
	 * @returns {boolean} True if transparent sorting is enabled
	 */
	getTransparentSorting() {
		return this._sort_transparents;
	}

	/**
	 * Sets the depth sorting strategy for transparent objects.
	 *
	 * @param {string|function} strategy - The depth calculation strategy:
	 *   - 'z': Fast camera-space Z coordinate (may cause issues with camera rotations)
	 *   - 'distance': Eye-space distance from camera (more accurate, slightly slower)
	 *   - function: Custom depth calculation function(renderable) => number
	 */
	setDepthSortStrategy(strategy) {
		if (typeof strategy === 'string' && !['z', 'distance'].includes(strategy)) {
			throw new Error(`Invalid depth sort strategy: ${strategy}. Use 'z', 'distance', or a custom function.`);
		}
		this._depthSortStrategy = strategy;
	}

	/**
	 * Gets the current depth sorting strategy.
	 * @returns {string|function} The current depth sorting strategy
	 */
	getDepthSortStrategy() {
		return this._depthSortStrategy;
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
			if (object.blendPreference) this._addRenderableToBlendCache(object);
			else this._addRenderableToProgramCache(object);

			// Listen for blend preference changes (guard against multiple initialization)
			if (!object[this._blend_handler_symbol]) {
				const blendHandler = (shouldBlend) => {
					// Ignore blend events that originate from Scene APIs to prevent re-entrant handling
					if (this._squelchBlendEvents.has(object)) {
						return;
					}

					if (shouldBlend) {
						this.makeRenderableBlend(object);
					} else {
						this.makeRenderableOpaque(object);
					}
				};
				object.addListener('blend', blendHandler);
				object[this._blend_handler_symbol] = blendHandler;
			}

			// Listen for program changes (guard against multiple initialization)
			if (!object[this._program_handler_symbol]) {
				const programHandler = (programChange) => {
					// Handle both old format (just new program) and new format ({old, new})
					const oldProgram = (typeof programChange === 'object') ? programChange.old : object.program;
					const newProgram = (typeof programChange === 'object') ? programChange.new : programChange;

					// Determine current cache location
					const wasInBlend = this._isInBlendCache(object);
					const wasInHidden = this._isInHiddenCache(object);

					// Remove from old program buckets - use identity-based removal for legacy events
					if (typeof programChange === 'object') {
						// New format: use targeted removal with old program name
						this._removeRenderableFromProgramCacheByIdentity(object, oldProgram);
						this._removeRenderableFromBlendCacheByIdentity(object, oldProgram);
						this._removeRenderableFromHiddenCacheByIdentity(object, oldProgram);
					} else {
						// Legacy format: use identity-based removal across all program buckets
						this._removeRenderableFromProgramCacheByIdentity(object);
						this._removeRenderableFromBlendCacheByIdentity(object);
						this._removeRenderableFromHiddenCacheByIdentity(object);
					}

					// Re-add to appropriate cache with new program
					if (wasInHidden) {
						this._addRenderableToHiddenCache(object);
					} else if (wasInBlend) {
						this._addRenderableToBlendCache(object);
					} else {
						this._addRenderableToProgramCache(object);
					}
				};
				object.addListener('program', programHandler);
				object[this._program_handler_symbol] = programHandler;
			}
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
	 * Removes any renderables from all caches (visible, hidden, and blend).
	 *
	 * @param {Object3D} object
	 */
	uninitializeObject3D(object) {
		if (object instanceof Renderable) {
			this._removeRenderableFromProgramCache(object);
			this._removeRenderableFromHiddenCache(object);
			this._removeRenderableFromBlendCache(object);

			// Remove blend event listener
			const blendHandler = object[this._blend_handler_symbol];
			if (blendHandler) {
				object.removeListener('blend', blendHandler);
				delete object[this._blend_handler_symbol];
			}

			// Remove program event listener
			const programHandler = object[this._program_handler_symbol];
			if (programHandler) {
				object.removeListener('program', programHandler);
				delete object[this._program_handler_symbol];
			}
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
	 * Render this Scene using a two-pass rendering algorithm optimized for transparency.
	 *
	 * **Pass 1 - Opaque Objects:**
	 * - Renders all non-transparent objects with depth testing and writing enabled
	 * - Objects are batched by shader program to minimize state changes
	 * - Establishes depth buffer for proper transparent object sorting
	 *
	 * **Pass 2 - Transparent Objects:**
	 * - Saves and modifies WebGL state for alpha blending
	 * - Disables depth writes to prevent transparency sorting issues
	 * - Sorts objects back-to-front using configurable depth strategy
	 * - Groups by program while maintaining depth order to minimize shader switches
	 * - Restores complete WebGL state after rendering
	 *
	 * @param {object} renderer - The WebGL renderer instance
	 */
	render(renderer) {
		// Validate that we have an active camera before rendering
		const camera = this._cameras[this._active_camera];
		if (!camera) {
			throw new Error('No active camera set for Scene. Call addCamera() and set a valid _active_camera index.');
		}

		// Clear depth cache for fresh calculations this frame
		this._depthCache = new WeakMap();

		// ===== PASS 1: OPAQUE OBJECTS =====
		// Render all non-transparent objects first to establish depth buffer.
		// This provides proper occlusion for transparent objects in pass 2.
		this._program_cache.forEach((renderables, program_name) => {
			this.applyProgramState(renderer, program_name);

			for (let renderable of renderables) {
				renderable.setShaderState(renderer);
				renderable.render(renderer);
				renderable.cleanShaderState(renderer);
			}
		});

		// ===== PASS 2: TRANSPARENT OBJECTS =====
		// Render transparent objects with alpha blending if any exist
		if (this._blend_program_cache.size > 0) {
			// SAVE WEBGL STATE: Capture current blend settings for complete restoration
			const gl = renderer._context;
			const wasBlendEnabled = gl.isEnabled(gl.BLEND);
			const prevDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);

			// Capture separate RGB and Alpha blend state for advanced blend modes
			const prevBlendSrcRGB = gl.getParameter(gl.BLEND_SRC_RGB);
			const prevBlendDstRGB = gl.getParameter(gl.BLEND_DST_RGB);
			const prevBlendSrcAlpha = gl.getParameter(gl.BLEND_SRC_ALPHA);
			const prevBlendDstAlpha = gl.getParameter(gl.BLEND_DST_ALPHA);
			const prevBlendEquationRGB = gl.getParameter(gl.BLEND_EQUATION_RGB);
			const prevBlendEquationAlpha = gl.getParameter(gl.BLEND_EQUATION_ALPHA);

			// CONFIGURE TRANSPARENCY STATE: Enable blending and disable depth writes
			// Depth writes must be disabled to prevent transparent surfaces from occluding
			// other transparent surfaces behind them, which would break alpha compositing
			gl.enable(gl.BLEND);
			gl.depthMask(false); // Still test depth, but don't write to depth buffer
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Standard alpha blending

			// COLLECT TRANSPARENT OBJECTS: Gather from all programs for global sorting
			// Cross-program sorting ensures correct transparency order regardless of shader
			const allBlendRenderables = this._blendRenderablesPool;
			allBlendRenderables.length = 0; // Clear previous contents (reuse array for GC efficiency)
			this._blend_program_cache.forEach((renderables, program_name) => {
				for (let renderable of renderables) {
					allBlendRenderables.push(renderable);
				}
			});

			// OPTIMIZATION: Skip expensive sorting and grouping for simple cases
			if (allBlendRenderables.length <= 1) {
				// Single or no transparent objects - render directly without sorting overhead
				for (let renderable of allBlendRenderables) {
					this.applyProgramState(renderer, renderable.program);
					renderable.setShaderState(renderer);
					renderable.render(renderer);
					renderable.cleanShaderState(renderer);
				}
			} else {
				// DEPTH SORTING: Sort transparent objects for correct alpha blending
				if (this._sort_transparents) {
					// Sort back-to-front using configurable depth strategy
					// Back-to-front order ensures proper alpha compositing where each pixel
					// accumulates transparency from farthest to nearest objects
					allBlendRenderables.sort((a, b) => {
						const depthA = this._depth(a);
						const depthB = this._depth(b);
						if (depthA !== depthB) {
							return depthB - depthA; // Back-to-front: farther objects first
						}
						// Stable sort tie-breaker using simple string comparison for performance
						return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
					});
				}

				// BATCH RENDERING: Group sorted renderables by program to minimize shader switches
				// This balances transparency correctness with rendering performance
				let currentProgram = null;
				for (let renderable of allBlendRenderables) {
					if (renderable.program !== currentProgram) {
						this.applyProgramState(renderer, renderable.program);
						currentProgram = renderable.program;
					}

					renderable.setShaderState(renderer);
					renderable.render(renderer);
					renderable.cleanShaderState(renderer);
				}
			}

			// RESTORE WEBGL STATE: Complete restoration of all blend-related state
			// This ensures the Scene doesn't interfere with other rendering systems
			gl.depthMask(prevDepthMask);
			gl.blendFuncSeparate(prevBlendSrcRGB, prevBlendDstRGB, prevBlendSrcAlpha, prevBlendDstAlpha);
			gl.blendEquationSeparate(prevBlendEquationRGB, prevBlendEquationAlpha);
			if (!wasBlendEnabled) {
				gl.disable(gl.BLEND);
			}
		}

		// Clear active shader program to prevent state leakage
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
		if (!camera) throw new Error('No active camera set for Scene.');

		program.applyState(renderer, camera.projection, camera.view);
	}

	/**
	 * Hide a renderable by moving it from the visible caches (regular or blend)
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

		// Record which cache the renderable came from before hiding
		if (this._isInBlendCache(renderable)) {
			this._hidden_prev_cache.set(renderable, 'blend');
		} else if (this._isInProgramCache(renderable)) {
			this._hidden_prev_cache.set(renderable, 'opaque');
		}

		// Remove from visible caches (regular or blend) and stash to hidden.
		const removedFromMain = this._removeRenderableFromProgramCache(renderable);
		const removedFromBlend = this._removeRenderableFromBlendCache(renderable);
		this._addRenderableToHiddenCache(renderable);
		// Notify the renderable (compat listeners) that its visibility changed.
		renderable.notify('visibility', false);
		return removedFromMain || removedFromBlend;
	}

	/**
	 * Show a previously hidden renderable by moving it from the hidden cache
	 * back to the appropriate visible cache (regular or blend based on preference).
	 *
	 * Uses the WeakMap record of previous cache context first, then falls back
	 * to the renderable's current blendPreference if no record exists.
	 *
	 * @param {Renderable|string} renderable_or_id - The renderable instance or its id.
	 * @returns {boolean} - True if a renderable was restored; false otherwise.
	 */
	makeRenderableVisible(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;

		// If it's already visible, do nothing.
		if (this._isInProgramCache(renderable) || this._isInBlendCache(renderable)) return true;

		const removed = this._removeRenderableFromHiddenCache(renderable);
		if (!removed) return false;

		// Check if there's a record of which cache this came from
		const prevCache = this._hidden_prev_cache.get(renderable);

		if (prevCache) {
			// Restore to the previous cache
			if (prevCache === 'blend') {
				this._addRenderableToBlendCache(renderable);
			} else {
				this._addRenderableToProgramCache(renderable);
			}
			// Clear the record
			this._hidden_prev_cache.delete(renderable);
		} else {
			// Fallback to current blendPreference when no record exists
			const currentBlendPreference = renderable.blendPreference;

			if (currentBlendPreference !== undefined && currentBlendPreference) {
				this._addRenderableToBlendCache(renderable);
			} else {
				// Default to opaque cache (undefined or false blendPreference)
				this._addRenderableToProgramCache(renderable);
			}
		}

		// Notify the renderable (compat listeners) that its visibility changed.
		renderable.notify('visibility', true);
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
	 * Returns whether a renderable is currently considered visible (i.e., in any draw cache).
	 * @param {Renderable|string} renderable_or_id
	 * @returns {boolean}
	 */
	isRenderableVisible(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;
		return this._isInProgramCache(renderable) || this._isInBlendCache(renderable);
	}

	/**
	 * Move a renderable to the blend cache for transparent rendering.
	 *
	 * **Recommended Approach vs Scene API:**
	 * While renderables can request blend state changes via their `blendPreference`
	 * property (preferred for object-driven transparency), this Scene API method provides
	 * external control for programmatic blend state management when needed.
	 *
	 * **Squelch Mechanism:**
	 * Uses a WeakSet to prevent re-entrant blend event handling when Scene APIs update
	 * renderable state. This prevents infinite loops between Scene and Renderable
	 * blend preference notifications.
	 *
	 * **Cache Management:**
	 * - Updates renderable's blendPreference to maintain consistency
	 * - Handles hidden renderables by updating cache preference records
	 * - Moves between opaque and blend caches as needed
	 *
	 * @param {Renderable|string} renderable_or_id - The renderable instance or its id.
	 * @returns {boolean} - True if a renderable was moved; false otherwise.
	 */
	makeRenderableBlend(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;

		// Squelch blend events to prevent re-entrant handling
		this._squelchBlendEvents.add(renderable);
		try {
			// Always update the renderable's blend preference to match the new state
			renderable._setBlendPreferenceQuiet(true);

			// If it's already in blend cache, do nothing more.
			if (this._isInBlendCache(renderable)) return true;

			// If hidden, update the cache preference record for proper restoration
			if (this._isInHiddenCache(renderable)) {
				this._hidden_prev_cache.set(renderable, 'blend');
				return true;
			}

			// Remove from opaque cache and add to blend cache
			this._removeRenderableFromProgramCache(renderable);
			this._addRenderableToBlendCache(renderable);

			return true;
		} finally {
			// Always remove squelch flag
			this._squelchBlendEvents.delete(renderable);
		}
	}

	/**
	 * Move a renderable to the opaque cache for normal rendering.
	 *
	 * **Recommended Approach vs Scene API:**
	 * While renderables can request blend state changes via their `blendPreference`
	 * property (preferred for object-driven transparency), this Scene API method provides
	 * external control for programmatic blend state management when needed.
	 *
	 * **Squelch Mechanism:**
	 * Uses a WeakSet to prevent re-entrant blend event handling when Scene APIs update
	 * renderable state. This maintains proper event flow and prevents infinite loops.
	 *
	 * **Performance Benefits:**
	 * Moving objects to opaque cache improves performance by:
	 * - Avoiding expensive transparency sorting
	 * - Enabling depth buffer writes for better occlusion
	 * - Allowing more efficient batching with other opaque objects
	 *
	 * @param {Renderable|string} renderable_or_id - The renderable instance or its id.
	 * @returns {boolean} - True if a renderable was moved; false otherwise.
	 */
	makeRenderableOpaque(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;

		// Squelch blend events to prevent re-entrant handling
		this._squelchBlendEvents.add(renderable);
		try {
			// Always update the renderable's blend preference to match the new state
			renderable._setBlendPreferenceQuiet(false);

			// If it's already in opaque cache, do nothing more.
			if (this._isInProgramCache(renderable)) return true;

			// If hidden, update the cache preference record for proper restoration
			if (this._isInHiddenCache(renderable)) {
				this._hidden_prev_cache.set(renderable, 'opaque');
				return true;
			}

			// Remove from blend cache and add to opaque cache
			this._removeRenderableFromBlendCache(renderable);
			this._addRenderableToProgramCache(renderable);

			return true;
		} finally {
			// Always remove squelch flag
			this._squelchBlendEvents.delete(renderable);
		}
	}

	/**
	 * Toggle blend state of a renderable.
	 *
	 * Note: While renderables can request blend state changes via their `blendPreference`
	 * property (recommended approach), this Scene API method provides external control
	 * for programmatic blend state management when needed.
	 *
	 * @param {Renderable|string} renderable_or_id
	 * @param {boolean} should_blend
	 * @returns {boolean}
	 */
	setRenderableBlend(renderable_or_id, should_blend) {
		return should_blend
			? this.makeRenderableBlend(renderable_or_id)
			: this.makeRenderableOpaque(renderable_or_id);
	}

	/**
	 * Returns whether a renderable is currently in the blend cache.
	 * @param {Renderable|string} renderable_or_id
	 * @returns {boolean}
	 */
	isRenderableBlend(renderable_or_id) {
		const renderable = this._resolveRenderable(renderable_or_id);
		if (!renderable) return false;
		return this._isInBlendCache(renderable);
	}

	/**
	 * Internal: remove a renderable from any cache based on identity.
	 * Useful when the renderable's program may have changed.
	 * @param {Map<string, Set>} cacheMap - The cache map to search
	 * @param {Renderable} renderable - The renderable to remove
	 * @returns {boolean} - True if removed from any bucket
	 * @private
	 */
	_removeRenderableFromAnyCache(cacheMap, renderable) {
		let removed = false;
		for (let [programName, renderableSet] of cacheMap) {
			if (renderableSet.delete(renderable)) {
				removed = true;
				// Clean up empty program buckets
				if (renderableSet.size === 0) {
					cacheMap.delete(programName);
				}
			}
		}
		return removed;
	}

	/**
	 * Internal: remove a renderable from a specific program cache or any cache if program not provided.
	 * @param {Renderable} renderable - The renderable to remove
	 * @param {string} [programName] - Optional specific program name to remove from
	 * @returns {boolean} - True if removed
	 * @private
	 */
	_removeRenderableFromProgramCacheByIdentity(renderable, programName) {
		if (programName) {
			// Remove from specific program bucket
			if (!this._program_cache.has(programName)) return false;
			const cache = this._program_cache.get(programName);
			const did_delete = cache.delete(renderable);
			if (cache.size === 0) {
				this._program_cache.delete(programName);
			}
			return did_delete;
		} else {
			// Remove from any program bucket
			return this._removeRenderableFromAnyCache(this._program_cache, renderable);
		}
	}

	/**
	 * Internal: remove a renderable from a specific blend cache or any cache if program not provided.
	 * @param {Renderable} renderable - The renderable to remove
	 * @param {string} [programName] - Optional specific program name to remove from
	 * @returns {boolean} - True if removed
	 * @private
	 */
	_removeRenderableFromBlendCacheByIdentity(renderable, programName) {
		if (programName) {
			// Remove from specific program bucket
			if (!this._blend_program_cache.has(programName)) return false;
			const cache = this._blend_program_cache.get(programName);
			const did_delete = cache.delete(renderable);
			if (cache.size === 0) {
				this._blend_program_cache.delete(programName);
			}
			return did_delete;
		} else {
			// Remove from any program bucket
			return this._removeRenderableFromAnyCache(this._blend_program_cache, renderable);
		}
	}

	/**
	 * Internal: remove a renderable from a specific hidden cache or any cache if program not provided.
	 * @param {Renderable} renderable - The renderable to remove
	 * @param {string} [programName] - Optional specific program name to remove from
	 * @returns {boolean} - True if removed
	 * @private
	 */
	_removeRenderableFromHiddenCacheByIdentity(renderable, programName) {
		if (programName) {
			// Remove from specific program bucket
			if (!this._hidden_program_cache.has(programName)) return false;
			const cache = this._hidden_program_cache.get(programName);
			const did_delete = cache.delete(renderable);
			if (cache.size === 0) {
				this._hidden_program_cache.delete(programName);
			}
			return did_delete;
		} else {
			// Remove from any program bucket
			return this._removeRenderableFromAnyCache(this._hidden_program_cache, renderable);
		}
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

		// Add to ID map for fast lookup
		this._renderables_by_id.set(renderable.id, renderable);
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

		// Remove from ID map if this was the last cache containing this renderable
		if (did_delete && !this._isInBlendCache(renderable) && !this._isInHiddenCache(renderable)) {
			this._renderables_by_id.delete(renderable.id);
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

		// Add to ID map for fast lookup
		this._renderables_by_id.set(renderable.id, renderable);
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

		// Remove from ID map if this was the last cache containing this renderable
		if (did_delete && !this._isInProgramCache(renderable) && !this._isInBlendCache(renderable)) {
			this._renderables_by_id.delete(renderable.id);
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
	 * Internal: add a renderable to the blend cache.
	 * @param {Renderable} renderable
	 * @private
	 */
	_addRenderableToBlendCache(renderable) {
		const program_name = renderable.program;
		if (!this._blend_program_cache.has(program_name))
			this._blend_program_cache.set(program_name, new Set());
		this._blend_program_cache.get(program_name).add(renderable);

		// Add to ID map for fast lookup
		this._renderables_by_id.set(renderable.id, renderable);
	}

	/**
	 * Internal: remove a renderable from the blend cache.
	 * @param {Renderable} renderable
	 * @returns {boolean} - True if removed from blend cache.
	 * @private
	 */
	_removeRenderableFromBlendCache(renderable) {
		const program_name = renderable.program;
		if (!this._blend_program_cache.has(program_name)) return false;

		const cache = this._blend_program_cache.get(program_name);
		const did_delete = cache.delete(renderable);

		if (cache.size === 0) {
			this._blend_program_cache.delete(program_name);
		}

		// Remove from ID map if this was the last cache containing this renderable
		if (did_delete && !this._isInProgramCache(renderable) && !this._isInHiddenCache(renderable)) {
			this._renderables_by_id.delete(renderable.id);
		}

		return did_delete;
	}

	/**
	 * Internal: check if a renderable is in the blend cache.
	 * @param {Renderable} renderable
	 * @returns {boolean}
	 * @private
	 */
	_isInBlendCache(renderable) {
		const program_name = renderable.program;
		return this._blend_program_cache.has(program_name) &&
			this._blend_program_cache.get(program_name).has(renderable);
	}

	/**
	 * Internal: resolve a renderable from an instance or an id string.
	 * Searches visible, hidden, and blend caches.
	 * @param {Renderable|string} renderable_or_id
	 * @returns {Renderable|null}
	 * @private
	 */
	_resolveRenderable(renderable_or_id) {
		if (renderable_or_id instanceof Renderable) return renderable_or_id;
		const id = String(renderable_or_id);

		// Fast lookup using ID map
		const renderable = this._renderables_by_id.get(id);
		if (renderable) return renderable;

		// Fallback to full search if not in ID map
		for (let r of this.getAllRenderables()) {
			if (r.id === id) return r;
		}
		return null;
	}

	/**
	 * Internal: compute depth value for a renderable for transparency sorting.
	 *
	 * **Depth Strategies:**
	 * - **'z'**: Fast camera-space Z coordinate. May cause misordering when camera rotates
	 *   such that objects' Z values cross even though distances remain consistent.
	 * - **'distance'**: True eye-space distance from camera position. More accurate for
	 *   complex camera movements but slightly more expensive (sqrt calculation).
	 * - **function**: Custom depth calculation function for specialized sorting needs.
	 *
	 * **Bounding Sphere vs Transform Origin:**
	 * Uses bounding sphere center when available for better sorting of large/complex meshes.
	 * Falls back to transform origin (world matrix translation) for simple objects.
	 *
	 * @param {Renderable} renderable - The renderable to compute depth for
	 * @returns {number} Depth value for sorting (interpretation depends on strategy)
	 * @private
	 */
	_depth(renderable) {
		// Check cache first to avoid expensive recalculation during sorting
		if (this._depthCache.has(renderable)) {
			return this._depthCache.get(renderable);
		}

		const camera = this._cameras[this._active_camera];
		if (!camera) return 0;

		let depthValue;

		// Handle custom depth function strategy
		if (typeof this._depthSortStrategy === 'function') {
			depthValue = this._depthSortStrategy(renderable);
			this._depthCache.set(renderable, depthValue);
			return depthValue;
		}

		// STEP 1: Get world-space position for depth calculation
		// Prefer bounding sphere center for large/complex meshes, fallback to transform origin
		let worldPos;
		if (renderable.geometry && renderable.geometry.boundingSphere) {
			// Use bounding sphere center transformed to world space
			// This provides better sorting for meshes that extend far from their origin
			const boundingCenter = renderable.geometry.boundingSphere.center;
			worldPos = boundingCenter.transform(renderable.worldModel);
		} else {
			// Fallback to transform origin (translation component of world matrix)
			// World matrix stores translation in the last column (elements 12, 13, 14)
			worldPos = new Vec3(
				renderable.worldModel.matrix[12],
				renderable.worldModel.matrix[13],
				renderable.worldModel.matrix[14]
			);
		}

		if (this._depthSortStrategy === 'distance') {
			// STRATEGY: Eye-space distance - most accurate for all camera orientations
			// Extract camera world position from view matrix inverse or camera object
			// For efficiency, we compute distance-squared to avoid sqrt() unless debugging
			const cameraSpacePos = worldPos.transform(camera.view);

			// Distance-squared from camera (avoids expensive sqrt for comparison)
			depthValue = cameraSpacePos.x * cameraSpacePos.x +
			             cameraSpacePos.y * cameraSpacePos.y +
			             cameraSpacePos.z * cameraSpacePos.z;
		} else {
			// STRATEGY: Camera-space Z coordinate - faster but less robust
			// Transform world position to camera space and use Z component
			const cameraSpacePos = worldPos.transform(camera.view);
			depthValue = cameraSpacePos.z;

		}

		// Cache the computed value for this frame
		this._depthCache.set(renderable, depthValue);
		return depthValue;
	}

	_addEventHandler(renderer, parent, child) {
		this.initializeObject3D(renderer, child);
	}

	_removeEventHandler(parent, child) {
		this.uninitializeObject3D(child);
	}

}
