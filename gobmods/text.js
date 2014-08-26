(function(window, document, undefined){
	'use strict';

	var Goblin = window.Goblin;

	Goblin.prototype.ucfirst = function(string) {
		return  string[0].toUpperCase() + string.slice(1);
	}

	window.Goblin = Goblin;

})(this, this.document);