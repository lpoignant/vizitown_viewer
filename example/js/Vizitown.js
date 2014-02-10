var ControlSwitcher = function(camera, domElement) {
    this._camera = camera;
	this._control = true;
	this._domElement = domElement || document;
	
	this._trackRotateSpeed = 1.0;
	this._trackZoomSpeed = 1.0;
	this._trackPanSpeed = 1.0;
	this._trackStaticMoving = true;
	
	this._createTrackball = function () {
		var control = new THREE.TrackballControls(this._camera);
		control.rotateSpeed = this._trackRotateSpeed;
		control.zoomSpeed = this._trackZoomSpeed;
		control.panSpeed = this._trackPanSpeed;
		control.staticMoving = this._trackStaticMoving;
		control.reset();
		return control;
	};
	
	this._createFlyControl = function (pointToLook) {
		var control = new THREE.FlyControls(this._camera);
		control.movementSpeed = 50;
		control.rollSpeed = 0.125;
		control.lookVertical = true;
		//this._camera.lookAt(pointToLook);
		console.log(control);
		return control;
	};

	this.current = this._createTrackball();
	
	this._addListeners();
};

ControlSwitcher.prototype.changeControlMode = function() {
	var pLocal = new THREE.Vector3( 0, 0, -1 );
	console.log(this._camera);
	var pWorld = pLocal.applyMatrix4( this._camera.matrixWorld );
	//console.log(pWorld);
	if (this._control) {
		this.current = this._createFlyControl(pWorld);
	}
	else {
		this.current = this._createTrackball();
	}
	this._control = !this._control;
};

ControlSwitcher.prototype._addListeners = function() {
    var self = this;
	this._domElement.addEventListener('keyup', function(e) {
        var ascii_value = e.keyCode;
		console.log(ascii_value);
        if(String.fromCharCode(ascii_value) == 'K' ) {
            self.changeControlMode();
        }
    }, false);
};
/**
 * Symplify inheritance.
 * @method Function.inheritsFrom
 * @param {Object} parentClass Function to inherit from
 * @return {Function} Your Function inhereting from parentClass
 */
Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
    if ( parentClassOrObject.constructor == Function ) { 
		//Normal Inheritance
		this.prototype = new parentClassOrObject();
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	}
	else { 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	}
	return this;
};
/**
 * Basic WebSocket implementation. You should override onmessage, onerror, onclose, onopen
 * with your application logic.
 * 
 * @class VWebSocket
 * @constructor
 * @param {String} args.host String representing the host
 * @param {String} args.port String representing the port number
 * @param {String} args.path String representing the server socket url  
 * @param {Function} args.onmessage Function called when a message is received
 * @param {Function} args.onopen Function called when the socket is closed
 * @param {Function} args.onerror Function called when an error happened
 * @param {Function} args.onclose Function called when socket is closed
 **/
var VWebSocket = function (args) {
	this._host = args.host;
	this._port = args.port;
	this._path = args.path;
	this._url = "ws://"+args.host+":"+args.port+args.path;
	if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
	}
	this._socket = new WebSocket(this._url);
	if (args.onmessage) this._socket.onmessage = args.onmessage;
	if (args.onopen) this._socket.onopen = args.onopen;
	if (args.onerror) this._socket.onerror = args.onerror;
	if (args.onclose) this._socket.onclose = args.onclose;
};
var ExtentProvider = function(camera) {
	this._camera = camera;
	this._camFar = this._camera.far;
	this._camPosition = this._camera.position;
	this._camFov = this._camera.fov;

};


ExtentProvider.prototype.getCameraExtent = function() {
	console.log(this._camera);
	//console.log(this._camFar);
	//console.log(this._camPosition);
	//console.log(this._camFov);

	// Calculate the half height of the extent
	var halfHeightExtent;
	var angle = this._camFov / 2;
	halfHeightExtent = Math.sin(angle)/Math.cos(angle)*this._camFar;

	// Get the direction vector of the camera
	var pLocal = new THREE.Vector3(0, 0, -1);
	var pWorld = pLocal.applyMatrix4( this._camera.matrixWorld );
	var dir = pWorld.sub( this._camPosition).normalize();

	console.log(dir);


	var topLeft, topRight, bottomRight, bottomLeft;




};
var BoundingBox = function (args) {
	this.bottomLeft = args.bottomLeft || new Point();
	this.topRight = args.topRight || new Point();
};
var Point = function (args) {
	this.x = args.x || 0;
	this.y = args.y || 0;
};
var GridLayer = function (args) {
	this._extent = args.extent;
};
/**
 * This class represents a tiled layer
 *  
 * @class TiledLayer
 * @constructor
 * @param {int} args.x X Origin of the layer in the layer coordinate system
 * @param {int} args.y Y Origin of the layer in the layer coordinate system
 * @param {int} args.tileSizeWidth Width of a tile in the layer coordinate system
 * @param {int} args.tileSizeHeight Height of a tile in the layer coordinate system
 * @param {String} args.ortho Url to get the ortho
 * @param {String} args.dem Url to get the dem raster
 * @param {int} args.xDensity Number of on the x axis
 * @param {int} args.yDensity Number of line on the y axis
 */
