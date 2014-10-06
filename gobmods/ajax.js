(function(window, document, undefined){
	'use strict';
	
	function AJAXUtils(options) {
		options = options || {};

		if(!window.XMLHttpRequest)
			console.log("XMLHttpRequest not supported.");
	}

	AJAXUtils.prototype = {
	}

	AJAXUtils.request = function(file, callback) {
		var request = new window.XMLHttpRequest();
		request.open("GET", file, true);
		request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		request.onreadystatechange = function () {
			if(request.readyState==4 && request.status==200)
				callback(request.responseText);
		}
		request.send();
	}

	Goblin.extend('ajax', AJAXUtils);
})(this, this.document);
