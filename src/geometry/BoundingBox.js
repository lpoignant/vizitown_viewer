var BoundingBox = function (args) {
	this.bottomLeft = args.bottomLeft || new Point();
	this.topRight = args.topRight || new Point();
};