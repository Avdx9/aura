// ─── Hero Fluid Distortion — Fragment Shader ────────────────────────────────
//
// Creates a subtle liquid ripple distortion effect on the hero image.
// The distortion radiates outward from the mouse position with:
//   1. A primary sharp lens distortion under the cursor
//   2. A trailing ripple wave that decays over time
//   3. Slight chromatic aberration for editorial depth
//
// Strictly confined to image boundaries (no distortion outside image bounds).

precision highp float;

// ─── Uniforms ─────────────────────────────────────────────────────────────────
uniform sampler2D uTexture;         // Hero editorial photograph
uniform vec2      uMouse;           // Normalised mouse position [0.0–1.0]
uniform vec2      uPrevMouse;       // Previous frame mouse position
uniform float     uTime;            // Elapsed time (seconds)
uniform float     uVelocity;        // Mouse velocity magnitude [0.0–1.0]
uniform float     uDistortStrength; // Overall distortion intensity [0.0–1.0]
uniform vec2      uResolution;      // Canvas dimensions (px)
uniform float     uAspect;          // Viewport aspect ratio

// ─── Varyings ─────────────────────────────────────────────────────────────────
varying vec2 vUv;

// ─── Noise Utilities ──────────────────────────────────────────────────────────
// Fast pseudo-random for organic ripple variation
vec2 hash22(vec2 p) {
  p = vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  );
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Value noise for gentle surface shimmer
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f); // Smooth Hermite interpolation
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// ─── Ripple Function ──────────────────────────────────────────────────────────
// Returns a displacement vector for a single ripple originating at `origin`.
// `speed` controls wave propagation, `decay` controls fade.
vec2 ripple(vec2 uv, vec2 origin, float time, float speed, float decay) {
  // Correct for aspect ratio so circle stays circular
  vec2 diff = (uv - origin) * vec2(uAspect, 1.0);
  float dist = length(diff);

  // Wave envelope: expanding ring that fades with time and distance
  float waveRadius = time * speed;
  float waveFront  = smoothstep(waveRadius + 0.05, waveRadius,       dist);
  float waveTail   = smoothstep(waveRadius - 0.15, waveRadius - 0.05, dist);
  float wave       = (waveFront - waveTail) * exp(-dist * decay) * exp(-time * 1.5);

  // Displacement direction radiates from origin
  vec2 dir = (dist > 0.001) ? (diff / dist) : vec2(0.0);
  return dir * wave;
}

// ─── Lens Distortion ──────────────────────────────────────────────────────────
// Creates the primary under-cursor bulge/pinch
vec2 lensDistort(vec2 uv, vec2 center, float strength, float radius) {
  vec2 diff  = (uv - center) * vec2(uAspect, 1.0);
  float dist = length(diff);
  float mask = 1.0 - smoothstep(radius * 0.6, radius, dist);

  // Barrel distortion for liquid bulge
  float factor = 1.0 + strength * mask * (1.0 - dist / radius);
  vec2 dir     = (dist > 0.001) ? (diff / dist) : vec2(0.0);

  return (uv - center) / factor + center;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
void main() {
  vec2 uv = vUv;

  // Mouse delta and velocity for directional distortion
  vec2  mouseDelta    = uMouse - uPrevMouse;
  float mouseVelocity = clamp(length(mouseDelta) * 20.0, 0.0, 1.0);
  float combinedVel   = mix(mouseVelocity, uVelocity, 0.5);

  // ── Boundary Mask ────────────────────────────────────────────────────────
  // Confine all distortion strictly within image bounds [0.0, 1.0]
  float boundary = smoothstep(0.0, 0.03, uv.x) *
                   smoothstep(1.0, 0.97, uv.x) *
                   smoothstep(0.0, 0.03, uv.y) *
                   smoothstep(1.0, 0.97, uv.y);

  // ── Primary Lens Distortion ───────────────────────────────────────────────
  // Subtle bulge directly under cursor, scales with velocity
  float lensStrength = uDistortStrength * combinedVel * 0.06;
  vec2 distortedUV   = lensDistort(uv, uMouse, lensStrength, 0.18);

  // ── Trailing Ripple Wave ───────────────────────────────────────────────────
  // Three overlapping ripples at slightly different phases for organic look
  vec2 ripple1 = ripple(uv, uMouse, mod(uTime, 2.0),        0.4, 3.5);
  vec2 ripple2 = ripple(uv, uMouse, mod(uTime + 0.3, 2.0),  0.35, 4.0);
  vec2 ripple3 = ripple(uv, uPrevMouse, mod(uTime, 2.5),    0.3, 5.0);

  // Combine ripples — scale by overall velocity and strength
  vec2 rippleOffset = (ripple1 * 0.5 + ripple2 * 0.3 + ripple3 * 0.2)
                      * uDistortStrength
                      * combinedVel
                      * 0.025;

  // ── Organic Shimmer ───────────────────────────────────────────────────────
  // Very subtle surface texture animation — water-like sheen
  float shimmer     = noise(uv * 3.5 + uTime * 0.15) * 0.008;
  float shimmerMask = smoothstep(0.35, 0.0, length((uv - uMouse) * vec2(uAspect, 1.0)));
  vec2 shimmerOffset = vec2(shimmer) * shimmerMask * uDistortStrength;

  // ── Compose Final UV ──────────────────────────────────────────────────────
  vec2 finalUV = mix(
    uv,
    distortedUV + rippleOffset + shimmerOffset,
    boundary
  );

  // Clamp to prevent texture bleeding at edges
  finalUV = clamp(finalUV, 0.001, 0.999);

  // ── Chromatic Aberration ──────────────────────────────────────────────────
  // Split RGB channels very slightly for editorial depth
  float aberration  = length(rippleOffset) * 2.5 + lensStrength * 0.5;
  vec2  aberVec     = normalize(uMouse - vec2(0.5)) * aberration * 0.008;

  float r = texture2D(uTexture, clamp(finalUV + aberVec,       0.001, 0.999)).r;
  float g = texture2D(uTexture, clamp(finalUV,                 0.001, 0.999)).g;
  float b = texture2D(uTexture, clamp(finalUV - aberVec * 0.5, 0.001, 0.999)).b;
  float a = texture2D(uTexture, finalUV).a;

  gl_FragColor = vec4(r, g, b, a);
}
