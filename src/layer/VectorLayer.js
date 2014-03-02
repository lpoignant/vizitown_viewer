/* global Layer, GeometryFactoryComposite, VWebSocket, QGISLayer, Volume */
"use strict";

var VectorLayer = function VectorLayer(args) {
    args.tileSize = args.tileSize || 500;
    Layer.call(this, args);

    this._factory = new GeometryFactoryComposite({
        layer: this
    });
    this._isTileCreated = [];
    this._volumes = [];
    this._qgisLayers = {};

    var qgisLayers = args.qgisLayers || [];
    var self = this;
    qgisLayers.forEach(function(layer) {
        var qgisLayer = new QGISLayer(layer.uuid);

        self._qgisLayers[layer.uuid] = qgisLayer;
        self.add(qgisLayer);
    });

};
VectorLayer.inheritsFrom(Layer);

VectorLayer.create = function(args) {
    var layer = new VectorLayer(args);

    // WebSocket
    layer._socket = new VWebSocket({
        url: args.url
    });
    layer._socket.addEventListener("messageReceived", function(obj) {
        layer._factory.create(obj);
    });

    // Plane
    var layerHalfWidth = layer._layerWidth * 0.5;
    var layerHalfHeight = layer._layerHeight * 0.5;
    var position = new THREE.Matrix4();
    position.makeTranslation(layerHalfWidth, layerHalfHeight, 0);

    var geometry = new THREE.PlaneGeometry(layer._layerWidth, layer._layerHeight, 1, 1);
    geometry.applyMatrix(position);

    var material = args.material || new THREE.MeshBasicMaterial({
        color: 0xcccccc
    });
    var plan = new THREE.Mesh(geometry, material);
    plan.position.z = -10;
    layer.add(plan);

    return layer;
};

VectorLayer.prototype.setDEM = function(dem) {
    this._dem = dem;
    var self = this;
    this._dem.addEventListener("demLoaded", function(event) {
        var ext = [event.data[0] - self.originX, event.data[1] - self.originY, event.data[2] - self.originX, event.data[3] - self.originY, ];
        self.refreshExtent(ext);
    });
    this._factory.setDEM(dem);
};

VectorLayer.prototype.qgisLayer = function(uuid) {
    return this._qgisLayers[uuid];
};

/**
 * @method isTileCreated Returns if a tile exists at index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {Boolean} True if a tile exists, false otherwise
 */
VectorLayer.prototype.isTileCreated = function(x, y) {
    var index = this._index(x, y);
    return (this._isTileCreated[index] !== undefined);
};

/**
 * 
 * @param extent
 * @param uuid
 */
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
 * @param uuid
 * @returns {THREE.Mesh}
 */
VectorLayer.prototype._createTile = function(x, y, uuid) {
    var index = this._index(x, y);
    var tile = this.qgisLayer(uuid).createTile(index);

    // Tile origin
    var origin = this._tileRelativeOrigin(x, y);
    tile.translateX(origin.x);
    tile.translateY(origin.y);

    return tile;
};

VectorLayer.prototype.createTile = function(x, y) {
    if (this.isTileCreated(x, y)) {
        return;
    }

    var index = this._index(x, y);
    this._isTileCreated[index] = true;

    for ( var uuid in this._qgisLayers) {
        this._createTile(x, y, uuid);
    }

};

/**
 * @method tile Returns the tile at the index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @param {String} uuid
 * @returns {THREE.Mesh} Mesh representing the tile
 */
VectorLayer.prototype.tile = function(x, y, uuid) {
    var index = this._index(x, y);
    var layer = this.qgisLayer(uuid);
    return layer.tile(index);
};

/**
 * @method volume Returns the scene at the index
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @param {String} uuid
 * @returns {THREE.Scene} Mesh representing the tile
 */
VectorLayer.prototype.volume = function(x, y, uuid) {
    if (!this.isTileCreated(x, y)) {
        return;
    }

    var index = this._index(x, y);
    var layer = this.qgisLayer(uuid);

    var meshScene = new THREE.Scene();
    var bbsScene = new THREE.Scene();

    var mesh = new THREE.Object3D();
    var bbs = new THREE.Object3D();

    meshScene.add(mesh);
    bbsScene.add(bbs);

    // Tile origin
    var origin = this._tileRelativeOrigin(x, y);
    mesh.translateX(origin.x);
    mesh.translateY(origin.y);
    bbs.translateX(origin.x);
    bbs.translateY(origin.y);

    var volume = layer.volume(index);
    volume.push([meshScene, bbsScene]);
    return [mesh, bbs];
};

