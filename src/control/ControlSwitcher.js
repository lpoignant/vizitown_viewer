var Controls = function(camera) {
    this._camera = camera;
	this._control = true;
	
	this._trackRotateSpeed = 1.0;
	this._trackZoomSpeed = 1.0;
	this._trackPanSpeed = 1.0;
	this._trackStaticMoving = true;
	
	this.current = new THREE.TrackballControls(this._camera);
	this.current.rotateSpeed = this._trackRotateSpeed;
	this.current.zoomSpeed = this._trackZoomSpeed;
	this.current.panSpeed = this._trackPanSpeed;
	this.current.staticMoving = this._trackStaticMoving;
	this.current.reset();
};

Controls.prototype.changeControlMode = function() {
	if (this._control) {
		this.current = new THREE.FlyControls(this._camera);
		this.current.movementSpeed = 50;
		this.current.rollSpeed = 0.125;
		this.current.lookVertical = true;
	}
	else {
		this.current = new THREE.TrackballControls(this._camera);
		this.current.rotateSpeed = this._trackRotateSpeed;
		this.current.zoomSpeed = this._trackZoomSpeed;
		this.current.panSpeed = this._trackPanSpeed;
		this.current.staticMoving = this._trackStaticMoving;
		this.current.reset();
	}
	this._control = !this._control;
};

Controls.prototype.allowMultipleControls = function(document) {
    var self = this;
	document.addEventListener('keyup', function(e) {
        
        var ascii_value = e.keyCode;
        if(String.fromCharCode(ascii_value) == 'H' ) {
            self.changeControlMode();
        }
        
    }, false);
};