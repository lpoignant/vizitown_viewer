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
	this.url = "ws://"+args.host+":"+args.port+"/"+args.path;
	if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
	}
	this.socket = new WebSocket(this.url);
	if (args.onmessage) this.onmessage = args.onmessage;
	if (args.onopen) this.onopen = args.onopen;
	if (args.onerror) this.onerror = args.onerror;
	if (args.onclose) this.onclose = args.onclose;
};

/**
 * Function called when the socket is opened.
 * @method onopen
 * @return The callback return value, false if no callback is specified
 */
VWebSocket.prototype.onopen = function () {
	if (this.onopen) return this.onopen();
	else return false;
};

/**
 * Function called when the socket received a message
 * @method onmessage
 * @param {Object} message Object containing the data send. Use message.data to retrive it.
 * @return The callback return value, false if no callback is specified
 */
VWebSocket.prototype.onmessage = function (message) {
	if (this.onmessage) return this.onmessage(message);
	else return false;
};

/**
 * Function called when an error occured.
 * @method onerror
 * @return The callback return value, false if no callback is specified
 */
VWebSocket.prototype.onerror = function () {
	if (this.onerror) return this.onerror();
	else return false;
};

/**
 * Function called when the socket is closed.
 * @method onclose
 * @return The callback return value, false if no callback is specified
 */
VWebSocket.prototype.onclose = function () {
	if (this.onclose) return this.onclose();
	else return false;
};