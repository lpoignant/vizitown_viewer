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
                          new THREE.ParticleBasicMaterial({
                              size: 5
                          });

    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({
        color: 0x00ee22,
        linewidth: 3
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

GeometryFactory.prototype._centerGeometry = function(geometry, centroid) {
    var centro = centroid || this._centroid(geometry);
    centro.z = 0;

    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(-centro.x, -centro.y, -centro.z);
    geometry.applyMatrix(translationMatrix);

    geometry.centroid = centro;
};

GeometryFactory.prototype._levelPoint = function(point) {
    if (!self.dem) {
        return;
    }
    var position = point.centroid || point;
    var height = self.dem.height(position);
    point.z += height;
};

GeometryFactory.prototype._levelLine = function(line) {
    if (!self.dem) {
        return;
    }
    var self = this;
    geometry.vertices.forEach(function(point) {
        self._levelPoint(point);
    });
};

GeometryFactory.prototype._levelPolygon = function(polygone) {
    if (!self.dem) {
        return;
    }
    var position = polygone.centroid || this._centroid(polygone);
    var height = self.dem.height(position);

    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(0, 0, height);
    polygon.applyMatrix(translationMatrix);
};

GeometryFactory.prototype._createLines = function(geometries, color) {
    var material = this._lineMaterial.clone();
    material.color = color;

    var meshes = [geometries.length];
    var self = this;
    geometries.forEach(function(element) {
        // Line geometry
        var geometry = self._parseLine(element);
        var centroid = self._centroid(geometry);
        self._centerGeometry(geometry, centroid);
        self._levelLine(geometry);
        // Line mesh
        var mesh = new THREE.Line(geometry, material);
        mesh.position = centroid;

        meshes.push(mesh);
    });
    return meshes;
};

GeometryFactory.prototype._createPoints = function(geometries, color) {
    var material = this._pointMaterial.clone();
    material.color = color;

    var self = this;
    var particles = new THREE.Geometry();
    geometries.forEach(function(element) {
        // Point geometry
        var particle = self._parsePoint(element);
        self._levelPoint(particle);
        particles.vertices.push(particle);
    });
    // One mesh for all points
    var centroid = this._centerGeometry(particles);
    var particleSystem = new THREE.ParticleSystem(particles, material);
    particleSystem.position = centroid;
    return [particleSystem];
};

GeometryFactory.prototype._createPolygons = function(geometries, color) {
    var material = this._polyhedralMaterial.clone();
    material.color = color;

    var self = this;
    var geomBuffer = new THREE.Geometry();
    // Buffering all polygon geometries
    obj.geometries.forEach(function(element) {
        // Polygon geometry
        var geometry = self._parsePolygon(element);
        // Do not center since we are using buffering
        self._levelPolygon(geometry);

        THREE.GeometryUtils.merge(geomBuffer, geometry);
    });

    // Translate mesh to geometries centroid
    var centroid = this._centerGeometry(geometry);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position = centroid;
    return [mesh];
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
    var color = new THREE.Color(parseInt(obj.color.substring(1), 16));

    var type = obj.type;
    if (type === "point") {
        return this._createPoints(obj.geometries, color);
    }
    if (type === "line") {
        return this._createLines(obj.geometries, color);
    }
    else {
        return this._createPolygons(obj.geometries, color);
    }
};
