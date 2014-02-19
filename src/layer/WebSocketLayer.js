/* global Layer, GeometryFactoryComposite, VWebSocket */
"use strict";

var WebSocketLayer = function WebSocketLayer(args) {
    Layer.call(this, args);

    this._socket = new VWebSocket({
        url: args.url + "/data"
    });

    this._factory = new GeometryFactoryComposite();

    var self = this;
    this._socket.addEventListener("messageReceived", function(obj) {
        var meshes = self._factory.create(obj);
        meshes.forEach(function(mesh) {
            self.addToTile(mesh);
        });
    });
};
WebSocketLayer.inheritsFrom(Layer);

WebSocketLayer.prototype._loadData = function(extent) {
    var ext = {
        Xmin: extent[0] + this.originX,
        Ymin: extent[1] + this.originY,
        Xmax: extent[2] + this.originX,
        Ymax: extent[3] + this.originY,
    };
    this._socket.send(ext);
};
