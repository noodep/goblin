/**
 * @fileOverview A javascript utility library
 * @author Noodep
 * @version 0.3
 */

(function(context,undefined) {
	'use strict';

	var MOD_FOLDER = 'gobmods';
	var DEBUG = true;
	
	var document = context.document;
	/**
	 * @constructor
	 * @exports Goblin
	 */
	var Goblin = {};

	// Initialize serve location with current location
	var serve_location = (function() {
		var current_script = document.currentScript;
		var src = current_script ? current_script.src : '/goblin/';
		var index = src.lastIndexOf('/');
		return src.substring(0,index);
	})();

	// Export Goblin to current context
	context._ = context.G = context.Goblin = Goblin;

	/**
	 * Extends goblin capabilities.
	 * @param {String} name Name of the module.
	 * @param {Object} obj Object extending Goblin's capabilities.
	 */
	Goblin.extend = function(name, obj) {
		Goblin[name] = obj;
	};

	/**
	 * Loads modules given in argument. The callback is called when all modules
	 * are loaded.
	 * @param {Array} modules An array of modules configuration object.
	 * @param {Function} readyCallback Callback to be called when modules are
	 *     loaded.
	 */
	Goblin.gobLoad = function(modules) {
		if(!Array.isArray(modules))
			throw new Error('Please specify an array of modules');

		return Promise.all(modules.map(createScript));
	};

	function createScript(script_object) {

		return new Promise(function(resolve, reject) {
			var script_name, script_folder, script_callback;
			
			if(typeof script_object === 'string') {
				// Plain script : use default mod folder;
				script_name = script_object;
				script_folder = serve_location + '/' + MOD_FOLDER;
			} else {
				// Script object : use defined properties;
				script_name = script_object.name;
				script_folder = script_object.namespace;
			}

			var src = script_folder + '/' + script_name + '.js';

			if(DEBUG)
				console.log('Loading script with src : ' + src);

			var script = document.createElement('script');
			script.onload = resolve;
			script.src = src;
			document.head.appendChild(script);
		});
	}

})(this);
