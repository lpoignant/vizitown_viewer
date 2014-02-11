"use strict";

/**
 * Send the signal "ExtentChanged" when the camera extent being watched changed
 *
 * @class ExtentProvider
 * @extends ExtentDispatcher
 * @constructor
 * @param {THREE.Camera} camera Camera to get the extent from
 */
var ExtentProvider = function(camera, domElement) {
	this._camera = camera;
    this._domElement = domElement;
    
    //Area coordinates viewed by the camera
    var distanceViewed = this.cameraFar();
    var halfWidth = this._extentHalfWidth();
    var bottomLeft = new THREE.Vector2(-halfWidth, 0);
    var bottomRight = new THREE.Vector2(halfWidth, 0);
    var topRight = new THREE.Vector2(halfWidth, distanceViewed);
    var topLeft = new THREE.Vector2(-halfWidth, distanceViewed);
    
    //Shape
    var pts = [bottomLeft, bottomRight, topRight, topLeft];
    var shape = new THREE.Shape(pts);
    
    this._geometry = shape.makeGeometry();
};

/**
 * @class ExtentProvider
 * @method getCameraPosition Retrun the current camera postion
 * @return {THREE.Vector3} The camera postion
 */
ExtentProvider.prototype.cameraPosition = function () {
    return this._camera.position.clone();
};

/**
 * @class ExtentProvider
 * @method getCameraPosition Retrun the current camera far distance
 * @return {float} The camera far distance
 */
ExtentProvider.prototype.cameraFar = function () {
    return this._camera.far;
};

/**
 * @class ExtentProvider
 * @method getCameraFov Retrun the current camera view angle
 * @return {float} The camera angle in degrees
 */
ExtentProvider.prototype.cameraFov = function () {
    return this._camera.fov;
};

/**
 * @class ExtentProvider
 * @method getCameraRotation Retrun the current camera rotation
 * @return {THREE.Euler} The Euler rotation of the camera
 */
ExtentProvider.prototype.cameraRotation = function () {
    return this._camera.rotation.clone();
};

/**
 * @class ExtentProvider
 * @method _flattentGeometry Project the area on the x-y plane
 * @param {THREE.Geometry} geometry Geometry to flatten
 * @return {THREE.Geometry} Returns the 
 */
ExtentProvider.prototype._flattenGeometry = function (geometry) {
    geometry.vertices.forEach(function (vector) {
        vector.z = 0;
    });
    return geometry;
};

/**
 * @class ExtentProvider
 * @method _minimumExtent Garantees the extent is at least as big as the canvas. Change the extent passed as argument.
 * @param {THREE.Box3} extent Extent viewed by the camera
 * @return {THREE.Box3} The modified extent
 */
ExtentProvider.prototype._minimumExtent = function (extent) {
    console.log(this, this._domElement);
    var halfHeight = this._domElement.height * 0.5;
    var bottomLeft = extent.min.clone();
    var topLeft = extent.max.clone();
    topLeft.x = bottomLeft.x;
    
    var dist = bottomLeft.distanceTo(topLeft);
    if (dist >= this._domElement.height) return extent;
    
    extent.min.x -= halfHeight;
    extent.max.x += halfHeight;
    return extent;
};

/**
 * @class ExtentProvider
 * @method _extentHalfWidth Returns the half width of the extent.
 *                          Based on the camera view angle and the far distance
 * @return {float} Half width of the extent
 */
ExtentProvider.prototype._extentHalfWidth = function () {
    //Basic trigonometry
    var angle = this.cameraFov();
    var adjacent = this.cameraFar();
    var opposed = Math.tan(angle) * adjacent;
    return opposed;
};

/**
 * @class ExtentProvider
 * @method getCameraExtent Retrun the current camera extent viewed
 * @return {THREE.Geometry} Extent viewed by the camera 
 */
ExtentProvider.prototype.cameraExtent = function () {
    //Calculating extent shape coordinates
    var geometry = this._geometry.clone();
    
    //Camera view plane is perpendicular to camera object plane
    var cameraCorrection = new THREE.Quaternion();
    var xVector = new THREE.Vector3( 1, 0, 0 );
    cameraCorrection.setFromAxisAngle(xVector, -Math.PI * 0.5);
    
    //Orientation of our extent
    var orientation = new THREE.Quaternion();
    orientation.setFromEuler(this.cameraRotation());
    orientation.multiply(cameraCorrection);
    
    //Matrix representing our extent postion and orientation
    var position = new THREE.Matrix4();
    position.makeRotationFromQuaternion(orientation);
    position.setPosition(this.cameraPosition());
    
    geometry.applyMatrix(position);
    geometry = this._flattenGeometry(geometry);
    
    //Calculating final extent
    var extent  = new THREE.Box3();
    extent.setFromPoints(geometry.vertices);
    extent = this._minimumExtent(extent);
    
    return extent;
};

/**
 * @class ExtentProvider
 * @method sendToAppServer Function to be defined and implemented
 */
ExtentProvider.prototype.sendToAppServer = function (appServerUrl, bottomLeft, topRight) {
	var toSend = "{ 'Xmin' : "+bottomLeft.x+", 'Ymin' : "+bottomLeft.y+", 'Xmax' : "+topRight.x+", 'Ymax': "+topRight.y+" }";
	
	var ws = new WebSocket(appServerUrl);
	ws.onopen = function() {
       ws.send(toSend);
	};
};