var Layer = function (args) {
	this._origX = args.x || 0;
	this._origY = args.y || 0;
	
	this._tileSizeWidth = args.tileSizeWidth || 512;
	this._tileSizeHeight = args.tileSizeHeight || 512;
	
	this._width = args.width || this._tileSizeWidth * 2;
	this._height = args.height || this._tileSizeHeight * 2;
	
	this.nbTileX = this._width / this._tileSizeWidth;
	this.nbTileY = this._height / this._tileSizeHeight;
	
	this._xDensity = args.xDensity || 10;
	this._yDensity = args.yDensity || 10;
	
	this._ortho = args.ortho || false;
	this._dem = args.dem || false;
	this._scene = args.scene || false;
	
	this._minHeight = args.minHeight || 0;
	this._maxHeight = args.maxHeight || 100;
	
	this._shaderDef = args.shaderDef || BasicHeightMapMaterialDefinition;
	
	this._tiles = [];
	this._textures = {};
};

Layer.prototype._loadTexture = function (url) {
	this._textures[url] = THREE.ImageUtils.loadTexture(url);
	return this._textures[url];
};

Layer.prototype._createTile = function (x, y) {
	//Tile origin
	var dx = this._origX + this._tileSizeWidth * x;
	var dy = this._origY + this._tileSizeHeight * y;
	var geometry = new THREE.PlaneGeometry(this._tileSizeWidth, this._tileSizeWidth, this._xDensity, this._yDensity);
	
	var dem = this._textures[this._dem] || this._loadTexture(this._dem);
	var ortho = this._textures[this._ortho] || this._loadTexture(this._ortho);
	
	var uniformsTerrain = THREE.UniformsUtils.clone(this._shaderDef.uniforms);
	uniformsTerrain.dem.value = dem;
	uniformsTerrain.ortho.value = ortho;
	uniformsTerrain.minHeight.value = this._minHeight;
	uniformsTerrain.maxHeight.value = this._maxHeight;
	
	var material = new THREE.ShaderMaterial({
        uniforms: uniformsTerrain,
        vertexShader: this._shaderDef.vertexShader,
        fragmentShader: this._shaderDef.fragmentShader
    });
	
	var tile = new THREE.Mesh(geometry, material);
	tile.translateX(dx);
	tile.translateY(dy);
	
	this._tiles[this.nbTileX * x + y] = tile;
	return tile;
};

Layer.prototype.addTile = function (x, y) {
	var tile = this._tiles[this.nbTileX * x + y] || this._createTile(x,y);
	console.log(tile);
	this._scene.add(tile);
};

