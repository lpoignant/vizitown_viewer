/**
 * Create a scene with basic elements to debug.
 * Axis helper, X-Y plane, Camera
 *
 * @class DebugScene
 * @constructor
 * @param {Window} Browser window element
 * @param {Document} Browser document element 
 * @param {float} Size of the debug scene
 */
var DebugScene = function (window, document, size) {
    //super constructor
    THREE.Scene.call(this);
    
    this._window = windows;
    
    var ratio = this._window.innerWidth / this._window.innerHeight;
    this._camera = new THREE.PerspectiveCamera(45, ratio, 0.1, size);
    
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    
    this._document = document;
    this._document.getElementById(domElementId).appendChild(this._renderer.domElementId);
    
    this._axes = new THREE.AxisHelper(size);
    this._grid = new THREE.GridHelper(size);
    this._frustrum = new THREE.CameraHelper(this._camera);
    
    /*this._wireMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
    var plane = new THREE.PlaneGeometry(size, size);
    this._grid = new THREE.Mesh(plane, this._wireMaterial);*/
};
DebugScene.inheritsFrom(THREE.Scene);


DebugScene.prototype.render = function () {
    this._window.requestAnimationFrame(render);
    this._renderer.render(this, this._camera);
};

DebugScene.prototype.lookAt = function (pos) {
    this._camera.lookAt(pos);
    this._camera.pos = pos;
    this._camera.pos.z = pos.z + 50;
};

DebugScene.prototype.initialize = function () {
    this.add(this._axes);
    this.add(this._grid);
    this.add(this.frustrum);
};
