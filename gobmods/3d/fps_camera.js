(function(window, document, undefined){
	'use strict';

	var DEFAULT_ACCELERATION = 0.0002;

	function FPSCamera(camera, element) {
		if(!(camera instanceof _.Camera)) throw new Error('You must pass a camera object to instanciate a FPS like camera');
		this._camera = camera;
		var el = element || window;
		this._acceleration = DEFAULT_ACCELERATION;

		el.onkeydown = this.keydownhandler.bind(this);
		el.onkeyup = this.keyuphandler.bind(this);
	}

	/**
	 * Set the acceleration numerical value
	 * @param {number} acceleration new acceleration value
	 */
	FPSCamera.prototype.setAccelerationValue = function(acceleration) {
		this._acceleration = acceleration;
	}



	/**
	 * Handles key down events and set camera movement accordingly
	 * @param  {KeyEvent} e key event passed by the browser.
	 *
	 * 		Reminder : 	w 		-> 87
	 * 					a 		-> 65
	 * 					s 		-> 83
	 * 					d 		-> 68
	 * 					space	-> 32
	 * 					shift	-> 16
	 */
	FPSCamera.prototype.keydownhandler = function(e) {
		if(e.keyCode == 87) {
			this._camera.setForwardAcceleration(this._acceleration);
		} else if ( e. keyCode == 83) {
			this._camera.setForwardAcceleration(-this._acceleration);
		} else if ( e. keyCode == 65) {
			this._camera.setLateralAcceleration(-this._acceleration);
		} else if ( e. keyCode == 68) {
			this._camera.setLateralAcceleration(this._acceleration);
		} else if ( e. keyCode == 32) {
			this._camera.setVerticalAcceleration(-this._acceleration);
		} else if ( e. keyCode == 16) {
			this._camera.setVerticalAcceleration(this._acceleration);
		} else if ( e.keyCode == 66) {
			this.rotate = !this.rotate;
		} else if ( e.keyCode == 84) {
			this.transition = !this.transition;
			this.sens *= -1;
		}
	}

	/**
	 * Handles key up events and stop related camera motion
	 * @param  {KeyEvent} e key event passed by the browser.
	 */
	FPSCamera.prototype.keyuphandler = function(e) {
		if(e.keyCode == 87 || e.keyCode == 83) {
			this._camera.setForwardAcceleration(0);
		} else if (e.keyCode == 65 ||  e.keyCode == 68) {
			this._camera.setLateralAcceleration(0);
		} else if (e.keyCode == 32 || e.keyCode == 16) {
			this._camera.setVerticalAcceleration(0);
		}
	}

	window.Goblin.addModule('FPSCamera', FPSCamera);

})(this, this.document);
