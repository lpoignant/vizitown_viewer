/* global Geometry2DFactory, Geometry25DFactory, Geometry3DFactory */
"use strict";

/**
 * Creates Object3D based on a JSON Object containing geometries and the type of
 * dimensions
 * 
 * @class GeometryFactoryComposite
 * @constructor
 */
var GeometryFactoryComposite = function() {
    this._geometry2DFactory = new Geometry2DFactory();
    this._geometry25DFactory = new Geometry25DFactory();
    this._geometry3DFactory = new Geometry3DFactory();
};

/**
 * Creates geometries based on JSON object
 * 
 * @method create
 * @param {Object} obj JSON object containing the type of geometries and an
 *                array of geometries
 * @param {String} obj.type String representing the type of the geometry
 * @param {Array} obj.geometries Array of JSON object representing the geometry
 * @returns {Array} An array containing the newly created mesh
 */
GeometryFactoryComposite.prototype.create = function(obj) {
    if (!obj || !obj.type) {
        throw "Invalid geometry container";
    }

    switch (obj.type) {
        case "2":
            return this._geometry2DFactory.create(obj);
        case "2.5":
            return this._geometry25DFactory.create(obj);
        case "3":
            return this._geometry3DFactory.create(obj);
        default:
            throw "Invalid geometry container";
    }
};
