/* global GeometryFactory */
"use strict";

/**
 * This class creates extruded geometries from polygon
 * 
 * @class Geometry25DFactory
 * @extends GeometryFactory
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {THREE.Material} args.polyhedralMaterial Material to use on polyhedral
 *                geometries
 * @param {THREE.Material} args.pointMaterial Material to use on points
 * @param {THREE.Material} args.lineMaterial Material to use on lines
 */
var Geometry25DFactory = function(args) {
    args = args || {};
    GeometryFactory.call(this, args);
    this._extrudeSettings = {
        bevelEnabled: false,
        steps: 1,
    };
};
Geometry25DFactory.inheritsFrom(GeometryFactory);

/**
 * Creates an extruded geometry from a JSON object
 * 
 * @method parseGeometry
 * @param {Object} obj JSON object representing the geometry
 * @return {THREE.Geometry} Extruded geometry
 */
Geometry25DFactory.prototype.parseGeometry = function(obj) {
    var points = obj.coordinates;
    var points2D = []; // List of 2D vector representing points
    // Each coordinate of the geometry
    for (var i = 0; i < points.length; i = i + 2) {
        points2D.push(new THREE.Vector2(points[i], points[i + 1]));
    }
    // Extrude geometry
    var shape = new THREE.Shape(points2D);
    this._extrudeSettings.amount = obj.height;
    var geometry = shape.extrude(this._extrudeSettings);
    return geometry;
};

/**
 * @method _centroid
 * @param geometry
 * @returns {THREE.Vector3}
 */
Geometry25DFactory.prototype._centroid = function(geometry) {
    var centroid = new THREE.Vector3();
    var vertices = geometry.vertices;
    for (var i = 0; i < vertices.length; i++) {
        centroid.add(vertices[i]);
    }
    centroid.z = 0;
    centroid.divideScalar(vertices.length);
    return centroid;
};

/**
 * Check if the object containing the geometries is valid
 * 
 * @method isValid
 * @param {Object} obj Object to be checked
 * @returns {Boolean} True if valid, false otherwise.
 */
Geometry25DFactory.prototype.isValid = function(obj) {
    if (!obj || obj.type !== "2.5") {
        return false;
    }
    return true;
};
