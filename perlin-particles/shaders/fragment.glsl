varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;
varying float vRandom;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.-gl_PointCoord.y);
    vec2 cUv = 2. * uv - 1.;
    
    float disc = length(cUv);
    vec3 rgb = vec3(0., 1. - disc, 1. - disc);
    gl_FragColor = vec4(rgb, 1.)*vRandom;

}

