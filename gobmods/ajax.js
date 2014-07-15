(function(window, document, undefined){
	'use strict';

	var Goblin = window.Goblin;
	
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
		request.onreadystatechange = function () {
			if(request.readyState==4 && request.status==200)
				callback(request.responseText);
		}
		request.send();
	}

	Goblin.addModule("ajax", AJAXUtils);
})(this, this.document);