BasicHeightMapMaterialDefinition = {

	/* -------------------------------------------------------------------------
	//	Dynamic terrain shader
	//		- Blinn-Phong
	//		- height + normal + diffuse1 + diffuse2 + specular + detail maps
	//		- point and directional lights (use with "lights: true" material option)
	------------------------------------------------------------------------- */

	uniforms: {
		ortho: {type: "t", value: 0},
		mnt: { type: "t", value: 0},
		minHeight: { type: "f", value: 0},
		maxHeight: { type: "f", value: 255}
	},

	fragmentShader: [
		"varying float vAmount;",
		"varying vec2 vUv;",
		
		"uniform sampler2D ortho;",
		
		"void main() {",
		//"	gl_FragColor = vAmount <= 1.0 ? vec4(0,1,0,1) : vec4(1,0,0,1);",
		//"	gl_FragColor = vec4(vAmount, 0, 0, 1.0);",
		"	gl_FragColor = texture2D( ortho, vUv );",
		"}",
	].join("\n"),

	vertexShader: [
		"uniform sampler2D mnt;",
		"uniform float minHeight;",
		"uniform float maxHeight;",

		"varying float vAmount;",
		"varying vec2 vUv;",

		"void main() {",
		"	vec3 gridPoint = texture2D( mnt, uv ).xyz;",
		// assuming map is grayscale it doesn't matter if you use r, g, or b."
		"	vUv = uv;",
		"	vAmount = gridPoint.r;",
		"	vec3 newPosition = position;",
		"	newPosition.z = minHeight + ((maxHeight - minHeight) * vAmount);",
		// move the position along the normal
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",
		"}",
	].join("\n")
};
HeightMapMaterialDefinition = {

	/* -------------------------------------------------------------------------
	//	Dynamic terrain shader
	//		- Blinn-Phong
	//		- height + normal + diffuse1 + diffuse2 + specular + detail maps
	//		- point and directional lights (use with "lights: true" material option)
	------------------------------------------------------------------------- */

	uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib.fog,
		THREE.UniformsLib.lights,
		{
			"enableDiffuse1": { type: "i", value: 0 },
			"enableDiffuse2": { type: "i", value: 0 },
			"enableSpecular": { type: "i", value: 0 },
			"enableReflection": { type: "i", value: 0 },

			"tDiffuse1": { type: "t", value: 0, texture: null },
			"tDiffuse2": { type: "t", value: 1, texture: null },
			"tDetail": { type: "t", value: 2, texture: null },
			"tNormal": { type: "t", value: 3, texture: null },
			"tSpecular": { type: "t", value: 4, texture: null },
			"tDisplacement": { type: "t", value: 5, texture: null },

			"uNormalScale": { type: "f", value: 1.0 },

			"uDisplacementBias": { type: "f", value: 0.0 },
			"uDisplacementScale": { type: "f", value: 1.0 },

			"uDiffuseColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },
			"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
			"uAmbientColor": { type: "c", value: new THREE.Color( 0x050505 ) },
			"uShininess": { type: "f", value: 30 },
			"uOpacity": { type: "f", value: 1 },

			"uRepeatBase"    : { type: "v2", value: new THREE.Vector2( 1, 1 ) },
			"uRepeatOverlay" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

			"uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) }
		}
	]),

	fragmentShader: [
		"uniform vec3 uAmbientColor;",
		"uniform vec3 uDiffuseColor;",
		"uniform vec3 uSpecularColor;",
		"uniform float uShininess;",
		"uniform float uOpacity;",

		"uniform bool enableDiffuse1;",
		"uniform bool enableDiffuse2;",
		"uniform bool enableSpecular;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",
		"uniform sampler2D tDetail;",
		"uniform sampler2D tNormal;",
		"uniform sampler2D tSpecular;",
		"uniform sampler2D tDisplacement;",

		"uniform float uNormalScale;",

		"uniform vec2 uRepeatOverlay;",
		"uniform vec2 uRepeatBase;",

		"uniform vec2 uOffset;",

		"varying vec3 vTangent;",
		"varying vec3 vBinormal;",
		"varying vec3 vNormal;",
		"varying vec2 vUv;",

		"uniform vec3 ambientLightColor;",

		"#if MAX_DIR_LIGHTS > 0",
			"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
			"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
		"#endif",

		"#if MAX_POINT_LIGHTS > 0",
			"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
			"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
			"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",
		"#endif",

		"varying vec3 vViewPosition;",

		THREE.ShaderChunk.fog_pars_fragment,

		"void main() {",

			"gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",

			"vec3 specularTex = vec3( 1.0 );",

			"vec2 uvOverlay = uRepeatOverlay * vUv + uOffset;",
			"vec2 uvBase = uRepeatBase * vUv;",

			"vec3 normalTex = texture2D( tDetail, uvOverlay ).xyz * 2.0 - 1.0;",
			"normalTex.xy *= uNormalScale;",
			"normalTex = normalize( normalTex );",

			"if( enableDiffuse1 && enableDiffuse2 ) {",
				"vec4 colDiffuse1 = texture2D( tDiffuse1, uvOverlay );",
				"vec4 colDiffuse2 = texture2D( tDiffuse2, uvOverlay );",
				"#ifdef GAMMA_INPUT",
					"colDiffuse1.xyz *= colDiffuse1.xyz;",
					"colDiffuse2.xyz *= colDiffuse2.xyz;",
				"#endif",
				"gl_FragColor = gl_FragColor * mix ( colDiffuse1, colDiffuse2, 1.0 - texture2D( tDisplacement, uvBase ) );",
			"}",
			
			"else if( enableDiffuse1 ) {",
				"gl_FragColor = gl_FragColor * texture2D( tDiffuse1, uvOverlay );",
			"}",
			
			"else if( enableDiffuse2 ) {",
				"gl_FragColor = gl_FragColor * texture2D( tDiffuse2, uvOverlay );",
			"}",

			"if( enableSpecular ) {",
				"specularTex = texture2D( tSpecular, uvOverlay ).xyz;",
			"}",

			"mat3 tsb = mat3( vTangent, vBinormal, vNormal );",
			"vec3 finalNormal = tsb * normalTex;",
			"vec3 normal = normalize( finalNormal );",
			"vec3 viewPosition = normalize( vViewPosition );",

			// point lights
			"#if MAX_POINT_LIGHTS > 0",
				"vec3 pointDiffuse = vec3( 0.0 );",
				"vec3 pointSpecular = vec3( 0.0 );",

				"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

					"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
					"vec3 lVector = lPosition.xyz + vViewPosition.xyz;",

					"float lDistance = 1.0;",
					"if ( pointLightDistance[ i ] > 0.0 )",
						"lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

					"lVector = normalize( lVector );",

					"vec3 pointHalfVector = normalize( lVector + viewPosition );",
					"float pointDistance = lDistance;",

					"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
					"float pointDiffuseWeight = max( dot( normal, lVector ), 0.0 );",

					"float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",

					"pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",
					"pointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;",

				"}",
			"#endif",

			// directional lights
			"#if MAX_DIR_LIGHTS > 0",
				"vec3 dirDiffuse = vec3( 0.0 );",
				"vec3 dirSpecular = vec3( 0.0 );",

				"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

					"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",

					"vec3 dirVector = normalize( lDirection.xyz );",
					"vec3 dirHalfVector = normalize( dirVector + viewPosition );",

					"float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
					"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

					"float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );",

					"dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;",
					"dirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;",

				"}",
			"#endif",

			// all lights contribution summation
			"vec3 totalDiffuse = vec3( 0.0 );",
			"vec3 totalSpecular = vec3( 0.0 );",

			"#if MAX_DIR_LIGHTS > 0",
				"totalDiffuse += dirDiffuse;",
				"totalSpecular += dirSpecular;",
			"#endif",

			"#if MAX_POINT_LIGHTS > 0",
				"totalDiffuse += pointDiffuse;",
				"totalSpecular += pointSpecular;",
			"#endif",

			//"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;",
			"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor + totalSpecular );",

			THREE.ShaderChunk.linear_to_gamma_fragment,
			THREE.ShaderChunk.fog_fragment,

		"}"
	].join("\n"),

	vertexShader: [
		"attribute vec4 tangent;",

		"uniform vec2 uRepeatBase;",
		"uniform sampler2D tNormal;",

		"#ifdef VERTEX_TEXTURES",
			"uniform sampler2D tDisplacement;",
			"uniform float uDisplacementScale;",
			"uniform float uDisplacementBias;",
		"#endif",

		"varying vec3 vTangent;",
		"varying vec3 vBinormal;",
		"varying vec3 vNormal;",
		"varying vec2 vUv;",
		"varying vec3 vViewPosition;",

		"void main() {",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vViewPosition = -mvPosition.xyz;",
			"vNormal = normalize( normalMatrix * normal );",

			// tangent and binormal vectors
			"vTangent = normalize( normalMatrix * tangent.xyz );",
			"vBinormal = cross( vNormal, vTangent ) * tangent.w;",
			"vBinormal = normalize( vBinormal );",

			// texture coordinates
			"vUv = uv;",
			"vec2 uvBase = uv * uRepeatBase;",

			// displacement mapping, determines height and position of
			// specific element of the map.
			"#ifdef VERTEX_TEXTURES",
				"vec3 dv = texture2D( tDisplacement, uvBase ).xyz;",
				"float df = uDisplacementScale * dv.x + uDisplacementBias;",
				"vec4 displacedPosition = vec4( vNormal.xyz * df, 0.0 ) + mvPosition;",
				"gl_Position = projectionMatrix * displacedPosition;",
				//"gl_Position = projectionMatrix * vec4(1,1,1,1);",
			"#else",
				"gl_Position = projectionMatrix * mvPosition;",
			"#endif",

			"vec3 normalTex = texture2D( tNormal, uvBase ).xyz * 2.0 - 1.0;",
			"vNormal = normalMatrix * normalTex;",

		"}"
	].join("\n")
};