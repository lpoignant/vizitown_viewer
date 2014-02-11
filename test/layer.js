describe('CamPosition', function () {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("main_map").appendChild(renderer.domElement);

    var axes = new THREE.AxisHelper( 20 );
    scene.add(axes);

    var extentProvider;

    describe('#initExtentprovider', function (done) {
        camera.position.x = 0;
        camera.position.y = 10;
        camera.position.z = 10;
        var position1 = new THREE.Vector3(0,0,0);
        camera.lookAt(position1);
        extentProvider = new ExtentProvider(camera);

        it('should be equal', function () {
            var pos = extentProvider.getPosition();
            assert.equal(pos.x, 0);
            assert.equal(pos.y, 10);
            assert.equal(pos.z, 10);
            done();
        });
    });

    describe('#changeLookAt', function (done) {


        it('should be equal', function () {
            camera.position.x = 0;
            camera.position.y = 10;
            camera.position.z = 10;
            var position1 = new THREE.Vector3(0,0,0);
            camera.lookAt(position1);
            var position2 = new THREE.Vector3(100,50,20);
            camera.lookAt(position2);
            var pos = extentProvider.getPosition();
            assert.equal(pos.x, 0);
            assert.equal(pos.y, 10);
            assert.equal(pos.z, 10);
            done();
        });
    });

    describe('#changeCamPositionAndLookAt', function () {

        it('should be equal', function (done) {
            camera.position.x = 0;
            camera.position.y = 10;
            camera.position.z = 10;
            var position1 = new THREE.Vector3(0,0,0);         
            camera.lookAt(position1);
            var position2 = new THREE.Vector3(100,50,20);
            camera.lookAt(position2);
            camera.position.x = 140;
            camera.position.y = 120;
            camera.position.z = -10;
            var pos = extentProvider.getPosition();
            assert.equal(pos.x, 140);
            assert.equal(pos.y, 120);
            assert.equal(pos.z, -10);
            done();
        });
    });

});