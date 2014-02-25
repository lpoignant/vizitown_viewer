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

VectorLayer.prototype.isDirty = function(x, y, uuid) {
    return (this._qgisLayers[uuid].dirty[this._index(x, y)] !== undefined);
};

VectorLayer.prototype.createIfNot = function(x, y) {
    if (!this.isTileCreated(x, y)) {
        this._isTileCreated[this._index(x, y)] = 1;
        var self = this;
	for (var uuid in this._qgisLayers) {
            self._qgisLayers[uuid].tiles[this._index(x, y)] = self._createTile(x, y);
        }
    }
};

/**
 * @method tile Returns the tile at the index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.Mesh} Mesh representing the tile
 */
VectorLayer.prototype.tile = function(x, y, uuid) {
    return this._qgisLayers[uuid].tiles[this._index(x, y)];
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
    this.createIfNot(tileIndex.x, tileIndex.y);
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

VectorLayer.prototype.display = function(camera) {

    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    // Create frustum from camera
    var matrixFrustum = camera.projectionMatrix.clone();
    matrixFrustum.multiply(camera.matrixWorldInverse);
    this._frustum.setFromMatrix(matrixFrustum);

    var position = camera.position;
    var extent = [position.x - camera.far,
                  position.y - camera.far,
                  position.x + camera.far,
                  position.y + camera.far];
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
                self.createIfNot(index.x, index.y);
                self._loadData(tileIndex);
            }
        } else {
            for (var uuid in self._qgisLayers) {
                if (self.isDirty(index.x, index.y, uuid)) {
                    var tile = self.tile(index.x, index.y, uuid);
                    self._scene.remove(tile);
                    delete self._qgisLayers[uuid].tiles[self._index(index.x, index.y)];
                    delete self._qgisLayers[uuid].dirty[self._index(index.x, index.y)];
                    delete self._isTileCreated[self._index(index.x, index.y)];
                }
            }
            self._loadData(tileIndex);
        }
    });
};
