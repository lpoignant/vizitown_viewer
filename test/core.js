require('../src/core/Function.js');
VWebSocket = require('../src/core/VWebSocket.js');
var assert = require("assert");

describe('Function', function () {
	var LivingThing = {
		beBorn: function () {
			this.alive = true;
		}
	};
	
	var Mammal = function (name) {
		this.name = name;
		this.offspring = [];
	};
	Mammal.inheritsFrom(LivingThing);
	Mammal.prototype.haveABaby = function () {
		this.parent.beBorn.call(this);
		var newBaby = new this.constructor("Baby "+this.name);
		this.offspring.push(newBaby);
		return newBaby;
	};
	
	var Cat = function (name) {
		Mammal.call(this, name);
	};
	Cat.inheritsFrom(Mammal);
	
	Cat.prototype.haveABaby = function () {
		var theKitten = this.parent.haveABaby.call(this);
		return theKitten;
	};
	
	Cat.prototype.toString = function () {
		return '[Cat "'+this.name+'"]';
	};
	
	var cat, kitten;
	
	beforeEach(function (done) {
		cat = new Cat("Felix");
		kitten = cat.haveABaby();
		done();
	});
	
	describe('#assign', function () {
		it('should be felix the cat', function () {
			assert.equal('[Cat "Felix"]', cat.toString());
		});
	});
	
	describe('#override', function () {
		it('should be a baby felix', function () {
			assert.equal('[Cat "Baby Felix"]', kitten.toString());
		});
	});
	
	describe('#superContructor', function () {
		it('should be a mother and child', function () {
			assert.equal(true, cat.alive);
			assert.equal(undefined, kitten.alive);
			assert.equal(1, cat.offspring.length);
			assert.equal(0, kitten.offspring.length);
		});
	});
	
});
/*
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
*/