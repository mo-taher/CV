attribute vec4 aSeed;   // x, y start, z size, w speed

uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uRes;

varying float vAlpha;

void main() {
  float t = uTime * (0.012 + aSeed.w * 0.03);
  vec2 p = aSeed.xy;
  p.x += t * 0.35 + sin(uTime * 0.31 + aSeed.y * 40.0) * 0.012;
  p.y += t + cos(uTime * 0.23 + aSeed.x * 30.0) * 0.015;
  p = fract(p);
  vec2 ndc = p * 2.0 - 1.0;
  gl_Position = vec4(ndc, 0.0, 1.0);
  gl_PointSize = (1.0 + aSeed.z * 2.6) * uPixelRatio;
  vAlpha = 0.35 + 0.65 * fract(aSeed.z * 7.13 + uTime * 0.2 * aSeed.w);
}
