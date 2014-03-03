/* global BasicHeightMapMaterialDefinition:false, CanvasTile, Layer */
"use strict";

/**
 * This class represents a tiled layer for DEM and raster
 * 
 * @class TerrainLayer
 * @constructor
 * @extends Layer
 * @param {Object} args JSON Object containing the arguments
 * @param {String} args.ortho URL to get the ortho
 * @param {String} args.dem URL to get the dem raster
 * @param {Number} args.xDensity Number of on the x axis
 * @param {Number} args.yDensity Number of line on the y axis
 */
var TerrainLayer = function(args) {
    Layer.call(this, args);

    this._ortho = args.ortho || false;
    this._dem = args.dem || false;

    this.minHeight = args.minHeight || 0;
    this.maxHeight = args.maxHeight || 100;

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
 * Returns correct url to access a raster
 *
 * @method _getRasterUrl
 * @param {String} path Base path
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 * @param {Number} zoomLevel Level of zoom required
 * @return {String}
 */
TerrainLayer.prototype._rasterUrl = function(path, x, y, zoomLevel) {
    zoomLevel = zoomLevel || 0;
    var url = path + "/";
    var elem = String(path).split("/");
    url += elem[elem.length - 1] + "_" + zoomLevel + "_" + x + "_" + y + ".png";
    return url;
};

/**
 * Load an entire DEM
 *
 * @method _loadDEM
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 */
TerrainLayer.prototype._loadDEM = function(x, y) {
    if (!this._dem) {
        return;
    }
    var index = this._index(x, y);
    if (!this._demTextures[index]) {
        THREE.ImageUtils.crossOrigin = "anonymous";
        var url = this._rasterUrl(this._dem, x, y, this._zoom);
        var canvasTile = new CanvasTile(url, x, y);
        var self = this;
        canvasTile.addEventListener("demLoaded", function() {
            var box = self.tileExtent(x, y);
            self.dispatchEvent({
                type: "demLoaded",
                data: [box.min.x, box.min.y, box.max.x, box.max.y]
            });
        });
        this._demTextures[index] = canvasTile;
    }
    return this._demTextures[index].texture;
};

/**
 * Load an entire Ortho
 *
 * @method _loadOrtho
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 */
TerrainLayer.prototype._loadOrtho = function(x, y) {
    if (!this._ortho) {
        return;
    }
    var index = this._index(x, y);
    if (!this._orthoTextures[index]) {
        THREE.ImageUtils.crossOrigin = "anonymous";
        var url = this._rasterUrl(this._ortho, x, y, this._zoom);
        this._orthoTextures[index] = THREE.ImageUtils.loadTexture(url);
    }
    return this._orthoTextures[index];
};

/**
 * Create a material for a tile
 *
 * @method _createMaterial
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 */
TerrainLayer.prototype._createMaterial = function(x, y) {
    var dem = this._loadDEM(x, y);
    var ortho = this._loadOrtho(x, y);

    // Shader properties
    var uniformsTerrain = THREE.UniformsUtils.clone(this._shaderDef.uniforms);
    uniformsTerrain.dem.value = dem;
    uniformsTerrain.ortho.value = ortho;
    uniformsTerrain.minHeight.value = this.minHeight;
    uniformsTerrain.maxHeight.value = this.maxHeight;

    var material = this._material.clone();
    material.uniforms = uniformsTerrain;
    return material;
};

/**
 * Return the height contain in the DEM for a position 
 *
 * @method height
 * @param {THREE.Vector2} position
 * @return height
 */
TerrainLayer.prototype.height = function(position) {
    var tileIndex = this.tileIndex(position);
    var index = this._index(tileIndex.x, tileIndex.y);
    var dem = this._demTextures[index];
    if (!dem) {
        return 0;
    }

    var tileSize = this._tileSize;
    var demSize = dem.size();
    var rPos = this.tileCoordinates(position);

    var xPixel = rPos.x * demSize.x / tileSize;
    var yPixel = demSize.y - (rPos.y * demSize.y / tileSize);
    var pixelValue = dem.value(new THREE.Vector2(xPixel, yPixel));
    var height = this.minHeight +
                 ((this.maxHeight - this.minHeight) * pixelValue);
    return height;
};

/**
 * Level the all registered layers with the DEM value
 *
 * @method levelLayers
 * @param {THREE.Vector2} tileIndex
 */
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
