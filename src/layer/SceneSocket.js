/* global VWebSocket */
/* exported SceneSocket */
"use strict";

/**
 * 
 */
var SceneSocket = function(args) {
    this._scene = args.scene;

    this._sockets = {};

    this._sockets.sync = new VWebSocket({
        url: args.url + "/sync"
    });

    var self = this;
    this._sockets.sync.addEventListener("messageReceived", function(obj) {
        var extent = JSON.parse(obj);
        var coords = {};
        coords.x = extent.Xmin + (extent.Xmax - extent.Xmin) * 0.5;
        coords.y = extent.Ymin + (extent.Ymax - extent.Ymin) * 0.5;
        self._scene.moveTo(coords);
    });
};
