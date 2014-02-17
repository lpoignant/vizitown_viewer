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
};
VWebSocket.inheritsFrom(EventDispatcher);

VWebSocket.prototype._createSocket = function(onopen) {
    this.socket = new WebSocket(this._url);
    var self = this;
    this.socket.onmessage = function(event) {
        var json = JSON.parse(event.data);
        console.log(json);
        self.dispatch("messageReceived", json);
    };
    this.socket.onopen = onopen;
};

VWebSocket.prototype.open = function(onopen) {
    if (!this.socket) {
        this._createSocket(onopen);
        return true;
    }

    var state = this.socket.readyState;
    if (state === WebSocket.CLOSED || state === WebSocket.CLOSING) {
        this._createSocket(onopen);
        return true;
    }
    return false;
};

/**
 * Sends a JSON Object to the socket
 * 
 * @class VWebSocket
 * @method send
 * @param {Object} jsonObject JSON Object to send
 */
VWebSocket.prototype.send = function(jsonObject) {
    var self = this;
    this.open(function() {
        console.log(jsonObject);
        self.socket.send(JSON.stringify(jsonObject));
    });
};

module.exports = VWebSocket;
