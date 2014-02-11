var ExtentProvider = function(camera) {
	this._camera = camera;
	this._camFar = this._camera.far;
	this._camPosition = this._camera.position;
	this._camFov = this._camera.fov;

};

ExtentProvider.prototype.getPosition = function() {
	return this._camPosition.clone();
};


ExtentProvider.prototype.getCameraExtent = function() {
	console.log(this._camera);
	//console.log(this._camFar);
	//console.log(this._camPosition);
	//console.log(this._camFov);

	// Calculate the half height of the extent
	var halfHeightExtent;
	var angle = this._camFov / 2;
	halfHeightExtent = Math.sin(angle)/Math.cos(angle)*this._camFar;

	// Get the direction vector of the camera
	var pLocal = new THREE.Vector3(0, 0, -1);
	var pWorld = pLocal.applyMatrix4( this._camera.matrixWorld );
	var dir = pWorld.sub( this._camPosition).normalize();

	console.log(dir);


	var topLeft, topRight, bottomRight, bottomLeft;




};