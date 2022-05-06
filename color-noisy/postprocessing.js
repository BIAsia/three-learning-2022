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

		float rand(vec2 p) {
			vec2 k1 = vec2(
				23.14069263277926, // e^pi (Gelfond's constant)
				2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
			);
			return fract(
				cos(dot(p, k1)) * 12345.6789
			);
		}

		void main(){

			vec4 t = texture2D(tDiffuse,vUv);
			vec3 color = t.rgb;

			// noise using Gelfond's constant
			vec2 uvRandom = vUv;
			uvRandom.y = rand(vec2(uvRandom.y, 0.4));
			float val = rand(uvRandom)*.1;

			
			color += val;
			gl_FragColor = vec4(color, 1.);

		}`

};

export { PostProcessing };
