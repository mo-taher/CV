uniform float uRadius;
uniform float uVel;     // signed scroll speed, roughly -1 to 1
uniform float uTime;

varying vec2 vUv;
varying float vShade;

void main() {
  vUv = uv;
  vec3 p = position;

  // Wrap the flat frame around the reel so the strip reads as one curved surface
  float a = p.x / uRadius;
  vec3 bent = vec3(sin(a) * uRadius, p.y, (cos(a) - 1.0) * uRadius);

  // Speed makes the strip lean and ripple like film running through a gate
  float v = uVel;
  bent.x += p.y * v * 0.16;
  bent.z += sin(p.x * 2.4 + uTime * 6.0) * abs(v) * 0.06;
  bent.y += sin(p.x * 1.3 - uTime * 3.0) * v * 0.05;

  vec4 world = modelMatrix * vec4(bent, 1.0);
  // Frames turned away from the camera fall into shadow
  vShade = clamp(world.z / uRadius, -1.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * world;
}
