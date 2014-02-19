/* global FPSControl, ExtentProvider, Camera, Layer, SceneSocket */
"use strict";

/**
 * @class Scene
 * @constructor
 */
var Scene = function(args) {
    args = args || {};
    var url = args.url;
    var extent = args.extent;
    var x = extent.minX + ((extent.maxX - extent.minX) / 2);
    var y = extent.minY + ((extent.maxY - extent.minY) / 2);

    this._window = args.window || window;
    this._document = args.document || document;

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setClearColor(0xdbdbdb, 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._camera = new Camera({
        window: this._window,
        renderer: this._renderer,
        x: x,
        y: y,
    });

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.Fog(0xdbdbdb, 800, 3 * this._camera.far / 4);

    this._layer = new Layer({
        x: extent.minX,
        y: extent.minY,
        width: extent.maxX - extent.minX,
        height: extent.maxY - extent.minY,
        ortho: '/app/mnt.png',
        dem: '/app/mnt.png',
        scene: this._scene,
        minHeight: 0,
        maxHeight: 10,
        xDensity: 8,
        yDensity: 8,
        tileWidth: 4096,
        tileHeight: 4096,
    });

    this._control = new FPSControl(this._camera, this._document);

    var self = this;
    this._extent = new ExtentProvider(this._control, this._layer);
    this._extent.addEventListener("extentChanged", function(extents) {
        self.display(extents);
    });

    this._socket = new SceneSocket({
        url: "ws://" + url,
        scene: this,
    });

    this._document.getElementById(args.domId)
            .appendChild(this._renderer.domElement);
};

/**
 * @method moveTo Move the camera to a specific location
 * @param coords A 2D coordinates of the futur location
 */
Scene.prototype.moveTo = function(coords) {
    this._camera.position.set(coords.x, coords.y, this._camera.position.z);
    this._camera.lookAt(new THREE.Vector3(coords.x, coords.y, this._camera.position.z - 1));
};

/**
 * @method render
 */
Scene.prototype.render = function() {
    this._window.requestAnimationFrame(this.render.bind(this));
    this._renderer.render(this._scene, this._camera);
    this._control.update();
};

/**
 * @method display
 * @param extents
 */
Scene.prototype.display = function(extents) {
    var self = this;
    extents.forEach(function(extent) {
        var tileCreated = self._layer.isTileCreated(extent.x, extent.y);
        if (!tileCreated) {
            self._layer.tile(extent.x, extent.y);
            self._socket.sendExtent(extent.extent);
        }
    });
};

Scene.prototype.add = function(mesh) {
    this._layer.addToTile(mesh);
};
