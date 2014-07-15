(function(window, document, undefined){
	'use strict';

	var Goblin = window.Goblin;

	Goblin.prototype.getStyle = function(el,css_prop) {
		var ret = null; 
		if (el.currentStyle)
			ret = el.currentStyle[css_prop];
		else if (window.getComputedStyle)
			ret = document.defaultView.getComputedStyle(el,null).getPropertyValue(css_prop);
		return ret;
	}

	window.Goblin = Goblin;

})(this, this.document);