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
 * @param {Object} args JSON Object containing the arguments
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

/**
 * Method factory to create an empty VWebSocket
 * 
 * @method _createSocket
 */
VWebSocket.prototype._createSocket = function() {
    this.socket = new WebSocket(this._url);
    this.socket.onmessage = this.message.bind(this);
};

/**
 * Open the VWebSocket
 * 
 * @method open
 * @return true if a socket was opened, false otherwise
 */
VWebSocket.prototype.open = function() {
    var state = this.socket.readyState;
    if (state === WebSocket.CLOSED || state === WebSocket.CLOSING) {
        this._createSocket();
        return true;
    }

    if (state !== WebSocket.CONNECTING) {
        this.flush();
        return false;
    }

    return false;
};

/**
 * Sends a JSON Object to the socket
 * 
 * @method send
 * @param {Object} jsonObject JSON Object to send
 */
VWebSocket.prototype.send = function(jsonObject) {
    if (jsonObject !== undefined) {
        this._buffer.push(jsonObject);
    }
    this.flush();
    // this.open();
};

/**
 * Flush the internal buffer and send all his content
 * 
 * @method flush
 */
VWebSocket.prototype.flush = function() {
    var obj = this._buffer.shift();
    while (obj) {
        this.socket.send(JSON.stringify(obj));
        obj = this._buffer.shift();
    }
};

/**
 * Retreive a JSON data from a websocket message and dispatch an event
 * 
 * @method message
 * @param {Event} event
 */
VWebSocket.prototype.message = function(event) {
    if (event.data === "pong") {
        return;
    }
    console.log(event.data);
    var json = JSON.parse(event.data);
    this.dispatch("messageReceived", json);
};

module.exports = VWebSocket;
