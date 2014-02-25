/* global Layer, GeometryFactoryComposite, VWebSocket */
"use strict";

var VectorLayer = function VectorLayer(args) {
    Layer.call(this, args);

    this._socket = new VWebSocket({
        url: args.url + "/data"
    });

    this._factory = new GeometryFactoryComposite();

    var self = this;
    var qgisVectors = args.qgisVectors || [];
    this._qgisLayers = {};
    qgisVectors.forEach(function(uuid) {
        self._qgisLayers[uuid] = {
            tiles: [],
            dirty: [],
        };
    });
    this._isTileCreated = [];

    this._socket.addEventListener("messageReceived", function(obj) {
        var meshes = self._factory.create(obj);
        var uuid = obj.uuid;
        meshes.forEach(function(mesh) {
            self.addToTile(mesh, uuid);
        });
    });
};
VectorLayer.inheritsFrom(Layer);

VectorLayer.prototype._loadData = function(extent) {
    var ext = {
        Xmin: extent[0] + this.originX,
        Ymin: extent[1] + this.originY,
        Xmax: extent[2] + this.originX,
        Ymax: extent[3] + this.originY,
    };
    this._socket.send(ext);
};

/**
 * @method isTileCreated Returns if a tile exists at index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {Boolean} True if a tile exists, false otherwise
 */
VectorLayer.prototype.isTileCreated = function(x, y) {
    return (this._isTileCreated[this._index(x, y)] !== undefined);
};

/**
 * @method tile Returns the tile at the index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.Mesh} Mesh representing the tile
 */
VectorLayer.prototype.tile = function(x, y, uuid) {
    if (!this.isTileCreated(x, y)) {
        this._isTileCreated[this._index(x, y)] = 1;
        var self = this;
	for (var key in this._qgisLayers) {
            self._qgisLayers[key].tiles[this._index(x, y)] = self._createTile(x, y);
        }
    }
    if (uuid !== undefined) {
        return this._qgisLayers[uuid].tiles[this._index(x, y)];
    }
};

/**
 * Add a mesh to the correct tile
 * 
 * @method addToTile Add an object to a tile
 * @param {THREE.Object3D} mesh
 */
VectorLayer.prototype.addToTile = function(mesh, uuid) {
    var tileIndex = this.tileIndex(mesh.position);
    if(!tileIndex) {
        return;
    }
    if (!this.isTileCreated(tileIndex.x, tileIndex.y)) {
        return;
    }
    var coordinates = this.tileCoordinates(mesh.position);
    var tile = this.tile(tileIndex.x, tileIndex.y, uuid);

    if (this.dem) {
        var height = this.dem.height(mesh.position);
        if (height) {
            coordinates.z = height;
        }
    }

    mesh.position = coordinates;
    tile.add(mesh);
};

/**
 * @method refresh Refresh a specific qgis layer
 * @param {String} uuid Identifier of the layer who needs to be refreshed
 */
VectorLayer.prototype.refresh = function(uuid) {
    var self = this;
    this._qgisLayers[uuid].tiles.forEach(function(tile, _index) {
        self._qgisLayers[uuid].dirty[_index] = 1;
    });
};
