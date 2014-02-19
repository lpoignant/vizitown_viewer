/* global FPSControl, WebSocketLayer, Camera, SceneSocket, TerrainLayer */
"use strict";

/**
 * @class Scene
 * @constructor
 */
var Scene = function(args) {
    args = args || {};
    var url = args.url;

    var extent = args.extent;
    var x = (extent.maxX - extent.minX) / 2;
    var y = (extent.maxY - extent.minY) / 2;

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
    this._control = new FPSControl(this._camera, this._document);

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.Fog(0xdbdbdb, this._camera.far / 2, this._camera.far);
    var hemiLight = new THREE.HemisphereLight(0x999999, 0xffffff, 1);
    this._scene.add(hemiLight);

    this._vectorLayer = new WebSocketLayer({
        url: "ws://" + url,
        x: extent.minX,
        y: extent.minY,
        width: extent.maxX - extent.minX,
        height: extent.maxY - extent.minY,
        tileWidth: 1000,
        tileHeight: 1000,
    });
    this._scene.add(this._vectorLayer);

    this._terrainLayer = new TerrainLayer({
        x: extent.minX,
        y: extent.minY,
        width: extent.maxX - extent.minX,
        height: extent.maxY - extent.minY,
        ortho: "http://localhost:8888/rasters/img_GrandLyon2m_L93_RGB_4096_1",
        dem: "http://localhost:8888/rasters/dem_Mnt_L93_4096_1",
        minHeight: 10,
        maxHeight: 1000,
        xDensity: 8,
        yDensity: 8,
        tileWidth: 3.995894450904324 * 4096,
        tileHeight: 3.995894450904324 * 4096,
    });
    this._scene.add(this._terrainLayer);

    var self = this;
    this._control.addEventListener("moved", function(args) {
        self._vectorLayer.display(args.camera);
        self._terrainLayer.display(args.camera);
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
Scene.prototype.displayVector = function(extents) {
    var self = this;
    extents.forEach(function(extent) {
        var tileCreated = self._vectorLayer.isTileCreated(extent.x, extent.y);
        if (!tileCreated) {
            self._vectorLayer.tile(extent.x, extent.y);
            self._socket.sendExtent(extent.extent);
        }
    });
};
