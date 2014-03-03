/* global EventDispatcher */
"use strict";

/**
 * Represent a canvas
 * 
 * @class CanvasTile
 * @constructor
 * @param {String} url HTTP resource of the picture
 * @param {int} x The x coordinate
 * @param {int} y The y coordinate
 */
var CanvasTile = function(url, x, y) {
    EventDispatcher.call(this);

    this._url = url;
    this.x = x;
    this.y = y;
    this._canvas = document.createElement("canvas");
    this._context = this._canvas.getContext('2d');

    var self = this;
    THREE.ImageUtils.crossOrigin = "anonymous";
    this.texture = THREE.ImageUtils
            .loadTexture(url, undefined, function(texture) {
                self._canvas.width = texture.image.width;
                self._canvas.height = texture.image.height;
                self._context.drawImage(texture.image, 0, 0);

                self.dispatch("demLoaded", {
                    x: self.x,
                    y: self.y
                });
            });
};
CanvasTile.inheritsFrom(EventDispatcher);

/**
 * Getter for canvas size
 * 
 * @method size
 * @return {THREE.Vector2} size of the tile
 */
CanvasTile.prototype.size = function() {
    if (!this._context) {
        return;
    }
    return new THREE.Vector2(this._canvas.width, this._canvas.height);
};

/**
 * Return the pixel color value for a point
 * 
 * @method value
 * @param {THREE.Vector2} point
 * @return {int} pixel color value
 */
CanvasTile.prototype.value = function(point) {
    if (!this._context) {
        return;
    }
    var pixel = this._context.getImageData(point.x, point.y, 1, 1).data;
    return pixel[0] / 255;
};
