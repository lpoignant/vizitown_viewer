//VWebSocket = require('../src/core/VWebSocket.js');

describe('VWebSocket', function () {
	
	describe('#onopen', function () {
		it('should be opened', function () {
			var ws = new VWebSocket({
				host: "127.0.0.1",
				port: "8888",
				uri: "/echows",
				onopen: function () {
					assert(true, 'socket is opened'); 
				},
			});
		});
	});
	
});