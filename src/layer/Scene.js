/* global FPSControl */
"use strict";

/**
 * @class Scene
 * @constructor
 */
var Scene = function(args) {
    args = args || {};
    this.extent = args.extent;
    this.tileSize = args.tileSize;

    this._window = args.window || window;
    this._document = args.document || document;

    this._scene = new THREE.Scene();

    var vFov = args.fov || 30;
    var far = args.far || 5000;
    var ratio = this._window.innerWidth / this._window.innerHeight;
    this._camera = new THREE.PerspectiveCamera(vFov, ratio, 1, far);
    this._camera.position.x = 0;
    this._camera.position.y = 0;
    this._camera.position.z = 0;
    this._camera.lookAt(new THREE.Vector3(0, 0, 0));

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._document.getElementById(args.domElementId)
            .appendChild(this._renderer.domElement);

    this._control = new FPSControl(this._camera, this._document);
    this._control.listen();

    this._clock = new THREE.Clock();

    var self = this;
    this._onWindowResize = function onWindowResize() {
        self._camera.aspect = self._window.innerWidth /
                              self._window.innerHeight;
        self._camera.updateProjectionMatrix();
        self._renderer.setSize(self._window.innerWidth,
                               self._window.innerHeight);
    };

    this._window.addEventListener('resize', this._onWindowResize, false);
};

Scene.prototype.add = function(obj) {
    obj = obj;
};
