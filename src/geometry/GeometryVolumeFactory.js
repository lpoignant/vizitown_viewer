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

    this._polyhedralMaterial = args.polyhedralMaterial || new THREE.MeshBasicMaterial({
        color: 0x5728cd,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    this._extrudeSettings = {
        bevelEnabled: false,
        steps: 1,
        amount: this.maxHeight() - this.minHeight() + 1,
    };
};
GeometryVolumeFactory.inheritsFrom(Geometry2DFactory);

/**
 * Setter for minHeight
 * 
 * @method setMinHeight
 * @param {Number} height
 */
GeometryVolumeFactory.prototype.setMinHeight = function(height) {
    this._minHeight = height;
    this._extrudeSettings.amount = this.maxHeight() - this.minHeight() + 1;
};

/**
 * Setter for maxHeight
 * 
 * @method setMaxHeight
 * @param {Number} height
 */
GeometryVolumeFactory.prototype.setMaxHeight = function(height) {
    this._maxHeight = height;
    this._extrudeSettings.amount = this.maxHeight() - this.minHeight() + 1;
};

/**
 * Getter for minHeight
 * 
 * @method minHeight
 * @return {Number} minHeight
 */
GeometryVolumeFactory.prototype.minHeight = function() {
    return this._minHeight;
};

/**
 * Getter for maxHeight
 * 
 * @method maxHeight
 * @return {Number} maxHeight
 */
GeometryVolumeFactory.prototype.maxHeight = function() {
    return this._maxHeight;
};

/**
 * Level a polygon at the min height
 * 
 * @method _levelPolygon
 * @param {THREE.Geometry} polygon The polygon to translate
 */
GeometryVolumeFactory.prototype._levelPolygon = function(polygon) {
    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(0, 0, this.minHeight());
    polygon.applyMatrix(translationMatrix);
};

/**
 * Creates a 3D polygon from a JSON Model object
 * 
 * @method _parsePolygon
 * @param {Object} obj JSON object respecting model format and representing the
 *                polygon
 * @return {THREE.Geometry} Created geometry
 */
GeometryVolumeFactory.prototype._parsePolygon = function(obj) {
    var points = obj.coordinates;
    var shape = new THREE.Shape();
    for (var i = 0; i < points.length; i = i + 2) {
        shape.moveTo(points[i], points[i + 1]);
    }
    var geometry = shape.extrude(this._extrudeSettings);
    return geometry;
};

/**
 * Create colored points in a QGISLayer
 * 
 * @method _createPoints
 * @param {String} uuid Unique identifier of the QGIS layer
 * @param {Array} geometries Array containing the geometries to create
 * @param {THREE.color} color Color of the polygons
 */
GeometryVolumeFactory.prototype._createPolygons = function(uuid, geometries, color) {
    var material = this._polyhedralMaterial.clone();
    material.color = color;

    var self = this;
    // Buffering all polygon geometries
    geometries.forEach(function(element) {
        // Polygon geometry
        var geometry = self._parsePolygon(element);
        // Do not center since we are using buffering
        self._levelPolygon(geometry);
        var centroid = self._centerGeometry(geometry);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position = centroid.clone();
        self._layer.addToVolume(mesh, uuid);
    });

    // Translate mesh to geometries centroid
};
