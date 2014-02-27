/* global Geometry2DFactory */
"use strict";

/**
 * This create a Flat Object3D from a polygon
 * 
 * @class GeometryShadowVolumeFactory
 * @extends GeometryFactory
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {THREE.Material} args.polyhedralMaterial Material to use on polyhedral
 *                geometries
 * @param {THREE.Material} args.pointMaterial Material to use on points
 * @param {THREE.Material} args.lineMaterial Material to use on lines
 */
var GeometryVolumeFactory = function(args) {
    args = args || {};
    Geometry2DFactory.call(this, args);

    this._minHeight = args.minHeight || -1;
    this._maxHeight = args.maxHeight || 1;

    this._extrudeSettings = {
        bevelEnabled: false,
        steps: 1,
        amount: this.maxHeight() - this.minHeight(),
    };
};
GeometryVolumeFactory.inheritsFrom(Geometry2DFactory);

GeometryVolumeFactory.prototype.setMinHeight = function(height) {
    this._minHeight = height;
    this._extrudeSettings.amount = this.maxHeight() - this.minHeight();
};

GeometryVolumeFactory.prototype.setMaxHeight = function(height) {
    this._maxHeight = height;
    this._extrudeSettings.amount = this.maxHeight() - this.minHeight();
};

GeometryVolumeFactory.prototype.minHeight = function() {
    return this._minHeight;
};

GeometryVolumeFactory.prototype.maxHeight = function() {
    return this._maxHeight;
};

GeometryVolumeFactory.prototype._levelPolygon = function(polygon) {
    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(0, 0, this.minHeight());
    polygon.applyMatrix(translationMatrix);
};

GeometryVolumeFactory.prototype._parseLine = function(obj) {
    var points = obj.coordinates;
    var geometry = new THREE.Geometry();
    for (var i = 0; i < points.length; i = i + 2) {
        var coords = new THREE.Vector3(points[i], points[i + 1], 0);
        geometry.vertices.push(coords);
    }

    return geometry;
};

GeometryVolumeFactory.prototype._parsePolygon = function(obj) {
    var points = obj.coordinates;
    var shape = new THREE.Shape();
    for (var i = 0; i < points.length; i = i + 2) {
        shape.moveTo(points[i], points[i + 1]);
    }
    shape.extrude(this._extrudeSettings);
    return shape.makeGeometry();
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
