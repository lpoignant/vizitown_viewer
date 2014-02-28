/* global Geometry2DFactory, Geometry25DFactory, Geometry3DFactory, GeometryVolumeFactory */
"use strict";

/**
 * Creates Object3D based on a JSON Object containing geometries and the type of
 * dimensions
 * 
 * @class GeometryFactoryComposite
 * @constructor
 */
var GeometryFactoryComposite = function(args) {
    this._layer = args.layer;
    this._geometry2DFactory = new Geometry2DFactory({
        layer: this._layer
    });
    this._geometry25DFactory = new Geometry25DFactory({
        layer: this._layer
    });
    this._geometry3DFactory = new Geometry3DFactory({
        layer: this._layer
    });
};

GeometryFactoryComposite.prototype.setDEM = function(dem) {
    this._geometry25DFactory.dem = dem;
    this._geometry3DFactory.dem = dem;
    this._geometry2DFactory = new GeometryVolumeFactory({
        layer: this._layer,
        minHeight: dem.minHeight,
        maxHeight: dem.maxHeight
    });
    this._geometry2DFactory.dem = dem;
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
    if (!obj || !obj.dim) {
        return;
        // throw "Invalid geometry container";
    }

    switch (obj.dim) {
        case "2":
            this._geometry2DFactory.create(obj);
            break;
        case "2.5":
            this._geometry25DFactory.create(obj);
            break;
        case "3":
            this._geometry3DFactory.create(obj);
            break;
        default:
            throw "Invalid geometry container";
    }
};
