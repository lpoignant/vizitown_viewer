"use strict";

/**
 * @class ExtentProvider Send the signal "ExtentChanged" when the camera extent
 *        being watched changed
 * @extends ExtentDispatcher
 * @constructor
 * @param {THREE.Camera} camera Camera to get the extent from
 * @param {TileLayer} domElement Layer contained in the frustum
 */
var ExtentProvider = function(camera, layer) {
    this._camera = camera;
    // make sure camera's local matrix is updated
    this._camera.updateMatrix();
    // make sure camera's world matrix is updated
    this._camera.updateMatrixWorld();
    this._camera.matrixWorldInverse.getInverse(this._camera.matrixWorld);

    this._layer = layer;
    // make sure plane's local matrix is updated
    this._layer.updateMatrix();
    // make sure plane's world matrix is updated
    this._layer.updateMatrixWorld();

    this._frustum = new THREE.Frustum();
};

/**
 * @method getCameraPosition Returns the current camera position
 * @return {THREE.Vector3} The camera position
 */
ExtentProvider.prototype.cameraPosition = function() {
    var position = this._camera.position.clone();
    position.z = 0;
    return position;
};

/**
 * @method getCameraPosition Returns the current camera far distance
 * @returns {Number} The camera far distance
 */
ExtentProvider.prototype.cameraFar = function() {
    return this._camera.far;
};

/**
 * @method cameraVerticalFov Returns the camera Vertical Field Of View
 * @return {Number} The camera vfov in degrees
 */
ExtentProvider.prototype.cameraVerticalFov = function() {
    return this._camera.fov;
};

/**
 * @method cameraHorizontalFov Returns the camera Horizontal Field Of View
 * @return {Number} The camera hfov in degrees
 */
ExtentProvider.prototype.cameraHorizontalFov = function() {
    var vfov = this.cameraVerticalFov();
    var aspect = this.cameraAspect();
    return Math.atan(Math.tan(vfov / 2) * aspect) * 2;
};

/**
 * @method cameraAspect Returns the camera aspect ratio
 * @return {Number} Aspect ratio of the camera
 */
ExtentProvider.prototype.cameraAspect = function() {
    return this._camera.aspect;
};

/**
 * @method cameraRotation Returns the current camera rotation in Euler angles
 * @return {THREE.Euler} The rotation of the camera around the Z axis
 */
ExtentProvider.prototype.cameraRotationY = function() {
    var rotation = this._camera.rotation.clone();
    rotation.x = 0;
    rotation.y = 0;
    return rotation;
};

/**
 * @method extentHalfWidth Returns the half width of the extent. Based on the
 *         camera view angle and the far distance
 * @return {Number} Half width of the extent
 */
ExtentProvider.prototype.extentHalfWidth = function() {
    // Calculating opposite field of the triangle
    var angle = this.cameraHorizontalFov();
    var adjacent = this.cameraFar();
    var opposed = Math.tan(angle) * adjacent;
    return opposed;
};

/**
 * @method extentHalfHeight Returns the half height of the extent. Based on the
 *         camera view angle and far distance
 * @return {Number} Half height of the extent
 */
ExtentProvider.prototype.extentHalfHeight = function() {
    // Calculating opposite field of the triangle
    var angle = this.cameraVerticalFov();
    var adjacent = this.cameraFar();
    var opposed = Math.tan(angle) * adjacent;
    return opposed;
};

/**
 * @method getCameraExtent Return the current camera extent viewed
 * @return {THREE.Geometry} Extent viewed by the camera
 */
ExtentProvider.prototype.extents = function() {
    var extents = [];
    var position = this.cameraPosition();

    // Matrix representing our extent position and orientation
    var eulerAngle = this.cameraRotationY();
    var cameraPosition = this.cameraPosition();

    var position = new THREE.Matrix4();
    position.makeRotationFromEuler(eulerAngle);
    position.setPosition(cameraPosition);

    // Moving geometry
    var geometry = this._geometry.clone();
    console.log(geometry);
    geometry.applyMatrix(position);
    return geometry;
};
