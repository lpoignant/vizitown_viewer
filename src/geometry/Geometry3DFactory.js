/* global GeometryFactory */
"use strict";

/**
 * @class Geometry3DFactory This class create a 3D geometry from a JSON Model
 *        object
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
 * Check if the object containing the geometries is valid
 * 
 * @method isValid
 * @param {Object} obj Object to be checked
 * @returns {Boolean} True if valid, false otherwise.
 */
Geometry3DFactory.prototype.isValid = function(obj) {
    if (!obj || obj.type !== "3") {
        return false;
    }
    return true;
};

/**
 * @method parseGeometry Creates a geometry from a JSON Model object
 * @param {Object} obj JSON object respecting model format and representing the
 *                geometry
 * @return {THREE.Geometry} Created geometry
 */
Geometry3DFactory.prototype.parseGeometry = function(geometry) {
    return this._loader.parse(geometry);
};
