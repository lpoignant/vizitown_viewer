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
        self._scene.move(obj);
    });
};