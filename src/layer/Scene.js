/* global FPSControl, VectorLayer, Camera, SceneSocket, TerrainLayer, VWebSocket */
"use strict";

/**
 * @class Scene
 * @constructor
 * @param {Object} args JSON Object containing the arguments
 * @param {String} args.url Url which contains all resources
 * @param {Object} args.extent The extent of the scene
 * @param {Window} args.window The window DOM element
 * @param {Document} args.document The document DOM element
 * @param {Boolean} args.hasRaster True if the generated scene need to display
 *                rasters
 * @param {Array} args.layers An array of vector layers
 * @param {String} args.domId Identifier of the DOM element representing the scene
 */
var Scene = function(args) {
    args = args || {};

    var url = args.url || location.host;

    var req = new XMLHttpRequest();
    req.open('GET', "http://" + url + "/init", false);
    req.send(null);
    if (req.status !== 200) {
        throw "No scene defined";
    }
    var sceneSettings = JSON.parse(req.responseText);

    var extent = args.extent || {
        minX: parseFloat(sceneSettings.extent.xMin),
        minY: parseFloat(sceneSettings.extent.yMin),
        maxX: parseFloat(sceneSettings.extent.xMax),
        maxY: parseFloat(sceneSettings.extent.yMax),
    };

    // Init
    this._url = args.url || location.host;
    this._originX = extent.minX;
    this._originY = extent.minY;
    this._width = extent.maxX - extent.minX;
    this._height = extent.maxY - extent.minY;
    this._window = args.window || window;
    this._document = args.document || document;
    this._color = 0xdfdfdf;
    this._hasRaster = args.hasRaster || sceneSettings.hasRaster;
    this.layers = args.layers || sceneSettings.vectors;

    // Renderer
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setClearColor(this._color, 0);
    this._renderer.setSize(this._window.innerWidth, this._window.innerHeight);
    this._renderer.autoClear = false;

    // Camera
    var camX = this._width * 0.5;
    var camY = this._height * 0.5;
    this._camera = new Camera({
        window: this._window,
        renderer: this._renderer,
        x: camX,
        y: camY,
    });

    // Layers
    this._createVectorLayer(this.layers);
    if (this._hasRaster) {
        this._createRasterLayer();
    }

    // Control
    this._control = new FPSControl(this._camera, this._document);
    this._control.addEventListener("moved", this.displayLayers.bind(this));

    // Sync
    this._socket = new SceneSocket({
        url: "ws://" + this._url,
        scene: this,
    });

    this._document.getElementById(args.domId).appendChild(this._renderer.domElement);

    this._createPasses();
    this.displayLayers();
};

/**
 * Display all the layers if exists
 * 
 * @method displayLayers
 */
Scene.prototype.displayLayers = function() {
    if (this._vectorLayer) {
        this._vectorLayer.display(this._camera);
    }
    if (this._terrainLayer) {
        this._terrainLayer.display(this._camera);
    }
};

/**
 * Move the camera to a specific location
 * 
 * @method moveTo
 * @param {THREE.Vector2} coords A 2D coordinates of the futur location
 */
Scene.prototype.moveTo = function(coords) {
    var x = coords.x - this._originX;
    var y = coords.y - this._originY;
    this._camera.position.x = x;
    this._camera.position.y = y;
    var lookPoint = new THREE.Vector3(x, y, this._camera.position.z - 1);
    this._camera.lookAt(lookPoint);
};

/**
 * Render the entire scene
 * 
 * @method render
 */
Scene.prototype.render = function() {
    this._window.requestAnimationFrame(this.render.bind(this));
    this._renderer.clear();
    if (this._terrainLayer) {
        this._renderer.render(this._terrainLayer, this._camera, this._target, true);

        this._renderer.context.enable(this._renderer.context.STENCIL_TEST);
        this._renderer.context.enable(this._renderer.context.DEPTH_TEST);
        this._vectorLayer.forEachVolume(this._camera, this._volumeDrapping.bind(this));
        this._renderer.context.disable(this._renderer.context.STENCIL_TEST);

        this._renderer.render(this._vectorLayer, this._camera, this._target);
    }
    else {
        this._renderer.render(this._vectorLayer, this._camera, this._target, true);
    }

    this._finalRender.render(this._renderer, this._target, this._target);
    this._control.update();
};

/**
 * Display all vector layers in extent
 * 
 * @method displayVector
 * @param {Array} extents Array of extent
 */
Scene.prototype.displayVector = function(extents) {
    var self = this;
    extents.forEach(function(extent) {
        var tileCreated = self._vectorLayer.isTileCreated(extent.x, extent.y);
        if (!tileCreated) {
            self._vectorLayer.tile(extent.x, extent.y);
            self._socket.sendExtent(extent.extent);
        }
    });
};

