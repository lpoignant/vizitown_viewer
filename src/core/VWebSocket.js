/* exported VWebSocket */
"use strict";

/**
 * Basic WebSocket implementation. You should override onmessage, onerror, onclose, onopen
 * with your application logic.
 * 
 * @class VWebSocket
 * @constructor
 * @param {String} args.host String representing the host
 * @param {String} args.port String representing the port number
 * @param {String} args.path String representing the server socket url  
 * @param {Function} args.onmessage Function called when a message is received
 * @param {Function} args.onopen Function called when the socket is closed
 * @param {Function} args.onerror Function called when an error happened
 * @param {Function} args.onclose Function called when socket is closed
 **/
var VWebSocket = function (args) {
	this._host = args.host;
	this._port = args.port;
	this._path = args.path;
	this._url = "ws://"+args.host+":"+args.port+args.path;
	if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
	}
	this._socket = new WebSocket(this._url);
	if (args.onmessage) this._socket.onmessage = args.onmessage;
	if (args.onopen) this._socket.onopen = args.onopen;
	if (args.onerror) this._socket.onerror = args.onerror;
	if (args.onclose) this._socket.onclose = args.onclose;
};