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
	this.host = args.host;
	this.port = args.port;
	this.path = args.path;
	this.url = "ws://"+args.host+":"+args.port+args.path;
	if (window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
	}
	if (args.onmessage) this.socket.onmessage = args.onmessage;
	if (args.onopen) this.socket.onopen = args.onopen;
	if (args.onerror) this.socket.onerror = args.onerror;
	if (args.onclose) this.socket.onclose = args.onclose;
};
var BoundingBox = function (args) {
	this.bottomLeft = args.bottomLeft || new Point();
	this.topRight = args.topRight || new Point();
};
var Point = function (args) {
	this.x = args.x || 0;
	this.y = args.y || 0;
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