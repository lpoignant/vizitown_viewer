/* global rbush */
"use strict";

/**
 * This class represents a tiled layer
 * 
 * @class Layer
 * @extends THREE.Scene
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {Number} args.x X top left corner of the layer in the layer coordinate
 *                system
 * @param {Number} args.y Y top left corner of the layer in the layer coordinate
 *                system
 * @param {THREE.Scene} args.scene Scene container of the layer
 * @param {Number} args.width Width of the layer
 * @param {Number} args.height Height of the layer
 * @param {Number} args.tileSize Size of a tile in the layer coordinate
 *                system
 * @param {Number} args.gridDensity Number of lines on the x and y axis
 * @param {THREE.Material} args.material Material to apply on the layer
 */
var Layer = function(args) {
    THREE.Scene.call(this);
    args = args || {};
    this.originX = args.x || 0;
    this.originY = args.y || 0;

    this._scene = args.scene;

    this._layerWidth = args.width;
    this._layerHeight = args.height;

    this._tileSize = args.tileSize || 1000;
    this._tileHalfSize = this._tileSize * 0.5;
    this._gridDensity = args.gridDensity || 1;

    this.nbTileX = Math.ceil((this._layerWidth / this._tileSize));
    this.nbTileY = Math.ceil((this._layerHeight / this._tileSize));

    this._material = args.material || new THREE.MeshLambertMaterial({
        color: 0x666666,
        emissive: 0xaaaaaa,
        ambient: 0xffffff,
        wireframe: true,
    });

    var extents = [];
    this.forEach(function(x, y) {
        var minX = this._tileSize * x;
        var minY = this._tileSize * y;
        var maxX = minX + this._tileSize;
        var maxY = minY + this._tileSize;
        extents.push([minX, minY, maxX, maxY, {
            x: x,
            y: y
        }]);
    });

    this._spatialIndex = rbush(8);
    this._spatialIndex.load(extents);

    this._tiles = [];
};
Layer.inheritsFrom(THREE.Scene);

/**
 * Returns if a tile exists at index
 *
 * @method isTileCreated
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {Boolean} True if a tile exists, false otherwise
 */
Layer.prototype.isTileCreated = function(x, y) {
    return (this._tiles[this._index(x, y)] !== undefined);
};

/**
 * Creates a tile geometry translated at the correct position
 * 
 * @method _createGeometry
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {THREE.PlaneGeometry} The tile geometry translated
 */
Layer.prototype._createGeometry = function() {
    var geometry = new THREE.PlaneGeometry(this._tileSize, this._tileSize, this._gridDensity, this._gridDensity);
    var position = new THREE.Matrix4();
    position.makeTranslation(this._tileHalfSize, this._tileHalfSize, 0);
    geometry.applyMatrix(position);
    return geometry;
};

/**
 * Return the material of the layer (real implementation override in subclass)
 * 
 * @method _createMaterial
 * @return {THREE.MeshLambertMaterial}
 */
Layer.prototype._createMaterial = function() {
    return this._material;
};

/**
 * Returns the tile geometry at x,y
 *
 * @method tileExtent
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {THREE.Box3} The translated geometry of the tile
 */
Layer.prototype.tileExtent = function(x, y) {
    var origin = this.tileOrigin(x, y);
    var min = new THREE.Vector3(origin.x, origin.y, 0);
    var max = new THREE.Vector3(origin.x + this._tileSize, origin.y + this._tileSize, 0);
    return new THREE.Box3(min, max);
};

/**
 * Returns the index of the tile
 *
 * @method _index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {Number} Array index of the tile
 */
Layer.prototype._index = function(x, y) {
    return this.nbTileX * x + y;
};

/**
 * Add a mesh to the correct tile
 * 
 * @method addToTile
 * @param {THREE.Object3D} mesh
 */
Layer.prototype.addToTile = function(mesh) {
    var coordinates = this.tileCoordinates(mesh.position);
    var tileIndex = this.tileIndex(mesh.position);
    var tile = this.tile(tileIndex.x, tileIndex.y);

    mesh.position = coordinates;
    tile.add(mesh);
};

/**
 * Return the index of a tile
 * 
 * @method tileIndex
 * @param coords Coordinates f the tile
 * @return {THREE.Vector2}
 */
Layer.prototype.tileIndex = function(coords) {
    var x = Math.floor((coords.x - this.originX) / this._tileSize);
    var y = Math.floor((coords.y - this.originY) / this._tileSize);
    return new THREE.Vector2(x, y);
};

