/* global THREE, document, console, Math */
var MyControl = function (camera, domElement) {
	this.camera = camera;
	this.camera.rotateZ(Math.PI);
	this.domElement = (domElement === undefined) ? document : domElement;
	
	this.speed = 100;
	this.radians = 0.05;
	
	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
	
	this.domElement.addEventListener( 'keydown', bind(this, this.onKeyDown), false );
};

MyControl.prototype = {

	onKeyDown: function( event ) {
		var yAxis = new THREE.Vector3(0.0,0.0,1.0);
		switch( event.keyCode ) {
			case 90: // z (move forward)
				this.camera.translateZ( -this.speed );
				break;

			case 83: // s (move backward)
				this.camera.translateZ( this.speed );
				break;

			case 81:
			case 37: // left arrow (look left)
				//this.camera.rotateY( this.radians );
				this.camera.rotateOnAxis(yAxis, this.radians);
				break;

			case 68:
			case 39: // right arrow (look right)
				//this.camera.rotateY( -this.radians );
				this.camera.rotateOnAxis(yAxis, -this.radians);
				break;

			case 38: // up arrow (look up)
				this.camera.rotateX( this.radians );
				break;

			case 40: // down arrow (look down)
				this.camera.rotateX( -this.radians );
				break;
		}
	}
};

