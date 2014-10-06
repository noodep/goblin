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
	var loadStack = [];
	var readyCallback = undefined;

	// Initialize serve location with current location
	var serve_location = (function() {
		var src = document.currentScript.src;		
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
	Goblin.gobLoad = function(modules, callback) {
		if(!Array.isArray(modules))
			throw new Error('Please specify an array of modules');

		readyCallback = callback;
		modules.forEach(createScript);

		loadStack.forEach(function(script){
			document.head.appendChild(script);
		});
	};

	function createScript(script_object) {
		var script_name, script_folder, script_callback;
		// Plain script : use default mod folder;
		if(typeof script_object === 'string') {
			script_name = script_object;
			script_folder = serve_location + '/' + MOD_FOLDER;
		}
		// Script object : use defined properties;
		else {
			script_name = script_object.name;
			script_folder = script_object.namespace;
		}

		var src = script_folder + '/' + script_name + '.js';

		if(DEBUG)
			console.log('Loading script with src : ' + src);

		var script = document.createElement('script');
		loadStack.push(script);
		script.onload = onLoadCallback.bind(script);

		// Add custom callback if any
		if(script_object.callback)
			script.custom_callback = script_object.callback;
		script.src = src;
	}

	function onLoadCallback(e) {
		var index = loadStack.indexOf(this);

		// Remove script from loadStack
		loadStack.splice(index, 1);

		if(this.custom_callback)
			this.custom_callback();

		if(loadStack.length == 0)
			if(readyCallback) readyCallback();
	}

})(this);