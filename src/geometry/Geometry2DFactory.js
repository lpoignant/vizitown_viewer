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

Geometry2DFactory.prototype._parsePoint = function(obj) {
    var point = obj.coordinates;
    console.log(obj);
    var vec = new THREE.Vector3(point[0], point[1], 0);
    console.log(vec);
    return vec;
};

Geometry2DFactory.prototype._parseLine = function(obj) {
    var points = obj.coordinates;
    var geometry = new THREE.Geometry();
    for (var i = 0; i < points.length; i = i + 2) {
        var coords = new THREE.Vector3(points[i], points[i + 1], 0);
        geometry.vertices.push(coords);
    }
    return geometry;
};

Geometry2DFactory.prototype._parsePolygon = function(obj) {
    var points = obj.coordinates;
    var shape = new THREE.Shape();
    for (var i = 0; i < points.length; i = i + 2) {
        shape.moveTo(points[i], points[i + 1]);
    }
    return shape.makeGeometry();
};
