varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;

uniform sampler2D uImg;
uniform sampler2D uDataTexture;
uniform vec4 uResolution;

void main() {
    // keep ratio
    vec2 newUV = (vUV - vec2(.5))*uResolution.zw + vec2(.5);

    vec4 t = texture2D(uImg, newUV);
    vec4 offset = texture2D(uDataTexture, vUV);

    vec3 rgb = vec3(0., 1., 1.);
    gl_FragColor = texture2D(uImg, newUV - .2*vec2(offset.r));

}

