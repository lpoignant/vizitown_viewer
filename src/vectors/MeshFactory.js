"use strict";

/**
 * Class which permit to convert a JSON representation of a geometry to a
 * Three.js mesh
 * 
 * @class MeshFactory
 * @constructor
 */
var MeshFactory = function(args) {
    if (!args) {
        args = {};
    }

    this._pointMaterial = args.pointMaterial ||
                          new THREE.ParticleSystemMaterial({
                              color : 0xFFFF00,
                              size : 5
                          });

    this._lineMaterial = args.lineMaterial || new THREE.LineBasicMaterial({
        color : 0x00ee00,
        lineWidth : 3
    });

    this._polyhMaterial = args.polyhMaterial || new THREE.MeshLambertMaterial({
        color : 0xcc0000,
        wireframe : true
    });
};

/**
 * @method jsonToThreejs
 * @return {THREE.Object3D} The line, particle or mesh which has been built. You
 *         just have to add this object to the scene with "scene.add(object);"
 */
MeshFactory.prototype.jsonToThreejs = function(jsonString) {

    var loader = new THREE.JSONLoader();
    var geom = loader.parse(jsonString);
    var material;
    var verticesCount = geom.geometry.vertices.length;
    var facesCount = geom.geometry.faces.length;

    // point
    if (verticesCount === 1) {
        material = this._pointMaterial;
        return new THREE.ParticleSystem(geom.geometry, material);

    }
    // line
    else if ((verticesCount > 1) && facesCount === 0) {
        material = this._lineMaterial;
        return new THREE.Line(geom.geometry, material);
    }

    // polyhedral
    else if ((verticesCount > 3) && (facesCount > 0)) {
        material = this._polyhMaterial;
        return new THREE.Mesh(geom.geometry, material);
    }

};
