"use strict";

/**
 * @class GeometryFactory
 * @constructor
 * 
 * 
 */
var GeometryFactoryComposite = function() {
    this._geometry2DFactory = new Geometry2DFactory();
    this._geometry25DFactory = new Geometry25DFactory();
};

/**
 * @method create Create geometries based on JSON object
 * @param {Object}
 *        obj JSON object containing the type of geometries and an array of
 *        geometries
 * @param {String}
 *        obj.type String representing the type of the geometry
 * @param {Array}
 *        obj.geometries Array of JSON object representing the geometry
 */
GeometryFactoryComposite.prototype.create = function(obj) {
    if (!obj || !obj.type) {
        throw "Invalid geometry container";
    }
    switch (obj.type) {
        case "2":
            return this._geometry2DFactory(obj.geometries);
        case "2.5":
            return this._geometry25DFactory(obj.geometries);
        case "3":
            return this._geometry3DFactory(obj.geometries);
        default:
            throw "Invalid geometry container";
    }
};