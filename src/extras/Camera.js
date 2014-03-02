"use strict";

/**
 * @class Camera
 * @extends THREE.PerspectiveCamera
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {THREE.WebglRenderer} args.renderer WebglRenderer for the camera
 * @param {Window} args.window Window element of the browser
 * @param {Number} args.fov Vertical field of view
 * @param {Number} args.far Maximum distance viewed by the camera
 */
var Camera = function(args) {
    this._window = args.window;
    this._renderer = args.renderer;

    var vFov = args.fov || 45;
    var far = args.far || 5000;
    var ratio = this._window.innerWidth / this._window.innerHeight;
    var x = args.x || 0;
    var y = args.y || 0;

    THREE.PerspectiveCamera.call(this, vFov, ratio, 1, far);
    this.position = new THREE.Vector3(x, y, far / 10);
    this.lookAt(new THREE.Vector3(x, y, 0));

    var self = this;
    this._onWindowResize = function onWindowResize() {
        self.aspect = self._window.innerWidth / self._window.innerHeight;
        self.updateProjectionMatrix();
        self._renderer.setSize(self._window.innerWidth,
                               self._window.innerHeight);
    };

    this._window.addEventListener('resize', this._onWindowResize, false);

    this._frustum = new THREE.Frustum();
};
Camera.inheritsFrom(THREE.PerspectiveCamera);

Camera.prototype.frustum = function() {
    this.updateMatrix();
    this.updateMatrixWorld();
    this.matrixWorldInverse.getInverse(this.matrixWorld);

    // Create frustum from camera
    var matrixFrustum = this.projectionMatrix.clone();
    matrixFrustum.multiply(this.matrixWorldInverse);
    this._frustum.setFromMatrix(matrixFrustum);

    return this._frustum;
};

Camera.prototype.extent = function() {
    var position = this.position;
    var extent = [position.x - this.far,
                  position.y - this.far,
                  position.x + this.far,
                  position.y + this.far];
    return extent;
};
