#define M_PI 3.1415926535897932384626433832795
#define M_TWO_PI (2.0 * M_PI)

uniform float screenWidth;
uniform float screenHeight;
uniform float time;
uniform float yOffset;
uniform float resolution;
uniform float reflection;
uniform float amplitude;
uniform float noiseA;
uniform float noiseB;
uniform float noiseC;
uniform float noiseD;
uniform float opacity;
uniform vec3 color;
varying vec2 pos;

float rand(vec2 n)
{
    return fract(sin(dot(n, vec2(12.1414, 12.9898))) * 83758.5453);
}

float noise(vec2 n)
{
    const vec2 d = vec2(0.0, 1.);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

vec3 ramp(float t)
{
    return t <= .5 ? vec3(1. - t * 1.4, .2, 1.05) / t : vec3(.3 * (1. - t) * 2., .2, 1.05) / t;
}
float fire(vec2 n)
{
    return noise(n) + noise(n * noiseA) * noiseB + noise(n * noiseC) * noiseD;

}

float shade(vec2 uv, float t)
{
    uv.x += uv.y < .5 ? 23.0 + t * .035 : -11.0 + t * .03;
    uv.y = abs(uv.y - .5);
    uv.x *= 35.0;

    float q = fire(uv - t * .013) / 50.0;
    vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y * 100.), fire(uv + q - t)) * 50. / amplitude;

    return pow((r.y + r.y) * max(.0, uv.y) + .1, 2.0);
}

vec3 getColor(float grad)
{

    float m2 = 1.15;
    grad = sqrt(grad);
    vec3 color = vec3(1.0 / (pow(vec3(0.5, 0.0, .1), vec3(2.0))));
    vec3 color2 = color;
    color = ramp(grad);
    color /= m2 + (max(vec3(0), color));

    return color;

}

void main()
{

    vec2 uv = (pos.xy + vec2(sin(time * 0.1), yOffset)) / vec2(screenWidth, screenHeight);
    uv.x *= resolution;
    float ff = 1.0 - uv.y;
    vec2 uv2 = uv;
    uv2.y = 1.0 - uv2.y;

    vec3 c1 = getColor(shade(uv, time)) * ff;
    vec3 c2 = getColor(shade(uv2, time)) * (1.0 - ff);
    float alpha = gl_FragCoord.y < screenHeight - yOffset ? dot(c2, vec3(reflection)) : dot(c1 + c2, vec3(0.5));

    gl_FragColor = vec4((c1.x + c2.x) * color, alpha * opacity);
}