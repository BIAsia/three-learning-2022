uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform sampler2D landscape;
varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vBary;
varying vec3 eyeVector;


vec2 hash22(vec2 p){
    p = fract(p * vec2(5.5983, 5.4427));
    p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
    return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}

void main() {
    

    // 跟随 geometry 分布
    vec3 X = dFdx(vNormal);
    vec3 Y = dFdy(vNormal);
    vec3 normal = normalize(cross(X, Y));

    // 漫反射模拟
    float diffuse = dot(normal, vec3(1.)); 

    // 纹理调整

    // 固定纹理不随模型变化，前面的 vec2 用来控制显示的范围
    vec2 uv = vec2(1.,1.)*gl_FragCoord.xy/vec2(1000.);
    // 增加随机性，使用 hash 函数
    vec2 rand = hash22(vec2(floor(diffuse*10.)));
    vec2 uvv = vec2(
        // 随机位移、随机位移的速度
        sign(rand.x - .5)*1. + (rand.x - .5)*.6,
        sign(rand.y - .5)*1. + (rand.y - .5)*.6
    );
    uv *= uvv;

    // 暗角
    float fresnel = 2. - dot(eyeVector*3., normal*2.);
    fresnel *= fresnel;

    //  变形液化效果
    // vec2 uv = vUV +.3*sin(vUV.x*50.);

    // 计算折射
    vec3 refracted = refract(eyeVector, normal, 1./3.);
    uv += .7*refracted.xy;


//  vec3 rgb = vec3(0., 1., 1.);

    vec4 t = texture2D(landscape, uv);
    // gl_FragColor = vec4(diffuse);
    t = t*clamp(fresnel*.2, 0.01, 1.2);
    gl_FragColor = vec4(t);
    
    // gl_FragColor = vec4(vec3(fresnel), 1.);


    
 
}

