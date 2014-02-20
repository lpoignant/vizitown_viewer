/* global EventDispatcher:true */
"use strict";

require('../src/core/Function.js');
var EventDispatcher = require('../src/core/EventDispatcher.js');
var assert = require("assert");

describe('Function', function() {
    var LivingThing = {
        beBorn: function() {
            this.alive = true;
        }
    };

    var Mammal = function(name) {
        this.name = name;
        this.offspring = [];
    };

    Mammal.inheritsFrom(LivingThing);
    Mammal.prototype.haveABaby = function() {
        this.ancestor.beBorn.call(this);
        var newBaby = new this.constructor("Baby " + this.name);
        this.offspring.push(newBaby);
        return newBaby;
    };

    var Cat = function(name) {
        Mammal.call(this, name);
    };
    Cat.inheritsFrom(Mammal);

    Cat.prototype.haveABaby = function() {
        var theKitten = this.ancestor.haveABaby.call(this);
        return theKitten;
    };

    Cat.prototype.toString = function() {
        return '[Cat "' + this.name + '"]';
    };

    var cat, kitten;

    beforeEach(function(done) {
        cat = new Cat("Felix");
        kitten = cat.haveABaby();
        done();
    });

    describe('#assign', function() {
        it('should be felix the cat', function() {
            assert.equal('[Cat "Felix"]', cat.toString());
        });
    });

    describe('#override', function() {
        it('should be a baby felix', function() {
            assert.equal('[Cat "Baby Felix"]', kitten.toString());
        });
    });

    describe('#superContructor', function() {
        it('should be a mother and child', function() {
            assert.equal(true, cat.alive);
            assert.equal(undefined, kitten.alive);
            assert.equal(1, cat.offspring.length);
            assert.equal(0, kitten.offspring.length);
        });
    });

});

describe('EventDispatcher', function() {

    var echo = "echo";

    var EventProvider = function() {};
    EventProvider.inheritsFrom(EventDispatcher);

    describe('#registerEventListener', function() {
        it("should have a listener", function() {
            var event1 = "event1";
            var p1 = new EventProvider();
            var f1 = function() {};
            p1.addEventListener(event1, f1);
            assert.equal(true, p1._hasEventListener(event1, f1));
        });
    });

    describe('#dispatch', function() {
        it('should dispatch', function(done) {
            var event2 = "event2";
            var p2 = new EventProvider();
            var f2 = function(object) {
                assert.equal(echo, object.message);
                done();
            };
            p2.addEventListener(event2, f2);
            p2.dispatch(event2, {
                message: echo
            });
            p2.removeEventListener(event2, f2);
            assert.equal(false, p2._hasEventListener(event2, f2));
        });
    });

    describe('#removeEventListener', function() {
        it("shouldn't have a listener", function() {
            var event3 = "event3";
            var p3 = new EventProvider();
            var f3 = function() {};
            p3.addEventListener(event3, f3);
            p3.removeEventListener(event3, f3);
            assert.equal(false, p3._hasEventListener(event3, f3));
        });
    });

});
