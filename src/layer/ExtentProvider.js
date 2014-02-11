var ExtentProvider = function(camera) {
	this._camera = camera;
	this._camFar = this._camera.far;
	this._camPosition = this._camera.position;
	this._camFov = this._camera.fov;
};

ExtentProvider.prototype.getPosition = function() {
	return this._camPosition.clone();
};