/**
 * Add a mesh to the correct tile
 * 
 * @method addToTile Add an object to a tile
 * @param {THREE.Object3D} mesh
 * @param {String} uuid
 */
VectorLayer.prototype.addToTile = function(mesh, uuid) {
    var tileIndex = this.tileIndex(mesh.position);

    if (!this.isTileCreated(tileIndex.x, tileIndex.y)) {
        this.createTile(tileIndex.x, tileIndex.y);
    }

    var tile = this.tile(tileIndex.x, tileIndex.y, uuid);

    var coordinates = this.tileCoordinates(mesh.position);
    mesh.position = coordinates;
    tile.add(mesh);
    console.log("tile", tile, mesh, coordinates);
};

/**
 * Add a mesh to the correct tile
 * 
 * @method addToTile Add an object to a tile
 * @param {THREE.Object3D} mesh
 * @param {String} uuid
 */
VectorLayer.prototype.addToVolume = function(mesh, uuid) {
    var tileIndex = this.tileIndex(mesh.position);

    if (!this.isTileCreated(tileIndex.x, tileIndex.y)) {
        this.createTile(tileIndex.x, tileIndex.y);
    }

    // Mesh to create the mask in the stencil buffer
    var coordinates = this.tileCoordinates(mesh.position);
    mesh.position = coordinates;

    var volumeContainer = this.volume(tileIndex.x, tileIndex.y, uuid);
    var meshes = volumeContainer[0];
    var bbs = volumeContainer[1];

    var volume = new Volume(mesh);
    meshes.add(volume.mesh);
    bbs.add(volume.bb);

    console.log("Volume", volume.mesh, volume.bb);
};

/**
 * @method refresh Refresh a specific qgis layer
 * @param {String} uuid Identifier of the layer who needs to be refreshed
 */
VectorLayer.prototype.refresh = function(uuid) {
    if (!uuid) {
        for ( var id in this._qgisLayers) {
            this.qgisLayer(id).refresh();
        }
    }
    else {
        this.qgisLayer(uuid).refresh();
    }
};

VectorLayer.prototype.refreshExtent = function(extent) {
    var tileIndexes = this._spatialIndex.search(extent);
    var self = this;
    tileIndexes.forEach(function(tileIndex) {
        var x = tileIndex[4].x;
        var y = tileIndex[4].y;
        var index = self._index(x, y);
        for ( var id in self._qgisLayers) {
            self.qgisLayer(id).refresh(index);
        }
    });
};

VectorLayer.prototype.forEachVolume = function(camera, callback) {
    var extent = camera.extent();
    var tileIndexes = this._spatialIndex.search(extent);

    var self = this;
    tileIndexes.forEach(function(tileIndex) {
        var index = tileIndex[4];
        // Not created yet
        if (!self.isTileCreated(index.x, index.y)) {
            return;
        }
        var arrayIndex = self._index(index.x, index.y);
        for ( var uuid in self._qgisLayers) {
            var layer = self.qgisLayer(uuid);
            if (layer.isVolumeCreated(arrayIndex)) {
                var volume = layer.volume(arrayIndex);
                for (var i = 0; i < volume.length; i++) {
                    var scenes = volume[i];
                    if (scenes[0].children.length > 0) {
                        callback(scenes);
                    }
                }
            }
        }

    });
};

/**
 * 
 * @param camera
 */
VectorLayer.prototype.display = function(camera) {

    var frustum = camera.frustum();
    var extent = camera.extent();
    var tileIndexes = this._spatialIndex.search(extent);

    var tileExtent = new THREE.Box3();
    tileExtent.min.z = 0;
    tileExtent.max.z = 0;

    var self = this;
    tileIndexes.forEach(function(tileIndex) {
        var index = tileIndex[4];
        // Not created yet
        if (!self.isTileCreated(index.x, index.y)) {
            // Building tile extent
            tileExtent.min.x = tileIndex[0];
            tileExtent.min.y = tileIndex[1];
            tileExtent.max.x = tileIndex[2];
            tileExtent.max.y = tileIndex[3];

            if (frustum.intersectsBox(tileExtent)) {
                self.createTile(index.x, index.y);
                self._loadData(tileIndex);
            }
            return;
        }

        // Need to refresh ?
        var arrayIndex = self._index(index.x, index.y);
        for ( var uuid in self._qgisLayers) {
            var layer = self.qgisLayer(uuid);
            if (layer.isDirty(arrayIndex)) {
                self._createTile(index.x, index.y, uuid);
                self._loadData(tileIndex, uuid);
            }
        }
    });
};
