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
    this._layer = args.layer;

    this._polyhedralMaterial = args.polyhedralMaterial || new THREE.MeshLambertMaterial({});

    this._pointMaterial = args.pointMaterial || new THREE.ParticleBasicMaterial({
        size: 10,
    });

    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({
        linewidth: 3,
    });
};

/**
 * Return the centroid of a geometry
 *
 * @method _centroid
 * @param {THREE.Geometry} geometry
 * @returns {THREE.Vector3} the centroid
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
 * Center a geometry with its centroid
 * 
 * @method _centerGeometry
 * @param {THREE.Geometry} geometry
 * @param {THREE.Vector3} centroid
 * @returns {THREE.Vector3} the centroid
 */
GeometryFactory.prototype._centerGeometry = function(geometry, centroid) {
    var centro = centroid || this._centroid(geometry);
    // Do not center on Z
    centro.z = 0;

    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(-centro.x, -centro.y, -centro.z);
    geometry.applyMatrix(translationMatrix);

    geometry.centroid = centro;
    return centro;
};

/**
 * Level a point with a DEM if exists
 * 
 * @method _levelPoint
 * @param {THREE.Geometry} point The point to translate
 */
GeometryFactory.prototype._levelPoint = function(point) {
    if (!this.dem) {
        return;
    }
    var position = point.centroid || point;
    var height = this.dem.height(position);
    point.z += height + 0.5;
};

/**
 * Level a line with a DEM if exists
 * 
 * @method _levelLine
 * @param {THREE.Geometry} line The line to translate
 */
GeometryFactory.prototype._levelLine = function(line) {
    if (!this.dem) {
        return;
    }
    var self = this;
    line.vertices.forEach(function(point) {
        self._levelPoint(point);
    });
};

/**
 * Level a polygon with a DEM if exists
 * 
 * @method _levelPolygon
 * @param {THREE.Geometry} polygon The polygon to translate
 */
GeometryFactory.prototype._levelPolygon = function(polygon) {
    if (!this.dem) {
        return;
    }
    var position = polygon.centroid || this._centroid(polygon);
    var height = this.dem.height(position);

    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(0, 0, height);
    polygon.applyMatrix(translationMatrix);
};

/**
 * Create colored lines in a QGISLayer
 * 
 * @method _createLines
 * @param {String} uuid Unique identifier of the QGIS layer
 * @param {Array} geometries Array containing the geometries to create
 * @param {THREE.color} color Color of the polygons
 */
GeometryFactory.prototype._createLines = function(uuid, geometries, color) {
    var material = this._lineMaterial.clone();
    material.color = color;
    var self = this;
    geometries.forEach(function(element) {
        // Line geometry
        var geometry = self._parseLine(element);
        var centroid = self._centroid(geometry);

        self._levelLine(geometry);
        self._centerGeometry(geometry, centroid);
        
        // Line mesh
        var mesh = new THREE.Line(geometry, material);
        mesh.position = centroid;

        self._layer.addToTile(mesh, uuid);
    });
};

/**
 * Create colored points in a QGISLayer
 * 
 * @method _createPoints
 * @param {String} uuid Unique identifier of the QGIS layer
 * @param {Array} geometries Array containing the geometries to create
 * @param {THREE.color} color Color of the polygons
 */
GeometryFactory.prototype._createPoints = function(uuid, geometries, color) {
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
    this._layer.addToTile(particleSystem, uuid);
};

/**
 * Create colored polygons in a QGISLayer
 * 
 * @method _createPolygons
 * @param {String} uuid Unique identifier of the QGIS layer
 * @param {Array} geometries Array containing the geometries to create
 * @param {THREE.color} color Color of the polygons
 */
GeometryFactory.prototype._createPolygons = function(uuid, geometries, color) {
    var material = this._polyhedralMaterial.clone();
    material.color = color;

    var self = this;
    var geomBuffer = new THREE.Geometry();
    // Buffering all polygon geometries
    geometries.forEach(function(element) {
        // Polygon geometry
        var geometry = self._parsePolygon(element);
        // Do not center since we are using buffering
        self._levelPolygon(geometry);

        THREE.GeometryUtils.merge(geomBuffer, geometry);
    });

    // Translate mesh to geometries centroid
    var centroid = this._centerGeometry(geomBuffer);
    var mesh = new THREE.Mesh(geomBuffer, material);
    mesh.position = centroid;
    this._layer.addToTile(mesh, uuid);
};

/**
 * Creates an array of 3D objects from a JSON Object
 * 
 * @method create
 * @param {Object} obj JSON object containing the geometries
 * @param {String} obj.type Type of the geometry. Must be 2.5.
 * @param {Array} obj.geometries Array containing the geometries to create
 * @return {Array} array containing the meshes to add
 */
GeometryFactory.prototype.create = function(obj) {
    var color = new THREE.Color(parseInt(obj.color.substring(1), 16));

    var type = obj.type;
    if (type === "point") {
        this._createPoints(obj.uuid, obj.geometries, color);
    }
    else if (type === "line") {
        this._createLines(obj.uuid, obj.geometries, color);
    }
    else {
        this._createPolygons(obj.uuid, obj.geometries, color);
    }
};
