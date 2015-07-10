(function(context, undefined) {
	'use strict';

	var Goblin = context.Goblin;
	var document = context.document;

	Goblin.extend('G', function(selector) {
		if(selector.charAt(0) === "#") {
			return document.getElementById(selector.substr(1));
		} else if(selector.charAt(0) === ".") {
			return document.getElementsByClassName(selector.substr(1));
		} else {
			return document.getElementsByTagName(selector);
		}
		return undefined;
	});

	Goblin.extend('onLoaded', new Promise(function(resolve, reject) {
		if(document.readyState === 'complete') resolve();
		else context.addEventListener('load', resolve);
	}));

	Goblin.extend('onDOMReady', new Promise(function(resolve, reject) {
		if(document.readyState === 'interactive') resolve();
		else context.addEventListener('DOMContentLoaded', resolve);
	}));
	
	Goblin.extend('now', (function() {
		var p = context.performance || {};
		var now = p.now || p.mozNow || p.msNow || p.oNow || p.webkitNow;
		return now ? now.bind(p) : function() { return new Date().getTime(); };
	})());

	Goblin.extend('relativeMousePosition', function(mouse_event, target) {
		var target = target || mouse_event.target;
		var x = mouse_event.clientX, y = mouse_event.clientY;
		var rect = target.getBoundingClientRect();
		return [x - rect.left, y - rect.top];
	});


	Goblin.extend('requestAnimFrame', (function() {
		var raf = context.requestAnimationFrame ||
			context.webkitRequestAnimationFrame ||
			context.mozRequetAnimationFrame;

		return raf ? raf.bind(context) : function(callback) { context.setTimeout(callback, 1000/60); };
	})());

	Goblin.extend('cancelAnimFrame', (function() {
		var caf = context.cancelAnimationFrame || context.cancelRequestAnimationFrame ||
			context.webkitCancelAnimationFrame || context.webkitCancelRequestAnimationFrame ||
			context.mozCancelAnimationFrame || context.mozCancelAnimationFrame;

			return caf.bind(context);
	})());

	context.Goblin = Goblin;

})(this);
