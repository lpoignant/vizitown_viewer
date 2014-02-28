"use strict";

var QGISLayer = function(args) {
    args = args || {};
    THREE.Object3D.call(this, args);
    this._uuid = args.uuid;

    this._tiles = [];
    this._dirty = [];
    this._volumes = [];
};
QGISLayer.inheritsFrom(THREE.Object3D);

QGISLayer.prototype.isTileCreated = function(index) {
    return (this._tiles[index] !== undefined);
};

QGISLayer.prototype.isVolumeCreated = function(index) {
    return (this._volumes[index] !== undefined);
};

QGISLayer.prototype.isDirty = function(index) {
    return (this._dirty[index] === true);
};

QGISLayer.prototype.refresh = function(index) {
    if (index) {
        this._dirty[index] = true;
        return;
    }

    for (var i = 0; i < this._dirty.length; i++) {
        this._dirty[i] = true;
    }
};

QGISLayer.prototype.tile = function(index) {
    return this._tiles[index];
};

QGISLayer.prototype.volume = function(index) {
    var volume = this._volumes[index];
    if (!volume && this.isTileCreated(index)) {
        volume = new THREE.Scene();
        this._volumes[index] = volume;
        volume.position = this.tile(index).position;
    }
    return volume;
};

QGISLayer.prototype.createTile = function(index) {
    if (this.isTileCreated(index)) {
        this.destroyTile(index);
    }
    this._tiles[index] = new THREE.Object3D();
    this._dirty[index] = false;
    this.add(this._tiles[index]);
    return this._tiles[index];
};

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
