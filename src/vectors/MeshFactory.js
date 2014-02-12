//"use strict";

/**
 * Class which permit to convert a JSON representation of a geometry to a Three.js mesh
 * 
 * @class MeshFactory
 * @constructor
 */
var MeshFactory = function(args) {
    
    if (args === undefined) args = {};

    this._pointMaterial = /*args.pointMaterial ||*/ new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true}); // default : yellow
    this._lineMaterial = /*args.lineMaterial ||*/ new THREE.LineBasicMaterial({color: 0x00ee00, wireframe: true}); // default : green
    this._polyhMaterial = /*args.polyhMaterial ||*/  new THREE.MeshLambertMaterial({color:  0xcc0000, wireframe: true}); // default : red
};

/**
@method jsonToMesh 
*/
MeshFactory.prototype.jsonToMesh = function(jsonString) {

    var loader = new THREE.JSONLoader(); 
    var geom = loader.parse(jsonString);
    var material;
    var verticesCount = geom.geometry.vertices.length;
    var facesCount = geom.geometry.faces.length;
   
    if (verticesCount == 1) {

        //console.log("point");
        material = this._pointMaterial;
        
    }
    else if(verticesCount > 1 && facesCount == 0 ) {

        //console.log("line");
        //geom = new THREE.Line(geom);
        material = this._lineMaterial;
        return new THREE.Line(geom, material)
    }
    else if(verticesCount > 3 && facesCount > 0) {

        //console.log("3D");
        material = this._polyhMaterial;
    }

    return new THREE.Mesh(geom.geometry, material);

};
