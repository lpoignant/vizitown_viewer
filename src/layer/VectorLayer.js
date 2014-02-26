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
    qgisVectors.forEach(function(uuid, i) {
        self._qgisLayers[uuid] = new THREE.Object3D();
        self._getQgisLayer(uuid).position.z += i + 1;
	self._getQgisLayer(uuid).tiles = [];
	self._getQgisLayer(uuid).dirty = [];
	self.add(self._getQgisLayer(uuid));
    });
    this._isTileCreated = [];

    this._socket.addEventListener("messageReceived", function(obj) {
        var meshes = self._factory.create(obj);
        if(!meshes) {
            return;
        }
        var uuid = obj.uuid;
        meshes.forEach(function(mesh) {
            self.addToTile(mesh, uuid);
        });
    });

    this._createPlan();
};
VectorLayer.inheritsFrom(Layer);

VectorLayer.prototype._createPlan = function() {
    var geometry = new THREE.PlaneGeometry(this._layerWidth, this._layerHeight,
                                           this._gridDensity, this._gridDensity);
    var position = new THREE.Matrix4();
    var layerHalfWidth = this._layerWidth * 0.5;
    var layerHalfHeight = this._layerHeight * 0.5;
    position.makeTranslation(layerHalfWidth, layerHalfHeight, 0);
    geometry.applyMatrix(position);
    
    var material = this._material;
    var plan = new THREE.Mesh(geometry, material);
    this.add(plan);
};

VectorLayer.prototype._getQgisLayer = function(uuid) {
    return this._qgisLayers[uuid];
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
    return (this._getQgisLayer(uuid).dirty[this._index(x, y)] !== undefined);
};

VectorLayer.prototype._loadData = function(extent, uuid) {
    var ext = {
        Xmin: extent[0] + this.originX,
        Ymin: extent[1] + this.originY,
        Xmax: extent[2] + this.originX,
        Ymax: extent[3] + this.originY,
    };

    if (uuid) {
        ext.uuid = uuid;
    }
    this._socket.send(ext);
};

/**
 * 
 * @param x
 * @param y
 * @returns {THREE.Mesh}
 */
VectorLayer.prototype._createTile = function(x, y, uuid) {
    var container = new THREE.Object3D();

    // Tile origin
    var origin = this._tileRelativeOrigin(x, y);
    container.translateX(origin.x);
    container.translateY(origin.y);

    this._getQgisLayer(uuid).add(container);
    return container;
};

VectorLayer.prototype.createIfNot = function(x, y) {
    if (!this.isTileCreated(x, y)) {
        this._isTileCreated[this._index(x, y)] = 1;
        var self = this;
	for (var uuid in this._qgisLayers) {
            self._getQgisLayer(uuid).tiles[this._index(x, y)] = self._createTile(x, y, uuid);
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
    return this._getQgisLayer(uuid).tiles[this._index(x, y)];
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
    this._getQgisLayer(uuid).tiles.forEach(function(tile, _index) {
        self._getQgisLayer(uuid).dirty[_index] = 1;
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
            var removeChild = function(child) {
                if(child.geometry !== undefined) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            };
            for (var uuid in self._qgisLayers) {
                if (self.isDirty(index.x, index.y, uuid)) {
                    var tile = self.tile(index.x, index.y, uuid);
                    self._getQgisLayer(uuid).remove(tile);
                    tile.traverse(removeChild);
                    delete self._getQgisLayer(uuid).tiles[self._index(index.x, index.y)];
                    delete self._getQgisLayer(uuid).dirty[self._index(index.x, index.y)];
                    delete self._isTileCreated[self._index(index.x, index.y)];
                    self._loadData(tileIndex, uuid);
                }
            }
        }
    });
};

VectorLayer.prototype.forEachTileCreatedInExtent = function(extent, func) {
    var tileIndexes = this._spatialIndex.search([extent.min.x - this.originX,
                                                 extent.min.y - this.originY,
                                                 extent.max.x - this.originX,
                                                 extent.max.y - this.originY]);
    var self = this;
    tileIndexes.forEach(function(tileIndex) {
        var x = tileIndex[4].x;
        var y = tileIndex[4].y;
        if (self.isTileCreated(x, y)) {
            var tileOrigin = self.tileOrigin(x, y);
            for (var uuid in self._qgisLayers) {
                var tile = self.tile(x, y, uuid);
                func(tile, tileOrigin);
            }
        }
    });
};

