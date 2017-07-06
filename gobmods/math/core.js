(function(context, undefined) {
	'use strict';

	G.extend('GUID', function(length) {
		// rfc4122 version 4 compliant GUID
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
    	});
	});

	G.extend('eq', function(x, y, epsilon=Number.EPSILON) {
		return Math.abs(x - y) < epsilon;
	});

})(this);
