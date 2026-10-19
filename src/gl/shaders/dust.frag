precision highp float;

uniform vec2 uMouse;
uniform float uBeamR;
uniform float uReveal;
uniform float uFlash;

varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float soft = smoothstep(0.5, 0.0, r);
  float dist = length(gl_FragCoord.xy - uMouse) / uBeamR;
  float lit = exp(-dist * dist * 1.1) * uReveal + uFlash * 0.4;
  float a = soft * vAlpha * lit * 0.85;
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.62) * a, a);
}
