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