/* global FPSControl, Camera, SceneSocket */
"use strict";

/**
 * @class Scene
 * @constructor
 */
var Scene = function(args) {
    args = args || {};
    var url = args.url;
    this.extent = args.extent;
    var x = this.extent.minX + ((this.extent.maxX - this.extent.minX) / 2);
    var y = this.extent.minY + ((this.extent.maxY - this.extent.minY) / 2);

    this._window = args.window || window;
    this._document = args.document || document;

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._scene = new THREE.Scene();

    this._camera = new Camera({
        window: this._window,
        renderer: this._renderer,
        x: x,
        y: y,
    });

    this._control = new FPSControl(this._camera, this._document);    

    this._socket = new SceneSocket({
        url: "ws://" + url,
        scene: this,
    });

    this._document.getElementById(args.domId)
            .appendChild(this._renderer.domElement);
};

/**
 * @method render
 */
Scene.prototype.render = function() {
    if (!this._layer) {
        return;
    }
    this._window.requestAnimationFrame(this.render.bind(this));
    this._renderer.render(this._scene, this._camera);
    this._control.update();
};

/**
 * @method display
 * @param extents
 */
Scene.prototype.display = function(extents) {
    if (!this._layer) {
        return;
    }
    var self = this;
    extents.forEach(function(extent) {
        if (!self._layer.isTileCreated(self.extent.x, self.extent.y)) {
            self._layer.tile(self.extent.x, self.extent.y);
            self._socket.sendExtent(extent.extent);
        }
    });
};

Scene.prototype.add = function(mesh) {
    if ((!this._layer)) {
        return;
    }
    this._layer.addToTile(mesh);
};
