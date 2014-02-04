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
	this.host = args.host;
	this.port = args.port;
	this.path = args.path;
	this.url = "ws://"+args.host+":"+args.port+args.path;
	if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
	}
	if (args.onmessage) this.socket.onmessage = args.onmessage;
	if (args.onopen) this.socket.onopen = args.onopen;
	if (args.onerror) this.socket.onerror = args.onerror;
	if (args.onclose) this.socket.onclose = args.onclose;
};