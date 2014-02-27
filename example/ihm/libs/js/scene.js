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
    domId: "container",
    extent: {
        minX: parseFloat(sceneSettings.extent.xMin),
        minY: parseFloat(sceneSettings.extent.yMin),
        maxX: parseFloat(sceneSettings.extent.xMax),
        maxY: parseFloat(sceneSettings.extent.yMax),
    },
    hasRaster: sceneSettings.hasRaster,
    url: 'localhost:8888',
    vectors: sceneSettings.vectors,
});

var btnRefreshValues = {
	enabled: "Refresh",
	unabled: "Stop",
};

var getTimerId = function(uuid) {
    return 'timer_' + uuid;
};

var getBtnId = function(uuid) {
    return 'btn_' + uuid;
};

var intervalIds = {};

var refreshLayer = function(uuid) {
    var timer = document.getElementById(getTimerId(uuid));
    var btnRefresh = document.getElementById(getBtnId(uuid));
    if(timer.value && timer.value != "0") {
        if(btnRefresh.value == btnRefreshValues.enabled) {
            var refreshIntervalId = setInterval(function() {scene.refreshLayer(uuid);}, timer.value * 1000);
            intervalIds.uuid = refreshIntervalId;
            btnRefresh.setAttribute('value', btnRefreshValues.unabled);
            timer.setAttribute('disabled', true);
        } else {
            clearInterval(intervalIds.uuid);
            delete intervalIds.uuid;
            timer.removeAttribute('disabled');
            btnRefresh.setAttribute('value', btnRefreshValues.enabled);
        }
    } else {
        scene.refreshLayer(uuid);
    }
};

sceneSettings.vectors.forEach(function(vector) {
    var entry = document.createElement('li');
    var btnRefresh = document.createElement('input');
    var inputTimer = document.createElement('input');
    var fieldset = document.createElement('fieldset');
    var legend = document.createElement('legend');

    legend.innerHTML = vector.name;
    inputTimer.setAttribute('type', 'number');
    inputTimer.setAttribute('placeholder', 'Timer in sec');
    inputTimer.setAttribute('size', 3);
    inputTimer.setAttribute('id', getTimerId(vector.uuid));
    btnRefresh.setAttribute('type', 'button');
    btnRefresh.setAttribute('value', btnRefreshValues.enabled);
    btnRefresh.setAttribute('id', getBtnId(vector.uuid));
    btnRefresh.onclick = function() {
        refreshLayer(vector.uuid);
    };

    fieldset.appendChild(legend);
    fieldset.appendChild(inputTimer);
    fieldset.appendChild(btnRefresh);
    entry.appendChild(fieldset);
    document.getElementById("layer-list").appendChild(entry);
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
