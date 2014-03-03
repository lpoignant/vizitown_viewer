/* global GeometryFactory */
"use strict";

/**
 * This class creates a 3D object from a JSON Model
 * 
 * @class Geometry3DFactory
 * @extends GeometryFactory
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {THREE.Material} args.polyhedralMaterial Material to use on polyhedral
 *                geometries
 * @param {THREE.Material} args.pointMaterial Material to use on points
 * @param {THREE.Material} args.lineMaterial Material to use on lines
 */
var Geometry3DFactory = function(args) {
    args = args || {};
    GeometryFactory.call(this, args);
    this._loader = new THREE.JSONLoader();
};
Geometry3DFactory.inheritsFrom(GeometryFactory);

/**
 * Creates a 3D point from a JSON Model object
 * 
 * @method _parsePoint
 * @param {Object} obj JSON object respecting model format and representing the
 *                point
 * @return {THREE.Geometry} Created geometry
 */
Geometry3DFactory.prototype._parsePoint = function(obj) {
    return this._parseGeometry(obj);
};

/**
 * Creates a 3D line from a JSON Model object
 * 
 * @method _parseLine
 * @param {Object} obj JSON object respecting model format and representing the
 *                line
 * @return {THREE.Geometry} Created geometry
 */
Geometry3DFactory.prototype._parseLine = function(obj) {
    return this._parseGeometry(obj);
};

/**
 * Creates a 3D polygon from a JSON Model object
 * 
 * @method _parsePolygon
 * @param {Object} obj JSON object respecting model format and representing the
 *                polygon
 * @return {THREE.Geometry} Created geometry
 */
Geometry3DFactory.prototype._parsePolygon = function(obj) {
    return this._parseGeometry(obj);
};

/**
 * Creates a geometry from a JSON Model object
 * 
 * @method _parseGeometry
 * @param {Object} obj JSON object respecting model format and representing the
 *                geometry
 * @return {THREE.Geometry} Created geometry
 */
Geometry3DFactory.prototype._parseGeometry = function(obj) {
    // THREE.JSONLoader() returns an object containing the geometry
    var parsedObject = this._loader.parse(obj);
    return parsedObject.geometry;
};
