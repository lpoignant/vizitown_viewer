/* global rbush */
"use strict";

/**
 * This class represents a tiled layer
 * 
 * @class TiledLayer
 * @constructor
 * @param {int} args.x X top left corner of the layer in the layer coordinate
 *                system
 * @param {int} args.y Y top left corner of the layer in the layer coordinate
 *                system
 * @param {int} args.tileSizeWidth Width of a tile in the layer coordinate
 *                system
 * @param {int} args.tileSizeHeight Height of a tile in the layer coordinate
 *                system
 * @param {int} args.gridDensity Number of lines on the x and y axis
 */
var Layer = function(args) {
    THREE.Object3D.call(this);
    args = args || {};
    this.originX = args.x || 0;
    this.originY = args.y || 0;

    this._layerWidth = args.width;
    this._layerHeight = args.height;

    this._tileSize = args.tileSize || 1000;
    this._tileHalfSize = this._tileSize * 0.5;
    this._gridDensity = args.gridDensity || 1;

    this.nbTileX = Math.ceil(this._layerWidth / this._tileSize);
    this.nbTileY = Math.ceil(this._layerHeight / this._tileSize);

    this._material = args.material || new THREE.MeshLambertMaterial({
        color: 0x666666,
        emissive: 0xaaaaaa,
        ambient: 0xffffff,
    });

    var extents = [];
    this.forEach(function(x, y) {
        var minX = this._tileSize * x;
        var minY = this._tileSize * y;
        var maxX = minX + this._tileSize;
        var maxY = minY + this._tileSize;
        extents.push([ minX, minY, maxX, maxY, {
            x: x,
            y: y
        } ]);
    });

    this._spatialIndex = rbush(8);
    this._spatialIndex.load(extents);

    this._tiles = [];
    this._frustum = new THREE.Frustum();
};
Layer.inheritsFrom(THREE.Object3D);

/**
 * @method isTileCreated Returns if a tile exists at index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {Boolean} True if a tile exists, false otherwise
 */
Layer.prototype.isTileCreated = function(x, y) {
    return (this._tiles[this._index(x, y)] !== undefined);
};

/**
 * @method _createTranslatedTileGeometry Creates a tile geometry translated at
 *         the correct position
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.PlaneGeometry} The tile geometry translated
 */
Layer.prototype._createGeometry = function() {
    var geometry = new THREE.PlaneGeometry(this._tileSize, this._tileSize,
                                           this._gridDensity, this._gridDensity);
    var position = new THREE.Matrix4();
    position.makeTranslation(this._tileHalfSize, this._tileHalfSize, 0);
    geometry.applyMatrix(position);
    return geometry;
};

/**
 * 
 * @returns {THREE.MeshLambertMaterial}
 */
Layer.prototype._createMaterial = function() {
    return this._material;
};

/**
 * @method tileBox Returns the tile geometry at x,y
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.Box3} The translated geometry of the tile;
 */
Layer.prototype.tileExtent = function(x, y) {
    var origin = this.tileOrigin(x, y);
    var min = new THREE.Vector3(origin.x, origin.y, 0);
    var max = new THREE.Vector3(origin.x + this._tileSize, origin.y +
                                                           this._tileSize, 0);
    return new THREE.Box3(min, max);
};

/**
 * @method _index Returns the index of the tile
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {Number} Array index of the tile
 */
Layer.prototype._index = function(x, y) {
    return this.nbTileX * x + y;
};

/**
 * Add a mesh to the correct tile
 * 
 * @method addToTile Add an object to a tile
 * @param {THREE.Object3D}
 */
Layer.prototype.addToTile = function(mesh) {
    var coordinates = this.tileCoordinates(mesh.position);
    var tileIndex = this.tileIndex(mesh.position);
    var tile = this.tile(tileIndex.x, tileIndex.y);

    mesh.position = coordinates;
    tile.add(mesh);
};

/**
 * 
 * @param coords
 * @returns {THREE.Vector2}
 */
Layer.prototype.tileIndex = function(coords) {
    if (coords.x > this._origX + this._layerWidth) {
        return;
    }
    if (coords.y > this._origY + this._layerHeight) {
        return;
    }
    var x = Math.floor((coords.x - this.position.x) / this._tileSize);
    var y = Math.floor((coords.y - this.position.y) / this._tileSize);
    return new THREE.Vector2(x, y);
};

/**
 * 
 * @param position
 * @returns
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
 * 
 * @param x
 * @param y
 * @returns
 */
Layer.prototype._tileRelativeOrigin = function(x, y) {
    var dx = this._tileSize * x;
    var dy = this._tileSize * y;
    return new THREE.Vector2(dx, dy);
};

/**
 * 
 * @param x
 * @param y
 * @returns
 */
Layer.prototype.tileOrigin = function(x, y) {
    var origin = this._tileRelativeOrigin(x, y);
    origin.x += this.originX;
    origin.y += this.originY;
    return origin;
};

/**
 * 
 * @param x
 * @param y
 * @returns {THREE.Mesh}
 */
Layer.prototype._createTile = function(x, y) {
    var geometry = this._createGeometry(x, y);
    var material = this._createMaterial(x, y);
    var tile = new THREE.Mesh(geometry, material);

    // Tile origin
    var origin = this._tileRelativeOrigin(x, y);
    tile.translateX(origin.x);
    tile.translateY(origin.y);

    this._tiles[this._index(x, y)] = tile;
    this.add(tile);
    return tile;
};

/**
 * @method tile Returns the tile at the index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.Mesh} Mesh representing the tile
 */
Layer.prototype.tile = function(x, y) {
    if (!this.isTileCreated(x, y)) {
        return this._createTile(x, y);
    }
    return this._tiles[this._index(x, y)];
};

/**
 * 
 * @param func
 */
Layer.prototype.forEach = function(func) {
    for (var x = 0; x < this.nbTileX; x++) {
        for (var y = 0; y < this.nbTileY; y++) {
            func.call(this, x, y);
        }
    }
};

/**
 * 
 * @param {Array} tileIndex
 */
Layer.prototype._loadData = function() {
    return;
};

Layer.prototype.display = function(camera) {

    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    // Create frustum from camera
    var matrixFrustum = camera.projectionMatrix.clone();
    matrixFrustum.multiply(camera.matrixWorldInverse);
    this._frustum.setFromMatrix(matrixFrustum);

    var position = camera.position;
    var extent = [ position.x - camera.far, position.y - camera.far,
            position.x + camera.far, position.y + camera.far ];
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
            if (self._frustum.intersectsBox(tileExtent)) {
                self.tile(index.x, index.y);
                self._loadData(tileIndex);
            }
        }
    });
};
