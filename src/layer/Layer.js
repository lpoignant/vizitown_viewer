/**
 * This class represents a tiled layer
 *  
 * @class TiledLayer
 * @constructor
 * @param {int} args.x X Origin of the layer in the layer coordinate system
 * @param {int} args.y Y Origin of the layer in the layer coordinate system
 * @param {int} args.tileSizeWidth Width of a tile in the layer coordinate system
 * @param {int} args.tileSizeHeight Height of a tile in the layer coordinate system
 * @param {String} args.ortho Url to get the ortho
 * @param {String} args.dem Url to get the dem raster
 * @param {int} args.xDensity Number of on the x axis
 * @param {int} args.yDensity Number of line on the y axis
 */
var Layer = function (args) {
	this._origX = args.x || 0;
	this._origY = args.y || 0;
	
	this._tileSizeWidth = args.tileSizeWidth || 512;
	this._tileSizeHeight = args.tileSizeHeight || 512;
	
	this._width = args.width || this._tileSizeWidth * 2;
	this._height = args.height || this._tileSizeHeight * 2;
	
	this.nbTileX = this._width / this._tileSizeWidth;
	this.nbTileY = this._height / this._tileSizeHeight;
	
	this._xDensity = args.xDensity || 10;
	this._yDensity = args.yDensity || 10;
	
	this._ortho = args.ortho || false;
	this._dem = args.dem || false;
	this._scene = args.scene || false;
	
	this._minHeight = args.minHeight || 0;
	this._maxHeight = args.maxHeight || 100;
	
	this._shaderDef = args.shaderDef || BasicHeightMapMaterialDefinition;
    
    Layer._wireMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'red',
        transparent: true,
    });
    
    Layer._heightmapMaterial = new THREE.ShaderMaterial({
        vertexShader: this._shaderDef.vertexShader,
        fragmentShader: this._shaderDef.fragmentShader,
        transparent: true,
    });
    
	this._tiles = [];
	this._textures = {};
};

Layer.prototype._loadTexture = function (url) {
	this._textures[url] = THREE.ImageUtils.loadTexture(url);
	return this._textures[url];
};

Layer.prototype._createTile = function (x, y) {
	//Tile origin
	var dx = this._origX + this._tileSizeWidth * x;
	var dy = this._origY + this._tileSizeHeight * y;
	var geometry = new THREE.PlaneGeometry(this._tileSizeWidth, this._tileSizeWidth, this._xDensity, this._yDensity);
	
	var dem = this._textures[this._dem] || this._loadTexture(this._dem);
	var ortho = this._textures[this._ortho] || this._loadTexture(this._ortho);
	
	var uniformsTerrain = THREE.UniformsUtils.clone(this._shaderDef.uniforms);
	uniformsTerrain.dem.value = dem;
	uniformsTerrain.ortho.value = ortho;
	uniformsTerrain.minHeight.value = this._minHeight;
	uniformsTerrain.maxHeight.value = this._maxHeight;
	
	var heightMapMaterial = Layer._heightmapMaterial.clone();
    heightMapMaterial.uniforms = uniformsTerrain;
	
    var tile = new THREE.Object3D();
    
	//tile.add(new THREE.Mesh(geometry, Layer._wireMaterial));
    tile.add(new THREE.Mesh(geometry, heightMapMaterial));
	tile.translateX(dx);
	tile.translateY(dy);
	
	this._tiles[this.nbTileX * x + y] = tile;
	return tile;
};

Layer.prototype.addTile = function (x, y) {
	var tile = this._tiles[this.nbTileX * x + y] || this._createTile(x,y);
	this._scene.add(tile);
};
