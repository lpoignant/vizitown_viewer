"use strict";

/**
 * Represent a canvas
 *
 * @class CanvasTile
 * @constructor
 * @param {int} args.x X top left corner of the canvas in the canvas coordinate
 *                system
 * @param {int} args.y Y top left corner of the canvas in the canvas coordinate
 *                system
 * @param {int} args.tileSizeWidth Width of a tile in the canvas coordinate
 *                system
 * @param {int} args.tileSizeHeight Height of a tile in the canvas coordinate
 *                system
 *
 */
var CanvasTile = function(args) {
    this._origX = args.x || 0;
    this._origY = args.y || 0;

    this._canvas = document.createElement('canvas');
    this._canvas.width = args.tileWidth || 512;
    this._canvas.height = args.tileHeight || 512;
    this._context = this._canvas.getContext("2d");

    this._loaded = false;
};

/**
 * @method addImg Add an image to the canvas tile
 * @param urlImg Url of the image source
 */
CanvasTile.prototype.addImg = function(urlImg) {
    var image = new Image();
    var self = this;
    image.onload = function() {
        self._context.drawImage(image, 0, 0);
	self._loaded = true;
    };
    image.src = urlImg;
};

/**
 * @method getTileCoords Retreive the tile coordinates from absolute coordinates
 * @param absCoords the absolute coordinates
 * @returns {THREE.Vector2}
 */
CanvasTile.prototype.getTileCoords = function(absCoords) {
    return new THREE.Vector2(absCoords.x - this._origX, absCoords.y - this._origY);
};

CanvasTile.prototype.pixelValueFromCoordinates = function(absCoords) {
    var tileCoords = this.getTileCoords(absCoords);
    var pixel = this._context.getImageData(tileCoords.x, tileCoords.y, 1, 1).data;
    return pixel[0];
};
