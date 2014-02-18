/* global BasicHeightMapMaterialDefinition:false */
"use strict";

/**
 * This class represents a tiled layer
 * 
 * @class TiledLayer
 * @constructor
 * @param {int} args.x X bottom left corner of the layer in the layer coordinate
 *                system
 * @param {int} args.y Y bottom left corner of the layer in the layer coordinate
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
var Layer = function(args) {
    this._origX = args.x || 0;
    this._origY = args.y || 0;

    this._layerWidth = args.width;
    this._layerHeight = args.height;

    this._tileWidth = args.tileWidth || 512;
    this._tileHeight = args.tileHeight || 512;
    this._halfTileWidth = this._tileWidth * 0.5;
    this._halfTileHeight = this._tileHeight * 0.5;

    this.nbTileX = Math.ceil(this._layerWidth / this._tileWidth);
    this.nbTileY = Math.ceil(this._layerHeight / this._tileHeight);

    this._xTileGridDensity = args.xDensity || 8;
    this._yTileGridDensity = args.yDensity || 8;

    this._ortho = args.ortho || false;
    this._dem = args.dem || false;
    this._scene = args.scene || false;

    this._minDEMElevation = args.minHeight || 0;
    this._maxDEMElevation = args.maxHeight || 100;

    this._shaderDef = args.shaderDef || BasicHeightMapMaterialDefinition;

    Layer._heightmapMaterial = new THREE.ShaderMaterial({
        vertexShader: this._shaderDef.vertexShader,
        fragmentShader: this._shaderDef.fragmentShader,
        transparent: true,
    });

    this._tiles = [];
    this._textures = {};
};

/**
 * 
 * @param url
 * @returns
 */
Layer.prototype._loadTexture = function(url) {
    THREE.ImageUtils.crossOrigin = "anonymous";
    this._textures[url] = THREE.ImageUtils.loadTexture(url);
    return this._textures[url];
};

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
Layer.prototype._createTileGeometry = function() {
    var geometry = new THREE.PlaneGeometry(this._tileWidth, this._tileHeight,
                                           this._xTileGridDensity,
                                           this._yTileGridDensity);
    var position = new THREE.Matrix4();
    position.makeTranslation(this._halfTileWidth, this._halfTileHeight, 0);
    geometry.applyMatrix(position);
    return geometry;
};

/**
 * @method _getRasterUrl Returns correct url to access a raster
 * @param {String} path Path to the 
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 * @returns {String}
 */
Layer.prototype._rasterUrl = function(path, x, y, zoomLevel) {
    zoomLevel = zoomLevel || 0;
    var url = path + "/";
    if (zoomLevel !== 0) {
        url += zoomLevel + "/";
    }
    var elem = path.split("/");
    url += elem[elem.length - 1] + "_" + "merge" + "_" + (x + 1) + "_" + (y + 1) + ".png";
    return url;
};

/**
 * @method tileBox Returns the tile geometry at x,y
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 * @returns {THREE.Box3} The translated geometry of the tile;
 */
Layer.prototype.tileBox = function(x, y) {
    var origin = this.tileOrigin(x, y);
    var min = new THREE.Vector3(origin.x, origin.y, 0);
    var max = new THREE.Vector3(origin.x + this._tileWidth, origin.y +
                                                            this._tileWidth, 0);
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
 * @method Add an object to a tile
 * @param {THREE.Object3D} mesh Object3D to add to the scene
 */
Layer.prototype.addToTile = function(mesh) {
    var tileIndex = this.tileIndexFromCoordinates(mesh.position);
    var origin = this.tileOrigin(tileIndex.x, tileIndex.y);
    mesh.position.x -= origin.x;
    mesh.position.y -= origin.y;
    var tile = this.tile(tileIndex.x, tileIndex.y);
    tile.add(mesh);
};

/**
 * 
 * @param coords
 * @returns {THREE.Vector2}
 */
Layer.prototype.tileIndexFromCoordinates = function(coords) {
    if (coords.x > this._origX + this._layerWidth) {
        return;
    }
    if (coords.y > this._origY + this._layerHeight) {
        return;
    }
    var x = Math.floor((coords.x - this._origX) / this._tileWidth);
    var y = Math.floor((coords.y - this._origY) / this._tileHeight);
    return new THREE.Vector2(x, y);
};

/**
 * 
 * @param x
 * @param y
 * @returns
 */
Layer.prototype.tileOrigin = function(x, y) {
    var dx = (this._tileWidth * x) + this._origX;
    var dy = (this._tileHeight * y) + this._origY;
    return new THREE.Vector2(dx, dy);
};

/**
 * @method tile Returns the tile at the index
 * @param {Number} x X index of the tile. Starting at the bottom left corner
 * @param {Number} y Y index of the tile. Starting at the bottom left corner
 * @returns {THREE.Mesh} Mesh representing the tile
 */
Layer.prototype.tile = function(x, y) {
    if (this.isTileCreated(x, y)) {
        return this._tiles[this._index(x, y)];
    }

    // Texture
    var dem = this._loadTexture(this._rasterUrl(this._dem, x, y));
    var ortho = this._loadTexture(this._rasterUrl(this._ortho, x, y));

    // Shader properties
    var uniformsTerrain = THREE.UniformsUtils.clone(this._shaderDef.uniforms);
    uniformsTerrain.dem.value = dem;
    uniformsTerrain.ortho.value = ortho;
    uniformsTerrain.minHeight.value = this._minDEMElevation;
    uniformsTerrain.maxHeight.value = this._maxDEMElevation;

    var heightMapMaterial = Layer._heightmapMaterial.clone();
    heightMapMaterial.uniforms = uniformsTerrain;

    var geometry = this._createTileGeometry(x, y);
    var tile = new THREE.Mesh(geometry, heightMapMaterial);

    // Tile origin
    var origin = this.tileOrigin(x, y);
    tile.translateX(origin.x);
    tile.translateY(origin.y);

    this._tiles[this._index(x, y)] = tile;
    this._scene.add(tile);
    return tile;
};

Layer.prototype.forEach = function(func) {
    for (var x = 0; x < this.nbTileX; x++) {
        for (var y = 0; y < this.nbTileY; y++) {
            func.call(this, x, y);
        }
    }
};

Layer.prototype.forEachTile = function(func) {
    this.forEach(function(x, y) {
        var tile = this.tile(x, y);
        func.call(this, tile, x, y);
    });
};