precision highp float;

varying vec2 vUv;

uniform sampler2D uText;   // wall typography, drawn on a 2D canvas
uniform vec2 uRes;         // drawing buffer size in px
uniform vec2 uMouse;       // beam centre in drawing buffer px (y up)
uniform float uTime;
uniform float uBeamR;      // beam radius in px
uniform float uReveal;     // 0 to 1 intro
uniform float uFlash;      // match strike, 0 to 1
uniform float uLit;        // 1 = fully lit (reduced motion)
uniform float uVel;        // pointer speed, 0 to 1

#include <noir_common>

void main() {
  vec2 frag = vUv * uRes;
  float aspect = uRes.x / uRes.y;

  // The wall: old plaster with damp stains and a faint brick rhythm
  vec2 wp = vUv * vec2(aspect, 1.0) * 3.0;
  float plaster = fbm(wp * 2.2) * 0.6 + fbm(wp * 11.0) * 0.4;
  float stains = smoothstep(0.48, 0.85, fbm(wp * 0.6 + 4.3));
  vec2 brick = wp * vec2(2.2, 5.0);
  brick.x += step(1.0, mod(brick.y, 2.0)) * 0.5;
  vec2 bf = abs(fract(brick) - 0.5);
  float mortar = smoothstep(0.47, 0.5, max(bf.x * 0.92, bf.y)) * 0.25 * fbm(wp * 3.0);
  vec3 albedo = mix(vec3(0.115, 0.107, 0.096), vec3(0.19, 0.178, 0.16), plaster);
  albedo *= 1.0 - stains * 0.38;
  albedo *= 1.0 - mortar;

  // Painted lettering, weathered by the plaster underneath
  vec4 paint = texture2D(uText, vUv);
  float wear = smoothstep(0.28, 0.62, fbm(wp * 6.0 + 1.7));
  float paintA = paint.a * (0.78 + 0.22 * wear);
  albedo = mix(albedo, paint.rgb, paintA);

  // The beam: a hot core, a soft halo, and a gentle tungsten flicker
  vec2 d = frag - uMouse;
  float dist = length(d) / uBeamR;
  float flick = 0.93 + 0.05 * vnoise(vec2(uTime * 9.0, 1.3)) + 0.02 * sin(uTime * 41.0);
  float core = exp(-dist * dist * 1.55);
  float halo = exp(-dist * dist * 0.32) * 0.32;
  float edge = smoothstep(1.12, 0.98, dist) * smoothstep(0.82, 0.98, dist) * 0.07;
  float beam = (core + halo + edge) * flick * uReveal;

  float ambient = 0.03 + uLit * 0.9 + uFlash * 1.35;
  float light = beam * (1.0 - uLit * 0.6) + ambient;

  vec3 tungsten = mix(vec3(1.0, 0.74, 0.44), vec3(1.0, 0.93, 0.82), core);
  vec3 col = albedo * tungsten * light * 1.55;

  // Haze in the air and a little bloom off the paint
  float haze = fbm(vUv * vec2(aspect, 1.0) * 3.0 + vec2(uTime * 0.03, uTime * 0.012));
  col += vec3(0.95, 0.62, 0.3) * core * haze * 0.07 * uReveal;
  col += paint.rgb * paint.a * core * 0.22 * uReveal;
  col += vec3(1.0, 0.85, 0.6) * uFlash * 0.12;

  // Vignette, grain, and a faint chromatic smear when the light moves fast
  float vig = smoothstep(1.25, 0.35, length((vUv - 0.5) * vec2(aspect * 0.8, 1.0)));
  col *= mix(0.55, 1.0, vig);
  col.r += uVel * core * 0.04;
  col.b -= uVel * core * 0.03;
  float g = hash12(frag + fract(uTime * 13.7) * 311.0) - 0.5;
  col += g * 0.055;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
