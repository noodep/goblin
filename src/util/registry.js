/**
 * @file Utility to globally register objects with IDs for easy lookup/iteration.
 *
 * @author Noodep
 * @author Zach Peltzer
 * @version 0.08
 */

/**
 * Use a file-scoped symbol to access the map for extra security.
 */
const REGISTRY_MAP = Symbol('registry_map');

/**
 * Stores a map between IDs of objects and the objects themselves.
 *
 * Objects which should be garbage collected have to be removed (unregistered)
 * from here before they will be destroyed.
 */
export default class Registry {

	/**
	 * Constructs a new registry with its own private mapping.
	 */
	constructor() {
		this[REGISTRY_MAP] = new Map();
	}

	/**
	 * Register an object with an ID. An error is thrown if the ID is already
	 * registered.
	 */
	register(id, object) {
		if (this.has(id)) {
			throw new Error(`ID ${id} has already been registered.`);
		}

		this[REGISTRY_MAP].set(id, object);
	}

	/**
	 * Unregister an ID and the associated object. Returns the object
	 * registered with the ID, if any.
	 */
	unregister(id) {
		return this[REGISTRY_MAP].delete(id);
	}

	/**
	 * Returns whether or not an ID has been registered.
	 */
	has(id) {
		return this[REGISTRY_MAP].has(id);
	}

	/**
	 * Searches for an ID and returns the object registered with it, if any.
	 */
	search(id) {
		return this[REGISTRY_MAP].get(id);
	}

	/**
	 * Returns an iterator over all the registered IDs.
	 */
	ids() {
		return this[REGISTRY_MAP].keys();
	}

	/**
	 * Returns an iterator over all registered objects.
	 */
	objects() {
		return this[REGISTRY_MAP].values();
	}

	/**
	 * Returns an iterator over the registered IDs and objects. Each entry is an
	 * array in the format [id, object].
	 */
	entries() {
		return this[REGISTRY_MAP].entries();
	}

}

/**
 * Aliases to a global registry and its functions.
 */
export const GLOBAL_REGISTRY = new Registry();
export const register = GLOBAL_REGISTRY.register;
export const unregister = GLOBAL_REGISTRY.unregister;
export const has = GLOBAL_REGISTRY.has;
export const search = GLOBAL_REGISTRY.search;
export const ids = GLOBAL_REGISTRY.ids;
export const objects = GLOBAL_REGISTRY.objects;
export const entries = GLOBAL_REGISTRY.entries;

