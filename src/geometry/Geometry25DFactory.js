"use strict";

/**
 * This class aims to create extruded geometries from polygon
 * 
 * @class Geometry25DFactory
 * @constructor
 */
var Geometry25DFactory = function(args) {

    args = args || {};
    this._pointMaterial = args.pointMaterial ||
                          new THREE.ParticleSystemMaterial({
                              color : 0xFFFF00,
                              size : 5
                          });

    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({
        color : 0x00ee00,
        lineWidth : 3
    });

    this._polyhedralMaterial = args.polyhMaterial ||
                               new THREE.MeshLambertMaterial({
                                   color : 0xcc0000,
                                   wireframe : true
                               });
};

/**
 * @method isPoint Check if the geometry is a point
 * @param {THREE.Geometry} geometry Geometry to check
 * @returns {Boolean} true if the geometry is a point, false otherwise.
 */
Geometry25DFactory.prototype.isPoint = function(geometry) {
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
Geometry25DFactory.prototype.isLine = function(geometry) {
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
Geometry25DFactory.prototype.isPolyhedral = function(geometry) {
    var verticesCount = geometry.vertices.length;
    var facesCount = geometry.faces.length;
    if ((verticesCount > 2) && (facesCount > 0)) {
        return true;
    }
    return false;
};

/**
 * Creates an extruded geometry from a JSON object
 * 
 * @method _createGeometry
 * @param {Object} obj JSON object representing the geometry
 * @return {THREE.Geometry} Extruded geometry
 */
Geometry25DFactory.prototype._createGeometry = function(obj) {
    var points = obj.coordinates;
    var points2D = []; // List of 2D vector representing points
    // Each coordinate of the geometry
    for (var i = 0; i < points.length; i = i + 2) {
        points2D.push(new THREE.Vector2(points[i], points[i + 1]));
    }
    // Extrude geometry
    var shape = new THREE.Shape(points2D);
    var geometry = shape.extrude(obj.height);
    return geometry;
};

/**
 * @method create Create an array of 3D objects from a JSON Object
 * @param {Object} obj JSON object containing the geometries
 * @param {String} obj.type Type of the geometry. Must be 2.5.
 * @param {Array} obj.geometries Array containing the geometries to create
 * @returns {Array} array containing the meshes to add
 */
Geometry25DFactory.prototype.create = function(obj) {
    if (!obj || (((obj.type !== "2.5")))) {
        throw "Invalid geometry container";
    }
    var meshes = [];
    // Each geometry in the object
    obj.geometries.forEach(function(element) {
        var geometry = this._createGeometry(element);
        // Mesh
        var mesh;
        if (this.isPoint(geometry)) {
            mesh = new THREE.ParticleSystem(geometry, this._pointMaterial);
        }
        else if (this.isLine(geometry)) {
            mesh = new THREE.Line(geometry, this._lineMaterial);
        }
        else {
            mesh = new THREE.Mesh(geometry, this._polyhedralMaterial);
        }
        meshes.push(mesh);
    });
    return meshes;
};
