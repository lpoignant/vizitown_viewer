/* exported EventDispatcher */
"use strict";
/**
 * This class is meant to be inherited from. It provides support of event.
 * 
 * @class EventDispatcher
 * @constructor
 */
var EventDispatcher = function() {
    this._events = {};
};

/**
 * Register a listener to be called when an event is dispatched.
 * 
 * @method registerEventListener
 * @param {String} event Name of the event to listen
 * @param {Function} listener Function called when event is emitted
 */
EventDispatcher.prototype.registerEventListener = function(event, listener) {
    if (!this._events.hasOwnProperty(event)) {
        this._events[event] = [];
    }
    this._events[event].push(listener);
};

/**
 * Function used to dispatch event. Call the listeners registered when called.
 * 
 * @method dispatch
 * @param {String} event Event name
 * @param {Object} detail JSON object reprensenting the data of the event
 */
EventDispatcher.prototype.dispatch = function(event, detail) {
    if (!this._events.hasOwnProperty(event)) {
        return;
    }

    // Respecting Javascript CustomEvent key
    var customEvent = {
        name : event,
        detail : detail
    };

    this._events[event].forEach(function(entry) {
        entry(customEvent);
    });
};

/**
 * Removes the event listener previously registered with registerEventListener
 * 
 * @method removeEventListener
 * @param {String} event Event name
 * @param {Object} listener Listener to remove
 */
EventDispatcher.prototype.removeEventListener = function(event, listener) {
    if (!this._events.hasOwnProperty(event)) {
        return;
    }

    // Going back to prevent splice from messgin indexes
    for (var i = this._events[event].length - 1; i >= 0; i -= 1) {
        if (this._events[event][i] === listener) {
            this._events[event].splice(i, 1);
        }
    }
};

EventDispatcher.prototype._hasEventListener = function(event, listener) {
    if (!this._events.hasOwnProperty(event)) {
        return false;
    }

    var hasEvent = this._events[event].some(function(entry) {
        return (entry === listener);
    });

    return hasEvent;
};

module.exports = EventDispatcher;
