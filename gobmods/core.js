(function(window, document, undefined) {
	'use strict';

	var Goblin = window.Goblin;

	Goblin.prototype.G = function(selector) {
		if(selector.charAt(0) === "#") {
			return document.getElementById(selector.substr(1));
		} else if(selector.charAt(0) === ".") {
			return document.getElementsByClassName(selector.substr(1));
		} else {
			return document.getElementsByTagName(selector);
		}
		return undefined;
	};

	Goblin.prototype.onLoaded = function(callback) {
		if(document.readyState === 'complete') callback();
		else window.addEventListener('load', callback);
	}

	Goblin.prototype.onDOMReady = function(callback) {
		if(document.readyState === 'interactive') callback();
		else window.addEventListener('DOMContentLoaded', callback);
	}
	
	Goblin.prototype.now = (function() {
		var p = window.performance || {};
		var now = p.now || p.mozNow || p.msNow || p.oNow || p.webkitNow;
		return now ? now.bind(p) : function() { return new Date().getTime(); };
	})();

	Goblin.prototype.relativeMousePosition = function(mouse_event, target) {
		var target = target || mouse_event.target;
		var x = mouse_event.clientX, y = mouse_event.clientY;
		var rect = target.getBoundingClientRect();
		return [x - rect.left, y - rect.top];
	}


	Goblin.prototype.requestAnimFrame = (function() {
		var raf = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequetAnimationFrame;

		return raf ? raf.bind(window) : function(callback) { window.setTimeout(callback, 1000/60); };
	})();

	Goblin.prototype.cancelAnimFrame = (function() {
		var caf = window.cancelAnimationFrame || window.cancelRequestAnimationFrame ||
			window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
			window.mozCancelAnimationFrame || window.mozCancelAnimationFrame;

			return caf.bind(window);
	})();

	window.Goblin = Goblin;

})(this, this.document);