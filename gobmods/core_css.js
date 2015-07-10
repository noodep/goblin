(function(window, document, undefined){
	'use strict';

	var Goblin = window.Goblin;

	Goblin.extend('getStyle', function(el,css_prop) {
		var ret = null; 
		if (el.currentStyle)
			ret = el.currentStyle[css_prop];
		else if (window.getComputedStyle)
			ret = document.defaultView.getComputedStyle(el,null).getPropertyValue(css_prop);
		return ret;
	});

	Goblin.extend('getComputedStyle', function(el,css_prop) {
		return document.defaultView.getComputedStyle(el,null).getPropertyValue(css_prop);
	});

	Goblin.extend('width', function(el) {
		var pl = parseInt(Goblin.getComputedStyle(el, 'padding-left'));
		var pr = parseInt(Goblin.getComputedStyle(el, 'padding-right'));
		return el.offsetWidth - pl - pr;
	});

	Goblin.extend('height', function(el) {
		var pt = parseInt(Goblin.getComputedStyle(el, 'padding-top'));
		var pb = parseInt(Goblin.getComputedStyle(el, 'padding-bottom'));
		return el.offsetHeight - pt - pb;
	});

	Goblin.extend('HSL2RGBA', function(h, s, l, a) {
		var r, g, b;
		if(s == 0) {
			r = g = b = l; // achromatic
		}else{
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), Math.round(a * 255)];
	});

	function hue2rgb(p, q, t) {
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if(t < 1/6) return p + (q - p) * 6 * t;
		if(t < 1/2) return q;
		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	}


window.Goblin = Goblin;

})(this, this.document);
