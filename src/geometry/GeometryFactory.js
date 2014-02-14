/* global GeometryType */
"use strict";

/**
 * @class GeometryFactory Create an Object3D from a JSON Object containing the
 *        geometries. It must be extended.
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {THREE.Material} args.polyhedralMaterial Material to use on polyhedral
 *                geometries
 * @param {THREE.Material} args.pointMaterial Material to use on points
 * @param {THREE.Material} args.lineMaterial Material to use on lines
 */
var GeometryFactory = function(args) {
    args = args || {};

    this._polyhedralMaterial = args.polyhedralMaterial ||
                               new THREE.MeshLambertMaterial({
                                   color : 0xcc0000,
                                   wireframe : true
                               });

    this._pointMaterial = args.pointMaterial ||
                          new THREE.ParticleSystemMaterial({
                              color : 0xFFFF00,
                              size : 5
                          });

    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({
        color : 0x00ee00,
        lineWidth : 3
    });

};

/**
 * @method parseGeometry Creates an extruded geometry from a JSON object
 * @param {Object} obj JSON object representing the geometry
 * @return {THREE.Geometry} Extruded geometry
 */
GeometryFactory.prototype.parseGeometry = function() {
    throw "To be implemented";
};

/**
 * @method isValid Check if the object containing the geometries is valid
 * @param {Object} obj Object to be checked
 * @returns {Boolean} True if valid, false otherwise.
 */
GeometryFactory.prototype.isValid = function() {
    throw "To be implemented";
};

/**
 * @method createFromGeometry create an Object3D based on a geometry and its
 *         type.
 * @param geometry
 * @returns {THREE.Object3D} The Object 3D representing the geometry
 */
GeometryFactory.prototype.createFromGeometry = function(geometry) {
    var mesh;
    if (GeometryType.isPoint(geometry)) {
        mesh = new THREE.ParticleSystem(geometry, this._pointMaterial);
    }
    else if (GeometryType.isLine(geometry)) {
        mesh = new THREE.Line(geometry, this._lineMaterial);
    }
    else {
        mesh = new THREE.Mesh(geometry, this._polyhedralMaterial);
    }
    return mesh;
};

/**
 * @method create Create an array of 3D objects from a JSON Object
 * @param {Object} obj JSON object containing the geometries
 * @param {String} obj.type Type of the geometry. Must be 2.5.
 * @param {Array} obj.geometries Array containing the geometries to create
 * @returns {Array} array containing the meshes to add
 */
GeometryFactory.prototype.create = function(obj) {
    if (!this.isValid(obj)) {
        throw "Invalid geometry container";
    }

    var self = this;
    var meshes = [];
    obj.geometries.forEach(function(element) {
        var geometry = self.parseGeometry(element);
        var mesh = self.createFromGeometry(geometry);
        meshes.push(mesh);
    });
    return meshes;
};
