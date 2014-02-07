var ControlSwitcher = function(camera, domElement) {
    this._camera = camera;
	this._control = true;
	this._domElement = domElement || document;
	
	this._trackRotateSpeed = 1.0;
	this._trackZoomSpeed = 1.0;
	this._trackPanSpeed = 1.0;
	this._trackStaticMoving = true;
	
	this._createTrackball = function () {
		var control = new THREE.TrackballControls(this._camera);
		control.rotateSpeed = this._trackRotateSpeed;
		control.zoomSpeed = this._trackZoomSpeed;
		control.panSpeed = this._trackPanSpeed;
		control.staticMoving = this._trackStaticMoving;
		control.reset();
		return control;
	};
	
	this._createFlyControl = function (pointToLook) {
		var control = new THREE.FlyControls(this._camera);
		control.movementSpeed = 50;
		control.rollSpeed = 0.125;
		control.lookVertical = true;
		//this._camera.lookAt(pointToLook);
		console.log(control);
		return control;
	};

	this.current = this._createTrackball();
	
	this._addListeners();
};

ControlSwitcher.prototype.changeControlMode = function() {
	var pLocal = new THREE.Vector3( 0, 0, -1 );
	console.log(this._camera);
	var pWorld = pLocal.applyMatrix4( this._camera.matrixWorld );
	//console.log(pWorld);
	if (this._control) {
		this.current = this._createFlyControl(pWorld);
	}
	else {
		this.current = this._createTrackball();
	}
	this._control = !this._control;
};

ControlSwitcher.prototype._addListeners = function() {
    var self = this;
	this._domElement.addEventListener('keyup', function(e) {
        var ascii_value = e.keyCode;
		console.log(ascii_value);
        if(String.fromCharCode(ascii_value) == 'K' ) {
            self.changeControlMode();
        }
    }, false);
};