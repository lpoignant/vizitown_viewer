/* global GeometryFactoryComposite, Layer, VWebSocket, ExtentProvider */
/* exported SceneSocket */
"use strict";

/**
 * 
 */
var SceneSocket = function(args) {
    this._scene = args.scene;
    this._factory = new GeometryFactoryComposite();

    this._sockets = {};
    this._sockets.data = new VWebSocket({
        url: args.url + "/data"
    });
    this._sockets.sync = new VWebSocket({
        url: args.url + "/sync"
    });
    this._sockets.tiles = new VWebSocket({
        url: args.url + "/tiles_info"
    });

    var self = this;
    this._sockets.data.addEventListener("messageReceived", function(obj) {
        var meshes = self._factory.create(obj);
        meshes.forEach(function(mesh) {
            self._scene.add(mesh);
        });
    });

    this._sockets.sync.addEventListener("messageReceived", function() {
    // self._scene.move(obj);
    });

    this._sockets.tiles.addEventListener("messageReceived", function(obj) {
        // Create scene
        
        self._scene._layer = new Layer({
            x: self._scene._extent.minX,
            y: self._scene._extent.minY,
            width: self._scene.extent.maxX - self._scene.extent.minX,
            height: self._scene.extent.maxY - self._scene.extent.minY,
            ortho: obj.texture,
            dem: obj.dem,
            scene: self._scene,
            minHeight: 0,
            maxHeight: 10,
            xDensity: 8,
            yDensity: 8,
            tileWidth: obj.demPixelSize * obj.tileSize,
            tileHeight: obj.demPixelSize * obj.tileSize,
        });
    });
    this._scene._extent = new ExtentProvider(self._scene._control, self._scene._layer);
    this._scene._extent.addEventListener("extentChanged", function(extents) {
        self._scene.display(extents);
    });
};

/**
 * @method sendExtent
 * @param extent
 */
SceneSocket.prototype.sendExtent = function(extent) {
    var ext = {
        Xmin: extent.min.x,
        Ymin: extent.min.y,
        Xmax: extent.max.x,
        Ymax: extent.max.y,
    };
    this._sockets.data.send(ext);
};
