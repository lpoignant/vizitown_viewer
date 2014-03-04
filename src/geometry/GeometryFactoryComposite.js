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
    this._objects = [];

    var self = this;
    this._interval = setInterval(function() {
        var object = self._objects.shift();
        if (object === undefined) {
            self._layer.loadingListener.dispatchEvent(new CustomEvent('loading', {
                'detail': false
            }));
        }
        else {
            self._layer.loadingListener.dispatchEvent(new CustomEvent('loading', {
                'detail': true
            }));
        }
        self._create(object);
    }, 200);

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

/**
 * Add a DEM to translate polygon on it
 * 
 * @method setDEM
 * @param {TerrainLayer} dem
 */
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
 * @method _create
 * @param {Object} obj JSON object containing the type of geometries and an
 *                array of geometries
 * @param {String} obj.type String representing the type of the geometry
 * @param {Array} obj.geometries Array of JSON object representing the geometry
 * @return {Array} An array containing the newly created mesh
 */
GeometryFactoryComposite.prototype._create = function(obj) {
    if (!obj || !obj.dim) {
        return;
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

/**
 * Add object into creation buffer
 * 
 * @method create
 * @param {Object} obj JSON object containing the type of geometries and an
 *                array of geometries
 */
GeometryFactoryComposite.prototype.create = function(obj) {
    this._objects.push(obj);
};
