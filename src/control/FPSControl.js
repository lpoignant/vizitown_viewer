/* global EventDispatcher */
"use strict";

/**
 * @class FPSControl
 * @extends EventDispatcher
 * @constructor
 * @param {Object} camera A camera to move
 * @param {Object} domElement A DOM element which handle moves
 */
var FPSControl = function(camera, domElement) {
    this._camera = camera;
    this.domElement = domElement || document;
    this.mouseX = 0;
    this.mouseY = 0;
    this.rotationSpeed = 90;
    this.movementSpeed = 500;

    this._clock = new THREE.Clock();

    this.worldVectorZ = new THREE.Vector3(0, 0, 1);
    this.listen();
};
FPSControl.inheritsFrom(EventDispatcher);

/**
 * Connect domElement events to the FPSControl
 * 
 * @method listen
 */
FPSControl.prototype.listen = function() {
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.handleResize();
};

/**
 * Handle the resize of the browser window
 *
 * @method handleResize
 */
FPSControl.prototype.handleResize = function() {
    if (this.domElement === document) {
        this.viewHalfX = window.innerWidth / 2;
        this.viewHalfY = window.innerHeight / 2;
    }
    else {
        this.viewHalfX = this.domElement.offsetWidth / 2;
        this.viewHalfY = this.domElement.offsetHeight / 2;
    }
};

/**
 * @method onMouseDown
 * @param event
 */
FPSControl.prototype.onMouseDown = function(event) {
    if (this.domElement !== document) {
        this.domElement.focus();
    }
    event.preventDefault();
    event.stopPropagation();
    this.mouseDragOn = true;
};

/**
 * @method onMouseUp
 * @param event
 */
FPSControl.prototype.onMouseUp = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.mouseDragOn = false;
};

/**
 * @method onMouseMove
 * @param {Event} event
 */
FPSControl.prototype.onMouseMove = function(event) {
    if (!this.mouseDragOn) {
        return;
    }
    if (this.domElement === document) {
        this.mouseX = (event.pageX - this.viewHalfX) / this.viewHalfX;
        this.mouseY = (-event.pageY + this.viewHalfY) / this.viewHalfY;
    }
    else {
        this.mouseX = (event.pageX - this.domElement.offsetLeft - this.viewHalfX) / this.viewHalfX;
        this.mouseY = (-event.pageY + this.domElement.offsetTop + this.viewHalfY) / this.viewHalfY;
    }
};

/**
 * @method onKeyDown
 * @param {Event} event
 */
FPSControl.prototype.onKeyDown = function(event) {
    switch (event.keyCode) {
        case 40: /* down */
        case 83: /* S */
            this.moveBackward = true;
            break;

        case 37: /* left */
        case 81: /* Q */
            this.moveLeft = true;
            break;

        case 39: /* right */
        case 68: /* D */
            this.moveRight = true;
            break;

        case 38: /* up */
        case 90: /* Z */
            this.moveForward = true;
            break;
    }
};

/**
 * @method onKeyUp
 * @param {Event} event
 */
FPSControl.prototype.onKeyUp = function(event) {
    switch (event.keyCode) {
        case 40: /* down */
        case 83: /* S */
            this.moveBackward = false;
            break;

        case 37: /* left */
        case 81: /* Q */
            this.moveLeft = false;
            break;

        case 39: /* right */
        case 68: /* D */
            this.moveRight = false;
            break;

        case 38: /* up */
        case 90: /* Z */
            this.moveForward = false;
            break;
    }
};

/**
 * Update camera position with movements done
 *
 * @method update
 */
FPSControl.prototype.update = function() {

    var delta = this._clock.getDelta();
    var moved = false;

    if (this.moveBackward || this.moveForward || this.moveLeft || this.moveRight) {
        // Translation
        var actualMoveSpeed = delta * this.movementSpeed;

        if (this.moveForward) {
            this._camera.translateZ(-actualMoveSpeed);
        }
        if (this.moveBackward) {
            this._camera.translateZ(actualMoveSpeed);
        }

        if (this.moveLeft) {
            this._camera.translateX(-actualMoveSpeed);
        }
        if (this.moveRight) {
            this._camera.translateX(actualMoveSpeed);
        }
        moved = true;
    }

    // Rotation
    if (this.mouseDragOn) {
        var lon = -THREE.Math.degToRad(this.mouseX * this.rotationSpeed) * delta;
        var lat = THREE.Math.degToRad(this.mouseY * this.rotationSpeed) * delta;

        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(this.worldVectorZ, lon);
        rotationMatrix.multiply(this._camera.matrix);
        this._camera.matrix = rotationMatrix;
        this._camera.rotation.setFromRotationMatrix(this._camera.matrix);

        this._camera.rotateX(lat);
        moved = true;
    }

    if (!moved) {
        return;
    }

    this.dispatch("moved", {
        camera: this._camera
    });
};
