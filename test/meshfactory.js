"use strict";  
   
describe('MeshFactory', function () {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("main_map").appendChild(renderer.domElement);
    //var axes = new THREE.AxisHelper( 20 );
    //scene.add(axes);

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;

    var clock = new THREE.Clock();
    var trackballControls = new THREE.TrackballControls(camera);

    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.0;
    trackballControls.panSpeed = 1.0;
    trackballControls.staticMoving = true;

    function render() {
        var delta = clock.getDelta();
        trackballControls.update(delta);
        requestAnimationFrame(render);
        renderer.render(scene, camera)
    }

    render();

    //point
    var pointObject = {
        "metadata" :{
            "formatVersion" : 3.1,
            "generatedBy"   : "Vizitown Creation",
            "vertices"      : 1, 
            "faces"         : 0,
            "normals"       : 0,
            "colors"        : 0, 
            "uvs"           : 0,
            "materials"     : 0,
            "morphTargets"  : 0,
            "bones"         : 0
        },
        "vertices" : [10,10,5],
        "morphTargets" : [],
        "normals" : [],
        "colors" : [],
        "uvs" : [],
        "faces" : [], 
        "bones" : [],
        "skinIndices" : [],
        "skinWeights" : [],
        "animations" : []
    };

    //line
    var lineObject = {
        "metadata" :{
            "formatVersion" : 3.1,
            "generatedBy"   : "Vizitown Creation",
            "vertices"      : 5,
            "faces"         : 0,
            "normals"       : 0,
            "colors"        : 0,
            "uvs"           : 0,
            "materials"     : 0,
            "morphTargets"  : 0,
            "bones"         : 0
        },
        "vertices" : [0,0,0,1,1,0,2,2,0,3,3,0,4,4,0],
        "morphTargets" : [],
        "normals" : [],
        "colors" : [],
        "uvs" : [],
        "faces" : [],
        "bones" : [],
        "skinIndices" : [],
        "skinWeights" : [],
        "animations" : []
    };


    var meshFactory = new MeshFactory();

    describe('#Point test', function () {

        var point = meshFactory.jsonToThreejs(pointObject);
        scene.add(point);
        var pointCoords = point.geometry.vertices[0];
        
        it('should be equal', function (done) {
            assert.equal(pointCoords.x, 10);
            assert.equal(pointCoords.y, 10);
            assert.equal(pointCoords.z, 5);
            done();
        });
    });

    describe('#Line test', function () {
        var line = meshFactory.jsonToThreejs(lineObject);
        scene.add(line);
        console.log(line);
        var lineCoords = line.geometry.vertices;
        it('should be equal', function (done) {
            assert.equal(lineCoords[0].x, 0);
            assert.equal(lineCoords[0].y, 0);
            assert.equal(lineCoords[0].z, 0);
            assert.equal(lineCoords[2].x, 2);
            assert.equal(lineCoords[2].y, 2);
            assert.equal(lineCoords[2].z, 0);
            assert.equal(lineCoords[4].x, 4);
            assert.equal(lineCoords[4].y, 4);
            assert.equal(lineCoords[4].z, 0);
            done();
        });
    });
    /*
    describe('#Polyhedral test', function () {

        it('should be equal', function (done) {

            done();
        });
    });
  */

});