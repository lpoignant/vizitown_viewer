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
    EventDispatcher.call(this);

    this._host = args.host;
    this._port = args.port;
    this._path = args.path;
    this._url = args.url || "ws://" + args.host + ":" + args.port + args.path;
    if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
    }
    this._buffer = [];

    this._createSocket();
};
VWebSocket.inheritsFrom(EventDispatcher);

VWebSocket.prototype._createSocket = function() {
    this.socket = new WebSocket(this._url);
    this.socket.onmessage = this.message.bind(this);
    this.socket.onopen = this.flush.bind(this);
};

VWebSocket.prototype.open = function() {
    if (!this.socket) {
        this._createSocket();
        return true;
    }

    var state = this.socket.readyState;
    if (state === WebSocket.CLOSED || state === WebSocket.CLOSING) {
        this._createSocket();
        return true;
    }

    if (state !== WebSocket.CONNECTING) {
        this.flush();
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
    if (jsonObject !== undefined) {
        this._buffer.push(jsonObject);
    }
    this.open();
};

VWebSocket.prototype.flush = function() {
    var obj = this._buffer.shift();
    while (obj) {
        console.log(obj);
        this.socket.send(JSON.stringify(obj));
        obj = this._buffer.shift();
    }
};

VWebSocket.prototype.message = function(event) {
    var json = JSON.parse(event.data);
    console.log(json);
    this.dispatch("messageReceived", json);
};

module.exports = VWebSocket;
