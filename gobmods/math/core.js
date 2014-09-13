(function(window, document, undefined){
	'use strict';

	window.Goblin.prototype.GUID = function(length) {
		// rfc4122 version 4 compliant GUID
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
    	});
	}

})(this, this.document);
