uniform float particleLife;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D particlesTexture;
uniform vec3 color;
uniform float particleFadeOut;
uniform float particlesOpacity;
varying float rotationPass;
varying vec2 directionPass;
varying float currentTime;

void main()
{

    float depth = gl_FragCoord.z / gl_FragCoord.w;

    vec2 coord = gl_PointCoord;
    vec2 cosSinFactor = (directionPass);
    float sin_factor = sin(rotationPass);
    float cos_factor = cos(rotationPass);
    coord = vec2((coord.x - 0.5), coord.y - 0.5) * mat2(cosSinFactor.y, cosSinFactor.x, -cosSinFactor.x, cosSinFactor.y) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);

    coord += 0.5;
    float isDead = max(0., min(1., floor(particleLife - currentTime + 0.5)));

    vec2 screen = vec2(screenWidth, screenHeight);
    vec2 st = gl_FragCoord.xy / screen.xy;
    float alpha = 1. - particleFadeOut * currentTime / particleLife;
    gl_FragColor = texture2D(particlesTexture, coord) * vec4(color, alpha * particlesOpacity) * isDead;
}