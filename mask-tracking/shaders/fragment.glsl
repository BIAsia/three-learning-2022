varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;

uniform sampler2D uImg;
uniform sampler2D uMask;
uniform vec4 uResolution;

void main() {
    // keep ratio
    vec2 newUV = (vUV - vec2(.5))*uResolution.zw + vec2(.5);

    vec4 mask = texture2D(uMask, newUV);

    // add some random edge effect
    float strength = mask.a*mask.r*3.;
    strength = min(1., strength);
    vec4 t = texture2D(uImg, newUV + (1.-strength)*.1);

    vec3 rgb = vec3(0., 1., 1.);
    // gl_FragColor = vec4(rgb, 1.);
    gl_FragColor = t*strength;
    // gl_FragColor.a *= mask.a;

    // gl_FragColor = mask;
    // gl_FragColor = vec4(vUV, 0., 1.);

}

