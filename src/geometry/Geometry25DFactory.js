/* global GeometryFactory */
"use strict";

/**
 * This create a Flat Object3D from a polygon
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
 * Creates a 2.5D point(2D point with a height) from a JSON Model object
 * 
 * @method _parsePoint
 * @param {Object} obj JSON object respecting model format and representing the
 *                point
 * @return {THREE.Vector3} Created vector
 */
Geometry25DFactory.prototype._parsePoint = function(obj) {
    var point = obj.coordinates;
    var height = obj.height || 0;
    return new THREE.Vector3(point[0], point[1], height);
};

/**
 * Creates a 2.5D line(2D line with a height) from a JSON Model object
 * 
 * @method _parseLine
 * @param {Object} obj JSON object respecting model format and representing the
 *                line
 * @return {THREE.Geometry} Created geometry
 */
Geometry25DFactory.prototype._parseLine = function(obj) {
    var points = obj.coordinates;
    var height = obj.height || 0;
    var geometry = new THREE.Geometry();
    for (var i = 0; i < points.length; i = i + 2) {
        var coords = new THREE.Vector3(points[i], points[i + 1], height);
        geometry.vertices.push(coords);
    }
    return geometry;
};

/**
 * Creates a 2.5D polygon(2D polygon with a height) from a JSON Model object
 * 
 * @method _parsePolygon
 * @param {Object} obj JSON object respecting model format and representing the
 *                polygon
 * @return {THREE.Geometry} Created geometry
 */
Geometry25DFactory.prototype._parsePolygon = function(obj) {
    var points = obj.coordinates;
    var shape = new THREE.Shape();
    for (var i = 0; i < points.length; i = i + 2) {
        shape.moveTo(points[i], points[i + 1]);
    }
    this._extrudeSettings.amount = obj.height;
    var geometry = shape.extrude(this._extrudeSettings);
    return geometry;
};
