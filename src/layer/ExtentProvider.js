/**
 * Class which provides the extent of the view seen by the camera, in order
 * to make requests only on the visible zone.
 * 
 * @class ExtentProvider
 * @constructor
 * @param {THREE.Camera} camera the main camera of the Three.js scene
 */
var ExtentProvider = function(camera) {
	this._camera = camera;
	this._camFar = this._camera.far;
	this._camPosition = this._camera.position;
	this._camFov = this._camera.fov;
};

/**
@method getPosition
@return {THREE.Vector3} the position of the camera stored in the ExtententProvider instance
*/
ExtentProvider.prototype.getPosition = function() {
	return this._camPosition.clone();
};
