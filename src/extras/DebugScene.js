/* global FPSControl:true */
"use strict";

/**
 * Create a scene with basic elements to debug. Axis helper, X-Y plane, Camera
 * 
 * @class DebugScene
 * @constructor
 * @param {Window}
 *                Browser window element
 * @param {Document}
 *                Browser document element
 * @param {float}
 *                Size of the debug scene
 */
var DebugScene = function(window, document, domElementId, size) {
    this._scene = new THREE.Scene();
    
    this._window = window;
    
    var ratio = this._window.innerWidth / this._window.innerHeight;
    
    this._camera = new THREE.PerspectiveCamera(30, ratio, 0.1, 1000);
    this._camera.position.x = 10;
    this._camera.position.y = 10;
    this._camera.position.z = 10;
    this._camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    
    this._document = document;
    this._document.getElementById(domElementId).appendChild(
            this._renderer.domElement);
    
    this._axes = new THREE.AxisHelper(size);
    
    this._control = new FPSControl(this._camera, this._document);
    this._control.listen();
    
    this._clock = new THREE.Clock();
    var planeGeometry = new THREE.PlaneGeometry(size, size, size / 10000,
            size / 10000);
    var planeMaterial = new THREE.MeshBasicMaterial({
        color : 0xcccccc,
        wireframe : true
    });
    this._grid = new THREE.Mesh(planeGeometry, planeMaterial);
    
    this._scene.add(this._axes);
    this._scene.add(this._grid);
    this._scene.add(this._camera);
    
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

DebugScene.prototype.render = function() {
    this._window.requestAnimationFrame(this.render.bind(this));
    this._renderer.render(this._scene, this._camera);
    
    var delta = this._clock.getDelta();
    this._control.update(delta);
};

DebugScene.prototype.lookAt = function(pos) {
    this._camera.lookAt(pos);
    this._camera.position = pos.clone();
    this._camera.position.z = pos.z + 50;
    this._grid.position = pos;
};