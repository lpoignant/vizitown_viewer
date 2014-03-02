"use strict";

var Volume = function(mesh) {
    this.mesh = mesh;
    this.mesh.geometry.computeBoundingBox();

    var box = mesh.geometry.boundingBox.clone();

    var shape = new THREE.Shape();
    shape.moveTo(box.min.x, box.min.y);
    shape.moveTo(box.max.x, box.min.y);
    shape.moveTo(box.max.x, box.max.y);
    shape.moveTo(box.min.x, box.max.y);

    var depth = box.max.z - box.min.z;
    var extrudeSettings = {
        bevelEnabled: false,
        steps: 1,
        amount: depth
    };

    var material = Volume.material.clone();
    material.color = mesh.material.color;

    var geometry = shape.extrude(extrudeSettings);
    var translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(0, 0, box.min.z);
    geometry.applyMatrix(translationMatrix);

    this.bb = new THREE.Mesh(geometry, material);
    this.bb.position = this.mesh.position;
    this.bb.geometry.computeBoundingBox();
};

Volume.material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
});
