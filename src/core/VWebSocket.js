/* global EventDispatcher */
/* exported VWebSocket */
"use strict";

/**
 * Basic WebSocket implementation. You should override onmessage, onerror,
 * onclose, onopen with your application logic.
 * 
 * @class VWebSocket
 * @constructor
 * @extends EventDispatcher
 * @param {String} args.host String representing the host
 * @param {String} args.port String representing the port number
 * @param {String} args.path String representing the server socket url
 * @param {Function} args.onmessage Function called when a message is received
 * @param {Function} args.onopen Function called when the socket is closed
 * @param {Function} args.onerror Function called when an error happened
 * @param {Function} args.onclose Function called when socket is closed
 */
var VWebSocket = function(args) {
    this._host = args.host;
    this._port = args.port;
    this._path = args.path;
    this._url = args.url || "ws://" + args.host + ":" + args.port + args.path;
    if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
    }
    this.socket = new WebSocket(this._url);
    if (args.onmessage) {
        var self = this;
        this.socket.onmessage = function(message) {
            self.onMessage(message);
            args.onmessage(message);
        };
    }
    if (args.onopen) {
        this.socket.onopen = args.onopen;
    }
    if (args.onerror) {
        this.socket.onerror = args.onerror;
    }
    if (args.onclose) {
        this.socket.onclose = args.onclose;
    }
};
VWebSocket.inheritsFrom(EventDispatcher);

/**
 * Sends a JSON Object to the socket
 * 
 * @class VWebSocket
 * @method send
 * @param {Object} jsonObject JSON Object to send
 */
VWebSocket.prototype.send = function(jsonObject) {
    this.socket.send(JSON.stringify(jsonObject));
};

/**
 * @method sendExtent
 * @param extent
 */
VWebSocket.prototype.sendExtent = function(extent) {
    var ext = {
        xMin: extent.min.x,
        yMin: extent.min.y,
        xMax: extent.max.x,
        yMax: extent.max.y,
    };
    this.send(ext);
};

/**
 * @method onMessage
 * @param {String} message
 */
VWebSocket.prototype.onMessage = function(message) {
    var json = JSON.parse(message);
    this.dispatch("messageReceived", json);
};

module.exports = VWebSocket;
