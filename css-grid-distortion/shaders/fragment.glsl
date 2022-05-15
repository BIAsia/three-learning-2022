varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;

uniform sampler2D uImg;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;

float hash(float n) { return fract(sin(n) * 1e4); }

void main() {
    vec3 rgb = vec3(0., 1., 1.);

    

    
    vec2 newUV = vUV;

    // keep ratio & centered
    newUV.x -= .5;
    newUV.x *= .25*uResolution.x / uResolution.y;
    newUV.x += .5;

    // make steps
    float steps = ceil(newUV.y*5.)/5.;
    
    

    // make distortion
    float sides = 2.*length(vUV.x - .5);
    float masking = step(.9, sides);
    float shade = 10.*(sides - .9)*masking;
    shade = pow(shade, 5.);

    vec2 scale = vec2(1. + .1*shade, 1.+ .5*shade);
    vec2 scaleCenter = vec2(.5, steps - .1);

    newUV = (newUV - scaleCenter)*(scale - .4*(1.-uProgress)) + scaleCenter;


    // scroll through time & progress
    float scroll = (uTime * .00004)*(.5 + hash(steps));
    newUV.x = mod(newUV.x - scroll + uProgress + hash(steps), 1.);

    // repeat
    newUV = fract(newUV*5.);
    

    vec4 map = texture2D(uImg, newUV);

    gl_FragColor = map;
    // gl_FragColor = vec4(vec3(shade), 1.);

}

