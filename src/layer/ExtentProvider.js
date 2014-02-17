/* global EventDispatcher */
"use strict";

/**
 * Send the signal "ExtentChanged" when the camera extent being watched changed
 * 
 * @class ExtentProvider
 * @extends EventDispatcher
 * @constructor
 * @param {THREE.Camera} camera Camera to get the extent from
 * @param {TileLayer} domElement Layer contained in the frustum
 */
var ExtentProvider = function(control, layer) {
    var self = this;
    control.addEventListener("moved", function(args) {
        self.extents(args.camera);
    });

    this._layer = layer;
    this._frustum = new THREE.Frustum();
};
ExtentProvider.inheritsFrom(EventDispatcher);

/**
 * @method getCameraExtent Return the current camera extent viewed
 * @param {THREE.Camera} camera
 * @return {Array} Array of THREE.Box3 representing the extents viewed
 */
ExtentProvider.prototype.extents = function(camera) {
    var extents = [];

    // Update camera
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    // Create frustum from camera
    var matrixFrustum = camera.projectionMatrix.clone();
    matrixFrustum.multiply(camera.matrixWorldInverse);
    this._frustum.setFromMatrix(matrixFrustum);

    var self = this;
    this._layer.forEachTile(function(tile, x, y) {
        // Avoid creating tile if it does not exists
        var box = self._layer.tileBox(x, y);
        console.log("intersects", x, y);
        if (self._frustum.intersectsBox(box)) {
            extents.push({
                extent: box,
                x: x,
                y: y,
            });
        }
    });

    this.dispatch("extentChanged", extents);
};
