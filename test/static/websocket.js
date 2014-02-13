/* global VWebSocket */
/* jshint unused:false */
"use strict";

describe('VWebSocket', function () {
	var vhost = "127.0.0.1";
	var vport = "8888";
	var vpath = "/test/echo";
	
	describe('#onopen', function () {
		it('should be opened', function (done) {
			var ws = new VWebSocket({
				host: vhost,
				port: vport,
				path: vpath,
				onopen: function () {
					assert(true, 'socket is opened');
					done();
					this.close();
				}
			});
		});
	});
	
	describe('#onmessage', function () {
		it('should echo', function (done) {
			var echo = 'echo';
			var ws = new VWebSocket({
				host: vhost,
				port: vport,
				path: vpath,
				onopen:  function () {
					ws.socket.send(echo);
				},
				onmessage: function (message) {
                    console.log(message);
					assert.equal(echo, message.data);
					done();
				}
			});
		});
	});
	
});