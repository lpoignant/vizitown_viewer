/* global GeometryFactory */
"use strict";

/**
 * This create a Flat Object3D from a polygon
 * 
 * @class Geometry2DFactory
 * @extends GeometryFactory
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {THREE.Material} args.polyhedralMaterial Material to use on polyhedral
 *                geometries
 * @param {THREE.Material} args.pointMaterial Material to use on points
 * @param {THREE.Material} args.lineMaterial Material to use on lines
 */
var Geometry2DFactory = function(args) {
    args = args || {};
    GeometryFactory.call(this, args);
};
Geometry2DFactory.inheritsFrom(GeometryFactory);

/**
 * Check if the object containing the geometries is valid
 * 
 * @method isValid
 * @param {Object} obj Object to be checked
 * @returns {Boolean} True if valid, false otherwise.
 */
Geometry2DFactory.prototype.isValid = function(obj) {
    if (!obj || obj.type !== "2") {
        return false;
    }
    return true;
};

/**
 * @method parseGeometry Creates an extruded geometry from a JSON object
 * @param {Object} obj JSON object representing the geometry
 * @return {THREE.Geometry} Extruded geometry
 */
Geometry2DFactory.prototype.parseGeometry = function(obj) {
    var points = obj.coordinates;
    var points2D = []; // List of 2D vector representing points
    // Each coordinate of the geometry
    for (var i = 0; i < points.length; i = i + 2) {
        points2D.push(new THREE.Vector2(points[i], points[i + 1]));
    }
    // Extrude geometry
    var shape = new THREE.Shape(points2D);
    return shape.makeGeometry();
};
