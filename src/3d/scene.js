/**
 * @fileOverview Scene.
 * @author Noodep
 * @version 0.01
 */
'use strict';

import Object3D from './object3d.js';

export default class Scene extends Object3D {

	/**
	 * @constructor
	 * @memberOf module:3d
	 * @alias Scene
	 *
	 * @param {String} [scene_id] - This scene id.
	 * @return {module:3d.Scene} - The newly created Scene.
	 */
	constructor(scene_id) {
		super(scene_id);
	}

	render(renderer) {
		this._children.forEach((object) => {
		});
	}
}