/**
 * Return the tile coordinates of a world position
 * 
 * @method tileCoordinates
 * @param {THREE.Vector2} position In world coordinates
 * @return {THREE.Vector2} tileCoords Tile coordinates
 */
Layer.prototype.tileCoordinates = function(position) {
    var tileIndex = this.tileIndex(position);
    var origin = this.tileOrigin(tileIndex.x, tileIndex.y);
    var tileCoords = position.clone();
    tileCoords.x -= origin.x;
    tileCoords.y -= origin.y;
    return tileCoords;
};

/**
 * Return the world coordinates of a tile position
 * 
 * @method worldCoordinates
 * @param {THREE.Vector2} position In tile coordinates
 * @return {THREE.Vector2} tileCoords Tile coordinates
 */
Layer.prototype.worldCoordinates = function(x, y, position) {
    var pos = this.tileOrigin(x, y);
    pos.x += position.x;
    pos.y += position.y;
    return position;
};

/**
 * Return tile origin relative to the layer origin
 * 
 * @method _tileRelativeOrigin
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {THREE.Vector2} coordinates
 */
Layer.prototype._tileRelativeOrigin = function(x, y) {
    var dx = this._tileSize * x;
    var dy = this._tileSize * y;
    return new THREE.Vector2(dx, dy);
};

/**
 * Return tile origin in absolute coordinates
 * 
 * @method tileOrigin
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {THREE.Vector2} coordinates
 */
Layer.prototype.tileOrigin = function(x, y) {
    var origin = this._tileRelativeOrigin(x, y);
    origin.x += this.originX;
    origin.y += this.originY;
    return origin;
};

/**
 * Create a tile 
 * 
 * @method _createTile
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {THREE.Mesh} mesh
 */
Layer.prototype._createTile = function(x, y) {
    var geometry = this._createGeometry(x, y);
    var material = this._createMaterial(x, y);
    var container = new THREE.Object3D();
    var tile = new THREE.Mesh(geometry, material);
    container.add(tile);

    // Tile origin
    var origin = this._tileRelativeOrigin(x, y);
    container.translateX(origin.x);
    container.translateY(origin.y);

    this._tiles[this._index(x, y)] = container;
    this.add(container);
    return container;
};

/**
 * Returns the tile at the index
 *
 * @method tile
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @return {THREE.Mesh} Mesh representing the tile
 */
Layer.prototype.tile = function(x, y) {
    if (!this.isTileCreated(x, y)) {
        return this._createTile(x, y);
    }
    return this._tiles[this._index(x, y)];
};

/**
 * Apply a function to each tiles in the layer
 * 
 * @param func The function to apply
 */
Layer.prototype.forEach = function(func) {
    for (var x = 0; x < this.nbTileX; x++) {
        for (var y = 0; y < this.nbTileY; y++) {
            func.call(this, x, y);
        }
    }
};

/**
 * Apply a function to each tiles in an extent
 * 
 * @method forEachTileCreatedInExtent
 * @param {THREE.Box3} Extent
 * @param {Function} func The function to apply
 */
Layer.prototype.forEachTileCreatedInExtent = function(extent, func) {
    var tileIndexes = this._spatialIndex.search([extent.min.x - this.originX, extent.min.y - this.originY, extent.max.x - this.originX, extent.max.y - this.originY]);
    var self = this;
    tileIndexes.forEach(function(tileIndex) {
        var x = tileIndex[4].x;
        var y = tileIndex[4].y;
        if (self.isTileCreated(x, y)) {
            var tile = self.tile(x, y);
            var tileOrigin = self.tileOrigin(x, y);
            func(tile, tileOrigin);
        }
    });
};

/**
 * An abstract method to load data
 * 
 * @method _loadData
 */
Layer.prototype._loadData = function() {
    return;
};

/**
 * Display all tiles viewed
 * 
 * @method display
 * @param {THREE.Camera} camera
 */
Layer.prototype.display = function(camera) {

    var frustum = camera.frustum();
    var extent = camera.extent();
    var tileIndexes = this._spatialIndex.search(extent);

    var tileExtent = new THREE.Box3();
    tileExtent.min.z = 0;
    tileExtent.max.z = 0;

    var self = this;
    tileIndexes.forEach(function(tileIndex) {
        tileExtent.min.x = tileIndex[0];
        tileExtent.min.y = tileIndex[1];
        tileExtent.max.x = tileIndex[2];
        tileExtent.max.y = tileIndex[3];
        var index = tileIndex[4];
        if (!self.isTileCreated(index.x, index.y)) {
            if (frustum.intersectsBox(tileExtent)) {
                self.tile(index.x, index.y);
                self._loadData(tileIndex);
            }
        }
    });
};
