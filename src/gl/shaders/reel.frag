precision highp float;

uniform sampler2D uMap;
uniform float uVel;
uniform float uTime;
uniform float uActive;   // 1 when this frame is in the gate
uniform float uHover;
uniform float uSeed;

varying vec2 vUv;
varying float vShade;

#include <noir_common>

void main() {
  float speed = abs(uVel);
  vec2 uv = vUv;

  // Gate jitter: the frame hops a little on each projected "frame" when the reel runs fast
  float tick = floor(uTime * 24.0);
  uv.y += (hash12(vec2(tick, uSeed)) - 0.5) * speed * 0.035;
  uv.x += (hash12(vec2(uSeed, tick)) - 0.5) * speed * 0.012;

  // Chromatic aberration grows with speed
  float ca = 0.0008 + speed * 0.014;
  vec2 dir = vec2(sign(uVel + 0.0001), 0.0);
  float r = texture2D(uMap, uv + dir * ca).r;
  vec4 base = texture2D(uMap, uv);
  float b = texture2D(uMap, uv - dir * ca).b;
  vec3 col = vec3(r, base.g, b);

  // Frames outside the gate go cold and dark
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 mono = vec3(lum) * vec3(1.02, 0.97, 0.88);
  float focus = clamp(uActive + uHover * 0.35, 0.0, 1.0);
  col = mix(mono * 0.5, col, focus);

  // Projector light: warm centre, falloff toward the edges of each frame
  vec2 q = vUv - 0.5;
  float vign = smoothstep(0.85, 0.2, length(q * vec2(1.0, 1.25)));
  col *= mix(0.62, 1.08, vign);
  col *= mix(0.35, 1.0, smoothstep(-0.2, 0.9, vShade));
  col *= 1.0 + (vnoise(vec2(uTime * 7.0, uSeed)) - 0.5) * 0.06 * (0.3 + speed);

  // Scratches and dust that show up when the film runs
  float scratchX = hash12(vec2(tick * 0.37, uSeed));
  float scratch = smoothstep(0.0015, 0.0, abs(vUv.x - scratchX)) * step(0.55, hash12(vec2(tick, uSeed * 3.1)));
  col += scratch * (0.05 + speed) * 0.35;
  float g = hash12(gl_FragCoord.xy + fract(uTime * 9.1) * 97.0) - 0.5;
  col += g * (0.05 + speed * 0.05);

  gl_FragColor = vec4(col, 1.0);
}
