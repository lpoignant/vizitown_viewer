/* global FPSControl, VectorLayer, Camera, SceneSocket, TerrainLayer, VWebSocket */
"use strict";

/**
 * @class Scene
 * @constructor
 */
var Scene = function(args) {
    args = args || {};

    var url = args.url || location.host;

    var extent = args.extent;

    this._originX = extent.minX;
    this._originY = extent.minY;

    var x = (extent.maxX - extent.minX) / 2;
    var y = (extent.maxY - extent.minY) / 2;

    this._window = args.window || window;
    this._document = args.document || document;

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.sortObjects = false;
    this._renderer.setClearColor(0xdbdbdb, 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._hasRaster = args.hasRaster;

    this._camera = new Camera({
        window: this._window,
        renderer: this._renderer,
        x: x,
        y: y,
    });
    this._control = new FPSControl(this._camera, this._document);

    this._scene = new THREE.Scene();
    this._scene.fog = new THREE.Fog(0xdbdbdb, this._camera.far / 2,
                                    this._camera.far);
    var hemiLight = new THREE.HemisphereLight(0x999999, 0xffffff, 1);
    this._scene.add(hemiLight);

    this._vectorLayer = new VectorLayer({
        url: "ws://" + url,
        x: this._originX,
        y: this._originY,
        width: extent.maxX - extent.minX,
        height: extent.maxY - extent.minY,
        tileSize: 512,
        qgisVectors: args.vectors,
        scene: this._scene,
    });
    this._scene.add(this._vectorLayer);

    var self = this;

    if(this._hasRaster) {
        this._socketTile = new VWebSocket({
            url: "ws://" + url + "/tiles_info"
        });

        this._socketTile.addEventListener("messageReceived", function(obj) {
                self._terrainLayer = new TerrainLayer({
                x: self._originX,
                y: self._originY,
                width: extent.maxX - extent.minX,
                height: extent.maxY - extent.minY,
                ortho: obj.texture || obj.dem,
                dem: obj.dem || undefined,
                minHeight: obj.minHeight,
                maxHeight: obj.maxHeight,
                gridDensity: 64,
                tileSize: obj.pixelSize * obj.tileSize,
            });
            self._terrainLayer.addLayerToLevel(self._vectorLayer);
            self._scene.add(self._terrainLayer);                    

        });
    }
    this._control.addEventListener("moved", function(args) {
        if(self._vectorLayer) {
            self._vectorLayer.display(args.camera);
        }
        if(self._terrainLayer) {
            self._terrainLayer.display(args.camera);    
        }
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
    var x = coords.x - this._originX;
    var y = coords.y - this._originY;
    this._camera.position.x = x;
    this._camera.position.y = y;
    var lookPoint = new THREE.Vector3(x, y, this._camera.position.z - 1);
    this._camera.lookAt(lookPoint);
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

Scene.prototype.zoom = function(zoomPercent) {
    var zoomMin = 100;
    var zoomMax = 0;
    this._camera.position.z = (zoomMin - zoomMax) * 100/ zoomPercent;
};

Scene.prototype.refreshLayer = function(uuid) {
    console.log('refresh for ' + uuid);
    this._vectorLayer.refresh(uuid);
};
