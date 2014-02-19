"use strict";

/**
 * Represent a canvas
 * 
 * @class CanvasTile
 * @constructor
 * @param {Object} args JSON Object containing arguments
 * @param {int} args.x X top left corner of the canvas in the canvas coordinate
 *                system
 * @param {int} args.y Y top left corner of the canvas in the canvas coordinate
 *                system
 * @param {int} args.tileSizeWidth Width of a tile in the canvas coordinate
 *                system
 * @param {int} args.tileSizeHeight Height of a tile in the canvas coordinate
 *                system
 */
var CanvasTile = function(url) {
    this._url = url;
    this._canvas = document.createElement("canvas");
    this.texture = new THREE.Texture(this._canvas);

    var image = new Image();
    var self = this;
    image.onload = function() {
        self._canvas.width = image.width;
        self._canvas.height = image.height;
        self._context = self._canvas.getContext("2d");
        self._context.drawImage(image, 0, 0);
        // self.texture.needsUpdate = true;
    };
    image.src = this._url;
};

CanvasTile.prototype.size = function() {
    if (!this._context) {
        return;
    }
    return new THREE.Vector2(this._canvas.width, this._canvas.height);
};

CanvasTile.prototype.value = function(point) {
    if (!this._context) {
        return;
    }
    var pixel = this._context.getImageData(point.x, point.y, 1, 1).data;
    return pixel[0];
};
