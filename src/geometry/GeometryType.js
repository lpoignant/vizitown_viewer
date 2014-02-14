"use strict";

/**
 * @class GeometryType This class provides static methods to detect the geometry
 *        type
 */
var GeometryType = function() {

};

/**
 * @method isPoint Check if the geometry is a point
 * @param {THREE.Geometry} geometry Geometry to check
 * @returns {Boolean} true if the geometry is a point, false otherwise.
 */
GeometryType.isPoint = function(geometry) {
    var verticesCount = geometry.vertices.length;
    if (verticesCount === 1) {
        return true;
    }
    return false;
};

/**
 * @method isLine Check if the geometry is a line
 * @param {THREE.Geometry} geometry Geometry to check
 * @returns {Boolean} true if the geometry is a line, false otherwise.
 */
GeometryType.isLine = function(geometry) {
    var verticesCount = geometry.vertices.length;
    var facesCount = geometry.faces.length;
    if ((verticesCount > 1) && (facesCount === 0)) {
        return true;
    }
    return false;
};

/**
 * @method isPolyhedral Check if the geometry is a polyhedral
 * @param {THREE.Geometry} geometry Geometry to check
 * @returns {Boolean} true if the geometry is a polyhedral, false otherwise.
 */
GeometryType.isPolyhedral = function(geometry) {
    var verticesCount = geometry.vertices.length;
    var facesCount = geometry.faces.length;
    if ((verticesCount > 2) && (facesCount > 0)) {
        return true;
    }
    return false;
};
