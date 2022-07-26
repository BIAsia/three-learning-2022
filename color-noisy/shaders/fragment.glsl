varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;

uniform float uTime;
uniform float uSpeed;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float lines(vec2 uv, float offset){
    // use sin func to generate lines texture
    // return abs(sin(uv.x*10.));

    // create middle
    return smoothstep(
        0., 0.5 + offset*.5,
        abs(.5*(sin(uv.x*30.) + offset*2.))
    );
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
}

void main() {
    // colors: mild blue
    // vec3 color3 = vec3(206./255., 227./255., 239./255.);
    // vec3 color2 = vec3(238./255., 227./255., 187./255.);
    // vec3 color1 = vec3(224./255., 245./255., 238./255.);

    // colors: new palettte
    // vec3 color3 = vec3(162./255., 189./255., 193./255.);
    // vec3 color1 = vec3(155./255., 206./255., 203./255.);
    // vec3 color2 = vec3(206./255., 221./255., 220./255.);

    

    // colors: from pane
    vec3 color1 = vec3(uColorA/255.);
    vec3 color2 = vec3(uColorB/255.);
    vec3 color3 = vec3(uColorC/255.);
    // vec3 color3 = vec3(162./255., 189./255., 193./255.);
    // vec3 color1 = vec3(155./255., 206./255., 203./255.);
    // vec3 color2 = vec3(206./255., 221./255., 220./255.);

    // noise changed with time
    float n = noise(vPosition + uTime);

    // make color change through time
    color2 += vec3(cos(uTime*2)*0.01);

    
    // make line shape texture
    vec2 baseUV = rotate2D(n)*vPosition.xy*.1*(noise(vPosition)+uSpeed*0.5);
    // baseUV = (vPosition.xx+uTime*0.1)*.15*(noise(vPosition)+uSpeed*0.1);
    float basePattern = lines(baseUV, .5);
    float secondPattern = lines(baseUV, .1);

    // mix colors to pattern
    vec3 baseColor = mix(color2, color1, basePattern);
    vec3 secondBaseColor = mix(baseColor, color3, secondPattern);


    vec3 rgb = vec3(secondBaseColor);
    gl_FragColor = vec4(rgb, 1.);

}

