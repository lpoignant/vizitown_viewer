var req = new XMLHttpRequest();
req.open('GET', "http://localhost:8888/init", false); 
req.send(null);
if (req.status != 200) {
    throw "No scene defined";
}

var sceneSettings = JSON.parse(req.responseText);
var scene = new Scene({
    window: window,
    document: document,
    domId: "main_map",
    extent: {
        minX: parseFloat(sceneSettings.extent.xMin),
        minY: parseFloat(sceneSettings.extent.yMin),
        maxX: parseFloat(sceneSettings.extent.xMax),
        maxY: parseFloat(sceneSettings.extent.yMax),
    },
	url: "localhost:8888",
    hasRaster: sceneSettings.hasRaster,
});

var changeZoomLevel = function(value) {
    scene.zoom(value);
};
console.log(scene);
scene.render();

var saveParameters = function() {
    scene._camera.fov = document.getElementById('angleInput').value;
    scene._camera.far = document.getElementById('deepInput').value;
    scene._scene.fog.far = document.getElementById('deepInput').value;
};

document.getElementById('angleInput').value = scene._camera.fov;
document.getElementById('deepInput').value = scene._camera.far;
document.getElementById('deepInput').value = scene._scene.fog.far;
