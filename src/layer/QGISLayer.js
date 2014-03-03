"use strict";

/**
 * @class QGISLayer
 * @extends THREE.Object3D
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {String} args.uuid Unique identifier of the layer
 */
var QGISLayer = function(args) {
    args = args || {};
    THREE.Object3D.call(this, args);
    this._uuid = args.uuid;

    this._tiles = [];
    this._dirty = [];
    this._volumes = [];
};
QGISLayer.inheritsFrom(THREE.Object3D);

/**
 * Returns if a tile exists at index
 *
 * @method isTileCreated
 * @param {int} index Index of the tile.
 * @return {Boolean} True if a tile exists, false otherwise
 */
QGISLayer.prototype.isTileCreated = function(index) {
    return (this._tiles[index] !== undefined);
};

/**
 * Returns if a volume exists at index
 *
 * @method isVolumeCreated
 * @param {int} index Index of the tile.
 * @return {Boolean} True if a volume exists, false otherwise
 */
QGISLayer.prototype.isVolumeCreated = function(index) {
    return (this._volumes[index] !== undefined);
};

/**
 * Returns if a tile at index is dirty 
 *
 * @method isDirty
 * @param {int} index Index of the tile.
 * @return {Boolean} True if tile is dirty, false otherwise
 */
QGISLayer.prototype.isDirty = function(index) {
    return (this._dirty[index] === true);
};

/**
 * Set a tile to dirty if index is specified 
 * else set all tiles to dirty 
 *
 * @method refresh
 * @param {int} index Index of the tile. Optionnal
 */
QGISLayer.prototype.refresh = function(index) {
    if (index !== undefined) {
        this._dirty[index] = true;
        return;
    }

    for (var i = 0; i < this._dirty.length; i++) {
        this._dirty[i] = true;
    }
};

/**
 * Retreive the tile at index
 *
 * @method tile
 * @param {int} index Index of the tile.
 */
QGISLayer.prototype.tile = function(index) {
    return this._tiles[index];
};

/**
 * Retreive the volume at index
 *
 * @method tile
 * @param {int} index Index of the tile.
 */
QGISLayer.prototype.volume = function(index) {
    if (!this.isVolumeCreated(index)) {
        this._volumes[index] = [];
    }
    return this._volumes[index];
};

/**
 * Create tile at index
 *
 * @method createTile
 * @param {int} index Index of the tile.
 */
QGISLayer.prototype.createTile = function(index) {
    if (this.isTileCreated(index)) {
        this.destroyTile(index);
    }
    this._tiles[index] = new THREE.Object3D();
    this._dirty[index] = false;
    this.add(this._tiles[index]);
    return this._tiles[index];
};

/**
 * Destroy tile at index
 *
 * @method destroyTile
 * @param {int} index Index of the tile.
 */
QGISLayer.prototype.destroyTile = function(index) {
    if (!this.isTileCreated(index)) {
        return;
    }

    var tile = this.tile(index);
    this.remove(tile);

    var removeChild = function(child) {
        if (child.geometry !== undefined) {
            child.geometry.dispose();
        }
        if (child.material !== undefined) {
            child.material.dispose();
        }
    };

    tile.traverse(removeChild);

    delete this._tiles[index];
    delete this._dirty[index];
};
