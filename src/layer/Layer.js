/* global BasicHeightMapMaterialDefinition:false */
"use strict";
/**
 * This class represents a tiled layer
 * 
 * @class TiledLayer
 * @constructor
 * @param {int} args.x X Origin of the layer in the layer coordinate system
 * @param {int} args.y Y Origin of the layer in the layer coordinate system
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

    this._tileSizeWidth = args.tileSizeWidth || 512;
    this._tileSizeHeight = args.tileSizeHeight || 512;

    this._width = args.width || this._tileSizeWidth * 2;
    this._height = args.height || this._tileSizeHeight * 2;

    this.nbTileX = this._width / this._tileSizeWidth;
    this.nbTileY = this._height / this._tileSizeHeight;

    this._xDensity = args.xDensity || 8;
    this._yDensity = args.yDensity || 8;

    this._ortho = args.ortho || false;
    this._dem = args.dem || false;
    this._scene = args.scene || false;

    this._minHeight = args.minHeight || 0;
    this._maxHeight = args.maxHeight || 100;

    this._shaderDef = args.shaderDef || BasicHeightMapMaterialDefinition;

    Layer._heightmapMaterial = new THREE.ShaderMaterial({
        vertexShader : this._shaderDef.vertexShader,
        fragmentShader : this._shaderDef.fragmentShader,
        transparent : true,
    });

    this._tiles = [];
    this._textures = {};
};

Layer.prototype._loadTexture = function(url) {
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
 * @method _createTileGeometry Creates a tile geometry
 * @returns {THREE.PlaneGeometry} Tile geometry with its center at (0,0)
 */
Layer.prototype._createTileGeometry = function() {
    var geometry = new THREE.PlaneGeometry(this._tileSizeWidth,
                                           this._tileSizeWidth, this._xDensity,
                                           this._yDensity);
    return geometry;
};

/**
 * @method position Return the position of the tile at x,y
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.PlaneGeometry} The tile geometry translated
 */

/**
 * @method _createTranslatedTileGeometry Creates a tile geometry translated at
 *         the correct position
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.PlaneGeometry} The tile geometry translated
 */
Layer.prototype._createTranslatedTileGeometry = function(x, y) {
    var geometry = this._createTileGeometry(x, y);
    // Tile origin
    var dx = this._origX + this._tileSizeWidth * x;
    var dy = this._origY + this._tileSizeHeight * y;

    var position = new THREE.Matrix4();
    position.setPosition(dx, dy, 0);
    geometry.applyMatrix(position);
    return geometry;
};

/**
 * @method tileBox Returns the tile geometry at x,y
 * @param {Number} x X index of the tile. Starting at the upper left corner
 * @param {Number} y Y index of the tile. Starting at the upper left corner
 * @returns {THREE.Box3} The translated geometry of the tile;
 */
Layer.prototype.tileBox = function(x, y) {
    var geometry;
    var matrix;

    if (this.isTileCreated(x, y)) {
        var tile = this.tile(x, y);
        geometry = tile.geometry;
        matrix = tile.worldMatrix;
    }
    else {
        geometry = this._createTileGeometry(x, y);
        maxtrix = new THREE.Matrix4();
        matrix.setPosition(dx, dy, 0);
    }

    if (geometry.boundingBox === null) {
        geometry.computeBoundingBox();
    }

    var box = new THREE.Box3();
    box.copy(geometry.boundingBox);
    box.applyMatrix(matrix);
    return box;
};

Layer.prototype._createTile = function(x, y) {
    var geometry = this._createTileGeometry(x, y);
    // Texture
    var dem = this._textures[this._dem] || this._loadTexture(this._dem);
    var ortho = this._textures[this._ortho] || this._loadTexture(this._ortho);

    // Shader properties
    var uniformsTerrain = THREE.UniformsUtils.clone(this._shaderDef.uniforms);
    uniformsTerrain.dem.value = dem;
    uniformsTerrain.ortho.value = ortho;
    uniformsTerrain.minHeight.value = this._minHeight;
    uniformsTerrain.maxHeight.value = this._maxHeight;

    var heightMapMaterial = Layer._heightmapMaterial.clone();
    heightMapMaterial.uniforms = uniformsTerrain;

    var tile = new THREE.Mesh(geometry, heightMapMaterial);
    tile.translateX(dx);
    tile.translateY(dy);

    this._tiles[this._index(x, y)] = tile;
    return tile;
};

Layer.prototype.addTile = function(x, y) {
    var tile = this._tiles[this._index(x, y)] || this._createTile(x, y);
    this._scene.add(tile);
    return tile;
};

/**
 * @method _index Returns the index of the tile
 * @param {Number} x X column index of the tile
 * @param {Number} y Y row index of the tile
 */
Layer.prototype._index = function(x, y) {
    return this.nbTileX * x + y;
};

/**
 * @method Add an object to a tile
 * @param {THREE.Object3D} Object3D to add to the scene
 */
Layer.prototype.addToTile = function(mesh) {
    var tile = this.addTile();
    tile.add(mesh);
};

/**
 * @method tile Returns the tile at the index
 * @param x
 * @param y
 */
Layer.prototype.tile = function(x, y) {

};
