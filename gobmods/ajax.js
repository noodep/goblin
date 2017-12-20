(function(window, document, undefined){
	'use strict';
	
	function AJAXUtils(options) {
		options = options || {};

		if(!window.XMLHttpRequest)
			console.log("XMLHttpRequest not supported.");
	}

	AJAXUtils.prototype = {
	}

	AJAXUtils.post = function(options) {
		options.method = 'POST';
		return AJAXUtils.request(options);
	}

	AJAXUtils.request = function(options) {
		var url = options.url;
		var method = options.method || 'GET';
		var data = options.data;
		var onsuccess = options.onsuccess || (() => null);
		var onerror = options.onerror || (() => null);
		var onprogress = options.onprogress;
		var onreadystatechange = options.onreadystatechange;

		var req = new XMLHttpRequest();
		req.open(method, url, true);
		req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		req.onload = function() {
			if(this.status === 200)
				onsuccess(this.response);
			else
				onerror(this.response);
		};

		req.onprogress = onprogress;
		req.onreadystatechange = onreadystatechange;
		req.send(data);
	}

	Goblin.extend('Ajax', AJAXUtils);
})(this, this.document);
