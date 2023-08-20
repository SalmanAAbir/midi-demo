uniform float time;
uniform float particleLife;
uniform float particlesShrink;
uniform float particlesFriction;
uniform float particleRising;
uniform float particleYOffset;
uniform float turbulenceXAmplitude;
uniform float turbulenceXFrequency;
uniform float turbulenceYAmplitude;
uniform float turbulenceYFrequency;
uniform float particleSpeed;
attribute float radius;
attribute float motX;
attribute float motY;
attribute float startTime;
attribute float randomX;
attribute float randomY;
attribute float rotation;
attribute float rotationSpeed;
varying float rotationPass;
varying vec2 directionPass;
varying vec2 pos;
varying float currentTime;

void main()
{
    currentTime = (time - startTime) * particleSpeed;
    float frc = pow((1.0 - particlesFriction), currentTime);//1.0 - particlesFriction;//pow((1.0 - particlesFriction),t);
    float x = position.x;
    float y = position.y + particleYOffset;
    float rad = radius - radius * particlesShrink * (currentTime / particleLife);
    float oldX = x;
    float oldY = y;
    for (int i = 0; i < int(currentTime); i++)
    {
        x += motX * pow(1.0 - particlesFriction, float(i));
        y += motY * pow(1.0 - particlesFriction, float(i));
        if (i == int(currentTime) - 2)
        {
            oldX = x;
            oldY = y;
        }
    }
    float rndX = randomX - 1.;
    float rndY = randomY - 1.;
    vec3 oldPosition = vec3(oldX + sin(abs(rndX) * turbulenceXFrequency * (currentTime - 1.) / 10.) * sign(rndX) * rad / 10. * turbulenceXAmplitude, oldY + sin(abs(rndY) * turbulenceYFrequency * (currentTime - 1.) / 10.) * rad / 10. * turbulenceYAmplitude + (currentTime - 1.) * (particleRising), position.z);
    vec3 newPosition = vec3(x + sin(abs(rndX) * turbulenceXFrequency * currentTime / 10.) * sign(rndX) * rad / 10. * turbulenceXAmplitude, y + sin(abs(rndY) * turbulenceYFrequency * currentTime / 10.) * rad / 10. * turbulenceYAmplitude + currentTime * (particleRising), position.z);

    if (currentTime > particleLife)
    {
        gl_PointSize = 0.;
    }
    else
    {
        gl_PointSize = rad;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    directionPass = -normalize(oldPosition.xy - newPosition.xy);
    rotationPass = rotation + rndY * currentTime * rotationSpeed;
    pos = gl_Position.xy;
}