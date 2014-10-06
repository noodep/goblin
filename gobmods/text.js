(function(window, document, undefined){
	'use strict';

	var Goblin = window.Goblin;

	Goblin.extend('ucfirst', function(string) {
		return  string[0].toUpperCase() + string.slice(1);
	});

})(this, this.document);
