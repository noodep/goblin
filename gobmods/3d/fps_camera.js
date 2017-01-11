(function(window, document, undefined){
	'use strict';

	var DEFAULT_ACCELERATION = 0.0003;

	function FPSCamera(camera, element) {
		if(!(camera instanceof _.Camera)) throw new Error('You must pass a camera object to instanciate a FPS like camera');
		this._camera = camera;
		var el = element || window;
		this._acceleration = DEFAULT_ACCELERATION;
		this._origin = this._camera._position.clone();

		this._movement_enabled = true;

		el.onkeydown = this.keydownhandler.bind(this);
		el.onkeyup = this.keyuphandler.bind(this);
		el.addEventListener('mousewheel', this.mouseHandler.bind(this), false);
		el.addEventListener('mousedown', this.mouseClick.bind(this), false);
		el.addEventListener('mouseup', this.mouseClick.bind(this), false);
		el.addEventListener('mousemove', this.mouseClick.bind(this), false);
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
	 *		Reminder :	w		-> 87
	 *					a		-> 65
	 *					s		-> 83
	 *					d		-> 68
	 *					space	-> 32
	 *					shift	-> 16
	 *					left	-> 37
	 *					up		-> 38
	 *					right	-> 39
	 *					down	-> 40
	 */
	FPSCamera.prototype.keydownhandler = function(e) {
		if (!this._movement_enabled) {
			return;
		}

		// if(e.keyCode == 87 || e.keyCode == 38) {
			// this._camera.setForwardAcceleration(this._acceleration);
		// } else if ( e. keyCode == 83 || e.keyCode == 38) {
			// this._camera.setForwardAcceleration(-this._acceleration);
		if (e. keyCode == 65) {
			this._camera.setLateralAcceleration(-this._acceleration);
		} else if (e. keyCode == 68) {
			this._camera.setLateralAcceleration(this._acceleration);
		} else if (e.keyCode == 87) {
			this._camera.setVerticalAcceleration(-this._acceleration);
		} else if (e.keyCode == 83) {
			this._camera.setVerticalAcceleration(this._acceleration);
		} else if (e.keyCode == 82) {
			this.goToResetLocation();
		} else if (e.keyCode == 66) {
			this.rotate = !this.rotate;
		} else if (e.keyCode == 84) {
			this.transition = !this.transition;
			this.sens *= -1;
		}
	}

	/**
	 * Handles key up events and stop related camera motion
	 * @param  {KeyEvent} e key event passed by the browser.
	 */
	FPSCamera.prototype.keyuphandler = function(e) {
		if (!this._movement_enabled) {
			return;
		}

		// if(e.keyCode == 87 || e.keyCode == 83) {
			// this._camera.setForwardAcceleration(0);
		if (e.keyCode == 65 ||  e.keyCode == 68 || e.keyCode == 39 ||  e.keyCode == 37) {
			this._camera.setLateralAcceleration(0);
		} else if (e.keyCode == 87 ||  e.keyCode == 83 || e.keyCode == 40 ||  e.keyCode == 38) {
			this._camera.setVerticalAcceleration(0);
		}
	}

	FPSCamera.prototype.mouseHandler = function(e) {
		if (!this._movement_enabled) {
			return;
		}

		e.preventDefault();

		var sign = (e.wheelDelta >= 0)? 1 : -1; 
		this._camera.staticMove(e.wheelDelta, 0.001);
	}

	FPSCamera.prototype.mouseClick = function(e) {
		if (!this._movement_enabled) {
			return;
		}

		if(e.button == 0 && e.type == 'mousedown') {
			this._camera.look(true);
			this._last_mouse_pos = _.relativeMousePosition(e);
		} else if(e.button == 0 && e.type == 'mouseup') {
			this._camera.look(false);			
		} else if(e.type == 'mousemove') {
			if(!this._camera.isLooking()) return;					
			var data = _.relativeMousePosition(e);
			this._camera.lookHorizontal(data[0] - this._last_mouse_pos[0]);
			this._camera.lookVertical(data[1] - this._last_mouse_pos[1]);
			this._last_mouse_pos = data;
		}
	}

	FPSCamera.prototype.setResetLocation = function(location) {
		this._origin = location.clone();
	}

	FPSCamera.prototype.goToResetLocation = function() {
		this._camera._position.copy(this._origin);
		this._camera._yaw = 0;
		this._camera._pitch = 0;
		this._camera._view_changed = true;
	}

	FPSCamera.prototype.goToLocation = function(location, yaw, pitch) {
		this._camera.setAbsolutePosition(location, yaw, pitch);
	}

	FPSCamera.prototype.dumpPosition = function(precision) {
		this._camera.dumpPosition(precision);
	};

	FPSCamera.prototype.enableMovement = function(enabled) {
		this._movement_enabled = enabled;
	}

	Goblin.extend('FPSCamera', FPSCamera);

})(this, this.document);
