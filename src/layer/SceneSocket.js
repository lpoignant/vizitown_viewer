/* global VWebSocket */
/* exported SceneSocket */
"use strict";

/**
 * Socket use to sync camera with QGIS
 *
 * @class SceneSocket
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {String} url Url which contains all resources
 * @param {Object} Scene The scene to move
 */
var SceneSocket = function(args) {
    this._scene = args.scene;

    this._sockets = {};

    this._sockets.sync = new VWebSocket({
        url: args.url + "/sync"
    });

    var self = this;

    this._sockets.sync.addEventListener("messageReceived", function(extent) {
        var coords = {};
        coords.x = ((extent.Xmax - extent.Xmin) * 0.5) + extent.Xmin;
        coords.y = ((extent.Ymax - extent.Ymin) * 0.5) + extent.Ymin;
        self._scene.moveTo(coords);
    });
};
