(function(window, document, undefined) {
	'use strict';
	
	var HPI = 1.57079632679;
	var EPSILON = 0.000001;
	var DEFAULT_FRICTION = 0.1;
	var DEFAULT_TRACTION = 0.3;
	var DEFAULT_SENSITIVITY = 0.005;

	function Camera(options) {
		options = options || {};

		this._acceleration = new _.v3();
		this._velocity = new _.v3();
		this._friction = (options.friction) ? options.friction : DEFAULT_FRICTION;
		this._traction = (options.traction) ? options.traction : DEFAULT_TRACTION;
		this._look_sensitivity = (options.look_sensitivity) ? options.look_sensitivity : DEFAULT_SENSITIVITY;

		this._view_matrix = _.m4.identity();
		this._projection_matrix = _.m4.identity();
		this._invert = 1;

		this._looking = false;
		this._yaw = 0;
		this._pitch= 0;
		this._roll= 0;

		this._position = (options.position) ? options.position : new _.v3();
	}

	Camera.prototype.invert = function() {
		this._invert *= -1;
	}

	Camera.prototype.look = function(looking) {
		this._looking = looking;
	}

	Camera.prototype.isLooking = function() {
		return this._looking;
	}

	Camera.prototype.distanceTo = function(x,y,z) {
		return this._position.distance(new _.v3(x,y,z)); 
	}

	Camera.prototype.setForwardAcceleration = function(power) {
		this._acceleration.z   = this._traction * power;
	}

	Camera.prototype.setLateralAcceleration = function(power) {
		this._acceleration.x = this._traction * power;
	}

	Camera.prototype.setVerticalAcceleration = function(power) {
		this._acceleration.y = this._traction * power;
	}

	Camera.prototype.move = function(delta) {
		this._position.z += Math.cos(this._yaw) * this._velocity.z * delta;
		this._position.x -= Math.sin(this._yaw) * this._velocity.z * delta;
	}

	Camera.prototype.strafe = function(delta) {
		this._position.z -= Math.sin(this._yaw) * this._velocity.x * delta;
		this._position.x -= Math.cos(this._yaw) * this._velocity.x * delta;
	}

	Camera.prototype.lookVertical = function(delta) {
		this._pitch += delta * this._look_sensitivity * this._invert;
		if(this._pitch > HPI) this._pitch = HPI;
		if(this._pitch < -HPI) this._pitch = -HPI;
	}

	Camera.prototype.lookHorizontal = function(delta) {
		this._yaw += delta * this._look_sensitivity;
	}

	Camera.prototype.elevate = function(delta) {
		this._position.y += this._velocity.y * delta;
	}

	Camera.prototype.getMatrix = function() {
		this._matrix.identity();
		this._matrix.rotateX(this._pitch);
		this._matrix.rotateY(this._yaw);
		this._matrix.translate(this._position.x,this._position.y,this._position.z);
		return this._matrix;
	}

	Camera.prototype.getPosition = function() {
		return this._position;
	}

	Camera.prototype.getOrientation = function() {
		return [this._yaw, this._pitch];
	}

	Camera.prototype.updateProjection = function(w, h) {
		this._projection_matrix.perspective(85, w / h, 0, 100.0);
	}

	Camera.prototype.update = function(delta) {
		// delta /= 1000.0;
		if(!delta) return;
		// Update velocity based on acceleration 
		// Create dragging force based on current velocity;
		var v = this._velocity.clone().multiply(this._friction);
		this._velocity.add(this._acceleration);
		this._velocity.substract(v); // remove dragging

		//Clamping velocity
		if(Math.abs(this._velocity.x) < EPSILON) this._velocity.x = 0; 
		if(Math.abs(this._velocity.y) < EPSILON) this._velocity.y = 0; 
		if(Math.abs(this._velocity.z) < EPSILON) this._velocity.z = 0;

		this.move(delta);
		this.strafe(delta);
		this.elevate(delta);
	}

	Goblin.addModule("Camera", Camera);
})(this, this.document);