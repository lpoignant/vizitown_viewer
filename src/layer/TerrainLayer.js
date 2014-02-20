/* global BasicHeightMapMaterialDefinition:false, CanvasTile, Layer */
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
 * @param {String} args.ortho URL to get the ortho
 * @param {String} args.dem URL to get the dem raster
 * @param {int} args.xDensity Number of on the x axis
 * @param {int} args.yDensity Number of line on the y axis
 */
var TerrainLayer = function(args) {
    Layer.call(this, args);

    this._ortho = args.ortho || false;
    this._dem = args.dem || false;

    this._minDEMElevation = args.minHeight || 0;
    this._maxDEMElevation = args.maxHeight || 100;

    this._shaderDef = args.shaderDef || BasicHeightMapMaterialDefinition;

    this._material = new THREE.ShaderMaterial({
        vertexShader: this._shaderDef.vertexShader,
        fragmentShader: this._shaderDef.fragmentShader,
        fog: true,
    });

    this._layersToLevel = [];
    this._demTextures = [];
    this._orthoTextures = [];
};
TerrainLayer.inheritsFrom(Layer);

/**
 * @method _getRasterUrl Returns correct url to access a raster
 * @param {String} path Path to the
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 * @param {Number} zoomLevel Level of zoom required
 * @returns {String}
 */
TerrainLayer.prototype._rasterUrl = function(path, x, y, zoomLevel) {
    zoomLevel = zoomLevel || 0;
    var url = path + "/";
    if (zoomLevel !== 0) {
        url += zoomLevel + "/";
    }
    var elem = path.split("/");
    url += elem[elem.length - 1] + "_" + "merge" + "_" + (x + 1) + "_" +
           (y + 1) + ".png";
    return url;
};

TerrainLayer.prototype._loadDEM = function(x, y) {
    var index = this._index(x, y);
    if (!this._demTextures[index]) {
        THREE.ImageUtils.crossOrigin = "anonymous";
        var url = this._rasterUrl(this._dem, x, y, this._zoom);
        var canvasTile = new CanvasTile(url, x, y);
        canvasTile.addEventListener("demLoaded", this.levelLayers.bind(this));
        this._demTextures[index] = canvasTile;
    }
    return this._demTextures[index].texture;
};

TerrainLayer.prototype._loadOrtho = function(x, y) {
    var index = this._index(x, y);
    if (!this._orthoTextures[index]) {
        THREE.ImageUtils.crossOrigin = "anonymous";
        var url = this._rasterUrl(this._ortho, x, y, this._zoom);
        this._orthoTextures[index] = THREE.ImageUtils.loadTexture(url);
    }
    return this._orthoTextures[index];
};

TerrainLayer.prototype._createMaterial = function(x, y) {
    var dem = this._loadDEM(x, y);
    var ortho = this._loadOrtho(x, y);

    // Shader properties
    var uniformsTerrain = THREE.UniformsUtils.clone(this._shaderDef.uniforms);
    uniformsTerrain.dem.value = dem;
    uniformsTerrain.ortho.value = ortho;
    uniformsTerrain.minHeight.value = this._minDEMElevation;
    uniformsTerrain.maxHeight.value = this._maxDEMElevation;

    var material = this._material.clone();
    material.uniforms = uniformsTerrain;
    return material;
};

TerrainLayer.prototype.height = function(position) {
    var tileIndex = this.tileIndex(position);
    var index = this._index(tileIndex.x, tileIndex.y);
    var dem = this._demTextures[index];
    if (!dem) {
        return;
    }

    var tileSize = this._tileSize;
    var demSize = dem.size();
    var rPos = this.tileCoordinates(position);

    var xPixel = rPos.x * demSize.x / tileSize;
    var yPixel = demSize.y - (rPos.y * demSize.y / tileSize);
    var pixelValue = dem.value(new THREE.Vector2(xPixel, yPixel));
    var height = this._minDEMElevation +
                 ((this._maxDEMElevation - this._minDEMElevation) * pixelValue);
    return height;
};

TerrainLayer.prototype.addLayerToLevel = function(layer) {
    this._layersToLevel.push(layer);
    layer.dem = this;
};

TerrainLayer.prototype.levelLayers = function(tileIndex) {
    var extent = this.tileExtent(tileIndex.x, tileIndex.y);
    var self = this;
    this._layersToLevel.forEach(function(layer) {
        layer.forEachTileCreatedInExtent(extent, function(tile, tileOrigin) {
            tile.children.forEach(function(mesh) {
                var point = mesh.position.clone();
                point.x += tileOrigin.x;
                point.y += tileOrigin.y;
                mesh.position.z = self.height(point);
            });
        });
    });
};
