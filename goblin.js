(function(window, document, undefined){
	'use strict';
	
	var mod_folder = 'gobmods';

	// Initialize serve location with current location
	var serve_location = (function() {
		var src = document.currentScript.src;		
		var index = src.lastIndexOf('/');
		return src.substring(0,index);
	})();

	var DEBUG = true;

	Goblin.staticModules = [];
	Goblin.loadStack = [];

	function Goblin(options) {
		options = options || {};
	}

	Goblin.addModule = function(name, module) {
		Goblin.staticModules[name] = module;
	}

	window.gobLoad = function(modules, readyCallback) {
		// export Goblin definition
		window.Goblin = Goblin;

		if(!Array.isArray(modules))
			throw new Error('Please specify an array of modules');

		Goblin.readyCallback = readyCallback;
		modules.forEach(createScript);

		Goblin.loadStack.forEach(function(script){
			document.head.appendChild(script);
		});
	}

	function createScript(script_object) {
		var script_name, script_folder, script_callback;
		// Plain script : use default mod folder;
		if(typeof script_object === 'string') {
			script_name = script_object;
			script_folder = serve_location + '/' + mod_folder;
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
		Goblin.loadStack.push(script);
		script.onload = onLoadCallback.bind(script);

		// Add custom callback if any
		if(script_object.callback)
			script.custom_callback = script_object.callback;
		script.src = src;
	}

	function onLoadCallback(e) {
		var index = Goblin.loadStack.indexOf(this);

		// Remove script from loadStack
		Goblin.loadStack.splice(index, 1);

		if(this.custom_callback)
			this.custom_callback();

		if(Goblin.loadStack.length == 0)
			finalizeAndExport();
	}

	function finalizeAndExport() {
		if(DEBUG)
			console.log('Finalizing Goblin and exporting it');

		// Expand Goblin prototype with modules objects
		Object.keys(Goblin.staticModules).forEach(function(name) {
			window.Goblin.prototype[name] = Goblin.staticModules[name];
		});

		window._ = new window.Goblin();

		// Call user defined ready callback
		if(Goblin.readyCallback) Goblin.readyCallback();
	}

})(this, this.document);