/**
 * Update far of the camera
 * 
 * @method updateFar
 * @param {Number} far
 */
Scene.prototype.updateFar = function(far) {
    this._camera.far = far;
    this._camera.updateProjectionMatrix();
};

/**
 * Update fov of the camera
 * 
 * @method updateFov
 * @param {Number} fov
 */
Scene.prototype.updateFov = function(fov) {
    this._camera.fov = fov;
    this._camera.updateProjectionMatrix();
};

/**
 * Camera zoom with a percent of a maximum zoom
 * 
 * @method zoom
 * @param {Number} zoomPercent
 */
Scene.prototype.zoom = function(zoomPercent) {
    var zoomMin = 100;
    var zoomMax = 0;
    this._camera.position.z = (zoomMin - zoomMax) * 100 / zoomPercent;
};

/**
 * Refresh a specific vector layer
 * 
 * @method refreshLayer
 * @param {String} uuid Unique indentifier of the layer
 */
Scene.prototype.refreshLayer = function(uuid) {
    this._vectorLayer.refresh(uuid);
};

/**
 * Factory method to create vector layer
 * 
 * @method _createVectorLayer
 * @param {Array} layers All the vector layers contained
 */
Scene.prototype._createVectorLayer = function(layers) {
    // Light
    var hemiLight = new THREE.HemisphereLight(0x999999, 0xffffff, 1);

    this._vectorLayer = VectorLayer.create({
        url: "ws://" + this._url + "/data",
        x: this._originX,
        y: this._originY,
        width: this._width,
        height: this._height,
        qgisLayers: layers,
        scene: this,
        loadingListener: this._document,
    });

    this._vectorLayer.add(hemiLight);
};

/**
 * Factory method to create raster layer
 * 
 * @method _createRasterLayer
 */
Scene.prototype._createRasterLayer = function() {
    var socket = new VWebSocket({
        url: "ws://" + this._url + "/tiles_info"
    });

    var self = this;
    socket.addEventListener("messageReceived", function(obj) {
        self._terrainLayer = new TerrainLayer({
            x: self._originX,
            y: self._originY,
            width: self._width,
            height: self._height,
            ortho: obj.texture || obj.dem,
            dem: obj.dem,
            minHeight: obj.minHeight,
            maxHeight: obj.maxHeight,
            gridDensity: 64,
            tileSize: obj.pixelSize * obj.tileSize,
        });
        self._terrainLayer.fog = new THREE.Fog(self._color, self._camera.far / 2, self._camera.far);

        self._terrainRender = new THREE.RenderPass(self._terrainLayer, self._camera);
        self._vectorLayer.setDEM(self._terrainLayer);
        self.displayLayers();
    });

};

/**
 * Create a buffer to display all scene.
 * 
 * @method _createPasses
 */
Scene.prototype._createPasses = function() {
    var renderTargetParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true,
    };

    this._target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);

    this._finalRender = new THREE.ShaderPass(THREE.CopyShader);
    this._finalRender.clear = false;
    this._finalRender.renderToScreen = true;
};

/**
 * Display a projected polygon
 * 
 * @method _volumeDrapping
 * @param {Array} scene Contain 2 THREE.Scene. One with extruded polygon and the
 *                other with the bounding box of the extruded polygon
 */
Scene.prototype._volumeDrapping = function(scene) {
    var context = this._renderer.context;

    // don't update color or depth
    context.colorMask(false, false, false, false);
    context.depthMask(false);

    context.stencilFunc(context.ALWAYS, 1, 0xFF); // draw if == 1
    context.stencilOpSeparate(context.FRONT, context.KEEP, context.KEEP, context.INCR_WRAP);
    context.stencilOpSeparate(context.BACK, context.KEEP, context.KEEP, context.DECR_WRAP);
    context.clearStencil(0);

    // We can't do one pass using THREE.CullFaceBackAndFront ?!
    this._renderer.setFaceCulling(THREE.CullFaceFront);
    this._renderer.render(scene[0], this._camera, this._target, false);
    this._renderer.setFaceCulling(THREE.CullFaceBack);
    this._renderer.render(scene[0], this._camera, this._target, false);

    // re-enable update of color and depth
    context.colorMask(true, true, true, true);
    context.depthMask(true);

    // only render where stencil is not set to 0
    context.stencilFunc(context.NOTEQUAL, 0, 0xFF); // drasw if == 1
    context.stencilOp(context.KEEP, context.ZERO, context.ZERO);
    this._renderer.render(scene[1], this._camera, this._target);
};
