//"use strict";


/**
 * Class which ...
 * 
 * @class rMeshFactory
 * @constructor
 */
var MeshFactory = function(args) {
    this._pointMaterial = args.pointMaterial || new THREE.MeshBasicMaterial({color: 0xffff00}) ; // default : yellow
    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({color: 0x00ee00}) ; // default : green
    this._polyhMaterial = args.polyhMaterial ||  new THREE.MeshLambertMaterial({color:  0xcc0000}); // default : red
};

/**
@method applyRaster
*/
MeshFactory.prototype.jsonToMesh = function(jsonString) {

    var loader = new THREE.JSONLoader(); 
    var geom = loader.parse(json3);
    var material;
    var verticesCount = geom.geometry.vertices.length;
    var facesCount = geom.geometry.faces.length;
   
    if (verticesCount == 1) {
        console.log("point");
        material = this._pointMaterial;
    }
    else if(verticesCount > 1 && facesCount == 0 ) {
        console.log("line");
        material = this._lineMaterial;
    }
    else if(verticesCount > 3 && facesCount > 0) {
        console.log("3D")
        material = this._polyhMaterial;
    }
    console.log(geom);

    return new THREE.Mesh(geom, material);
};





