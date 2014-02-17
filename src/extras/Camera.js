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
    var far = args.far || 1000;
    var ratio = this._window.innerWidth / this._window.innerHeight;
    var x = args.x || 0;
    var y = args.y || 0;

    THREE.PerspectiveCamera.call(this, vFov, ratio, 10, far);
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
};
Camera.inheritsFrom(THREE.PerspectiveCamera);
