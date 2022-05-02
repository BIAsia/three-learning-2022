/**
 * Pixelation shader
 */

 const PostProcessing = {

	uniforms: {

		'tDiffuse': { value: null },
		'resolution': { value: null },
		'pixelSize': { value: 1 },
		'mouse': {value: 0},
		'time': { value: 0 }

	},

	vertexShader: /* glsl */`

		varying highp vec2 vUv;

			void main() {

				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform float pixelSize;
		uniform vec2 resolution;
		uniform float time;
		uniform float mouse;

		varying highp vec2 vUv;

		float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

		void main(){
			vec2 shift = vec2(.002, .002)+mouse*.005;

			// make black & white
			vec4 t = texture2D(tDiffuse,vUv);
			vec3 color = vec3((t.r + t.b + t.g)/5.);

			// rgb shift
			vec4 t1 = texture2D(tDiffuse,vUv + shift);
			vec4 t2 = texture2D(tDiffuse,vUv - shift);
			vec3 color1 = vec3((t1.r + t1.b + t1.g)/5.);
			vec3 color2 = vec3((t2.r + t2.b + t2.g)/5.);
			color = vec3(color1.r, color.g, color2.b);

			// noise
			float val = hash(vUv + time)*.2;

			vec2 dxy = pixelSize / resolution;
			vec2 coord = dxy * floor( vUv / dxy );
			
			// gl_FragColor = vec4(vec3(val), 1.);
			color += val;
			gl_FragColor = vec4(color, 1.);

		}`

};

export { PostProcessing };
