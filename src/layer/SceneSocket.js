/* global GeometryFactoryComposite, VWebSocket */
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

    var self = this;
    this._sockets.data.addEventListener("messageReceived", function(obj) {
        var meshes = self._factory.create(obj);
        meshes.forEach(function(mesh) {
            self._scene.add(mesh);
        });
        self._scene.render();
    });

    this._sockets.sync.addEventListener("messageReceived", function(obj) {
        var extent = JSON.parse(obj);
	var coords = {};
	coords.x = extent.Xmin + (extent.Xmax - extent.Xmin) * 0.5;
	coords.y = extent.Ymin + (extent.Ymax - extent.Ymin) * 0.5;
        self._scene.moveTo(coords);
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
