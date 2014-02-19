/* global GeometryType */
"use strict";

/**
 * Create an Object3D from a JSON Object containing the geometries. It must be
 * extended.
 * 
 * @class GeometryFactory
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
                               new THREE.MeshLambertMaterial();

    this._pointMaterial = args.pointMaterial ||
                          new THREE.ParticleSystemMaterial({
                              size: 5
                          });

    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({
        lineWidth: 3
    });

};

/**
 * @method _centroid
 * @param geometry
 * @returns {THREE.Vector3}
 */
GeometryFactory.prototype._centroid = function(geometry) {
    var centroid = new THREE.Vector3();
    var vertices = geometry.vertices;
    for (var i = 0; i < vertices.length; i++) {
        centroid.add(vertices[i]);
    }
    centroid.divideScalar(vertices.length);
    return centroid;
};

/**
 * Creates an extruded geometry from a JSON object
 * 
 * @method parseGeometry
 * @param {Object} obj JSON object representing the geometry
 * @return {THREE.Geometry} Extruded geometry
 */
GeometryFactory.prototype.parseGeometry = function() {
    throw "To be implemented";
};

/**
 * Checks if the object containing the geometries is valid
 * 
 * @method isValid
 * @param {Object} obj Object to be checked
 * @returns {Boolean} True if valid, false otherwise.
 */
GeometryFactory.prototype.isValid = function() {
    throw "To be implemented";
};

/**
 * Creates an Object3D based on a geometry and its type.
 * 
 * @method createFromGeometry
 * @param {THREE.Geometry} geometry
 * @param {Object} materials Container for all the type of materials
 * @returns {THREE.Object3D} The Object 3D representing the geometry
 */
GeometryFactory.prototype.createFromGeometry = function(geometry, materials) {
    // Center the geometry
    var centroid = this._centroid(geometry);
    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(-centroid.x, -centroid.y, -centroid.z);
    geometry.applyMatrix(translationMatrix);
    // Create the mesh
    var mesh;
    if (GeometryType.isPoint(geometry)) {
        mesh = new THREE.ParticleSystem(geometry, materials.point);
    }
    else if (GeometryType.isLine(geometry)) {
        mesh = new THREE.Line(geometry, materials.line);
    }
    else {
        mesh = new THREE.Mesh(geometry, materials.polyhedral);
    }
    mesh.position = centroid;
    return mesh;
};

/**
 * Creates an array of 3D objects from a JSON Object
 * 
 * @method create
 * @param {Object} obj JSON object containing the geometries
 * @param {String} obj.type Type of the geometry. Must be 2.5.
 * @param {Array} obj.geometries Array containing the geometries to create
 * @returns {Array} array containing the meshes to add
 */
GeometryFactory.prototype.create = function(obj) {
    if (!this.isValid(obj)) {
        throw "Invalid geometry container";
    }

    var materials = {
        polyhedral: this._polyhedralMaterial.clone(),
        point: this._pointMaterial.clone(),
        line: this._lineMaterial.clone(),
    };

    var color = new THREE.Color(parseInt(obj.color.substring(1), 16));
    materials.polyhedral.color = color;
    materials.point.color = color;
    materials.line.color = color;

    var self = this;
    var meshes = [];
    obj.geometries.forEach(function(element) {
        var geometry = self.parseGeometry(element);
        var mesh = self.createFromGeometry(geometry, materials);
        meshes.push(mesh);
    });

    return meshes;
};
