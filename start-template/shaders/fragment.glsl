varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;

void main() {
    vec4 t = texture2D(vUV);
    vec3 rgb = vec3(0., 1., 1.);
    gl_FragColor = vec4(rgb, 1.);
    gl_FragColor = t;

}

