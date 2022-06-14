varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;
varying float vRandom;
varying vec3 vRGB;
varying float vScale;
varying vec3 vTrans;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.-gl_PointCoord.y);
    vec2 cUv = 2. * uv - 1.;
    
    float disc = length(cUv);
    float scale = vScale;

    vec3 hsv = rgb2hsv(vRGB);
    float extra = (vTrans.x*vPosition.x + vTrans.y*vPosition.y + vTrans.z*vPosition.z)*scale;
    hsv.x += extra*.2;
    vec3 tempRGB = hsv2rgb(hsv);
    // vec3 rgb = vec3(vRGB.r/255., vRGB.g/255. - disc - (vPosition.x)*.2 + vRandom*.1, vRGB.b/255. - disc + vRandom*.2);
    vec3 rgb = vec3(tempRGB.r/255. - disc + vRandom*.2, tempRGB.g/255. - disc + vRandom*.1, tempRGB.b/255. - disc + vRandom*.2);
    float alpha = 1.-disc;

    gl_FragColor = vec4(rgb, alpha)*(1.-vRandom);

}

