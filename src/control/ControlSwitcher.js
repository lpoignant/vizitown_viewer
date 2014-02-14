"use strict";

var ControlSwitcher = function(camera, domElement) {
    this._camera = camera;
    this._control = true;
    this._domElement = domElement || document;

    this._trackRotateSpeed = 1.0;
    this._trackZoomSpeed = 1.0;
    this._trackPanSpeed = 1.0;
    this._trackStaticMoving = true;

    this._createTrackball = function() {
        var control = new THREE.TrackballControls(this._camera);
        control.rotateSpeed = this._trackRotateSpeed;
        control.zoomSpeed = this._trackZoomSpeed;
        control.panSpeed = this._trackPanSpeed;
        control.staticMoving = this._trackStaticMoving;
        control.reset();
        return control;
    };

    this._createFlyControl = function() {
        var control = new THREE.FlyControls(this._camera);
        control.movementSpeed = 50;
        control.rollSpeed = 0.125;
        control.lookVertical = true;
        return control;
    };

    this.current = this._createTrackball();

    this._addListeners();
};

ControlSwitcher.prototype.changeControlMode = function() {

    var prevCamera = this._camera;
    this._camera = new THREE.PerspectiveCamera(70, window.innerWidth /
                                                   window.innerHeight, 1, 1000);
    this._camera.position.copy(prevCamera.position);
    this._camera.rotation.copy(prevCamera.rotation);

    if (this._control) {
        this.current = this._createFlyControl();
    }
    else {
        this.current = this._createTrackball();
    }
    this._control = !this._control;
};

ControlSwitcher.prototype._addListeners = function() {
    var self = this;
    this._domElement.addEventListener('keyup', function(e) {
        var asciiValue = e.keyCode;
        if (String.fromCharCode(asciiValue) === 'K') {
            self.changeControlMode();
        }
    }, false);
};
