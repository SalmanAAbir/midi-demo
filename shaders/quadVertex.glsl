varying vec2 pos;
void main()
{

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    pos = position.xy;
}