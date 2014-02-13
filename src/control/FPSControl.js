"use strict";

/**
 * @class FPSCOntrol
 * @constructor
 */
var FPSControl = function(camera, domElement) {
    this._camera = camera;
    this.domElement = domElement || document;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lookSpeed = 1;
    this.movementSpeed = 1000;
};

FPSControl.prototype.listen = function() {
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this),
            false);
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this),
            false);
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this),
            false);
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this),
            false);
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.handleResize();
};

FPSControl.prototype.onMouseDown = function(event) {
    if (this.domElement !== document) {
        this.domElement.focus();
    }
    event.preventDefault();
    event.stopPropagation();
    this.mouseDragOn = true;
};

FPSControl.prototype.onMouseUp = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.mouseDragOn = false;
};

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

FPSControl.prototype.onMouseMove = function(event) {
    if (!this.mouseDragOn) {
        return;
    }
    if (this.domElement === document) {
        this.mouseX = event.pageX - this.viewHalfX;
        this.mouseY = -event.pageY + this.viewHalfY;
    }
    else {
        this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
        this.mouseY = -event.pageY + this.domElement.offsetTop + this.viewHalfY;
    }
};

FPSControl.prototype.onKeyDown = function(event) {
    switch (event.keyCode) {
        case 38: /* up */
        case 87: /* W */
            this.moveForward = true;
            break;
        
        case 37: /* left */
        case 65: /* A */
            this.moveLeft = true;
            break;
        
        case 40: /* down */
        case 83: /* S */
            this.moveBackward = true;
            break;
        
        case 39: /* right */
        case 68: /* D */
            this.moveRight = true;
            break;
        
        case 82: /* R */
            this.moveUp = true;
            break;
        case 70: /* F */
            this.moveDown = true;
            break;
        
        case 81: /* Q */
            this.freeze = !this.freeze;
            break;
    }
};

FPSControl.prototype.onKeyUp = function(event) {
    switch (event.keyCode) {
        case 38: /* up */
        case 87: /* W */
            this.moveForward = false;
            break;
        
        case 37: /* left */
        case 65: /* A */
            this.moveLeft = false;
            break;
        
        case 40: /* down */
        case 83: /* S */
            this.moveBackward = false;
            break;
        
        case 39: /* right */
        case 68: /* D */
            this.moveRight = false;
            break;
        
        case 82: /* R */
            this.moveUp = false;
            break;
        case 70: /* F */
            this.moveDown = false;
            break;
    }
};

FPSControl.prototype.update = function(delta) {
    if (this.freeze) {
        return;
    }
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
    
    if (this.moveUp) {
        this._camera.translateY(actualMoveSpeed);
    }
    if (this.moveDown) {
        this._camera.translateY(-actualMoveSpeed);
    }
    
    // Rotation
    if (!this.mouseDragOn) {
        return;
    }
    var actualLookSpeed = delta * this.lookSpeed;
    var lon = -THREE.Math.degToRad(this.mouseX * actualLookSpeed) / 10;
    var lat = THREE.Math.degToRad(this.mouseY * actualLookSpeed) / 10;
    this._camera.rotateY(lon);
    this._camera.rotateX(lat);
};
