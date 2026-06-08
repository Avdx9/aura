// ─── Hero Fluid Distortion — Vertex Shader ───────────────────────────────────
// Passes UV coordinates and world position to the fragment shader.
// Standard passthrough — all distortion logic lives in the fragment shader.

varying vec2 vUv;
varying vec2 vWorldPosition;

void main() {
  vUv = uv;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xy;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
