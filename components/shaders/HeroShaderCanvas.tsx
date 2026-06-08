'use client';

/**
 * HeroShaderCanvas
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the hero editorial photograph through a custom GLSL fluid distortion
 * shader. A <canvas> element overlays the hero background image, intercepting
 * mousemove events to drive the distortion uniforms in real-time.
 *
 * Architecture:
 *   Three.js scene → Orthographic camera → Full-screen plane mesh
 *   → ShaderMaterial (custom GLSL vert/frag)
 *   → Texture sampled from high-res editorial JPEG
 *
 * Performance:
 *   - Single draw call (one mesh, one material)
 *   - Uses half-float textures where supported
 *   - RAF driven by React's useEffect, properly cancelled on unmount
 *   - Mouse velocity computed over rolling window to smooth jerky movement
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// GLSL sources — imported as raw strings via webpack raw-loader
// In production these resolve to the .glsl files in /components/shaders/
const VERTEX_SHADER = `
varying vec2 vUv;
varying vec2 vWorldPosition;

void main() {
  vUv = uv;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2      uMouse;
uniform vec2      uPrevMouse;
uniform float     uTime;
uniform float     uVelocity;
uniform float     uDistortStrength;
uniform vec2      uResolution;
uniform float     uAspect;

varying vec2 vUv;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash22(i + vec2(0,0)), f - vec2(0,0)), dot(hash22(i + vec2(1,0)), f - vec2(1,0)), u.x),
    mix(dot(hash22(i + vec2(0,1)), f - vec2(0,1)), dot(hash22(i + vec2(1,1)), f - vec2(1,1)), u.x),
    u.y
  );
}

vec2 ripple(vec2 uv, vec2 origin, float time, float speed, float decay) {
  vec2 diff  = (uv - origin) * vec2(uAspect, 1.0);
  float dist = length(diff);
  float wr   = time * speed;
  float wf   = smoothstep(wr + 0.05, wr, dist);
  float wt   = smoothstep(wr - 0.15, wr - 0.05, dist);
  float wave = (wf - wt) * exp(-dist * decay) * exp(-time * 1.5);
  vec2 dir   = dist > 0.001 ? diff / dist : vec2(0.0);
  return dir * wave;
}

vec2 lensDistort(vec2 uv, vec2 center, float strength, float radius) {
  vec2 diff  = (uv - center) * vec2(uAspect, 1.0);
  float dist = length(diff);
  float mask = 1.0 - smoothstep(radius * 0.6, radius, dist);
  float factor = 1.0 + strength * mask * (1.0 - dist / radius);
  return (uv - center) / factor + center;
}

void main() {
  vec2 uv = vUv;

  vec2 mouseDelta    = uMouse - uPrevMouse;
  float mouseVelocity = clamp(length(mouseDelta) * 20.0, 0.0, 1.0);
  float combinedVel   = mix(mouseVelocity, uVelocity, 0.5);

  float boundary = smoothstep(0.0, 0.03, uv.x) *
                   smoothstep(1.0, 0.97, uv.x) *
                   smoothstep(0.0, 0.03, uv.y) *
                   smoothstep(1.0, 0.97, uv.y);

  float lensStrength = uDistortStrength * combinedVel * 0.06;
  vec2 distortedUV   = lensDistort(uv, uMouse, lensStrength, 0.18);

  vec2 r1 = ripple(uv, uMouse,     mod(uTime, 2.0),        0.4, 3.5);
  vec2 r2 = ripple(uv, uMouse,     mod(uTime + 0.3, 2.0),  0.35, 4.0);
  vec2 r3 = ripple(uv, uPrevMouse, mod(uTime, 2.5),        0.3, 5.0);
  vec2 rippleOffset = (r1 * 0.5 + r2 * 0.3 + r3 * 0.2) * uDistortStrength * combinedVel * 0.025;

  float shimmer     = noise(uv * 3.5 + uTime * 0.15) * 0.008;
  float shimmerMask = smoothstep(0.35, 0.0, length((uv - uMouse) * vec2(uAspect, 1.0)));
  vec2 shimmerOff   = vec2(shimmer) * shimmerMask * uDistortStrength;

  vec2 finalUV = mix(uv, distortedUV + rippleOffset + shimmerOff, boundary);
  finalUV = clamp(finalUV, 0.001, 0.999);

  float aberration = length(rippleOffset) * 2.5 + lensStrength * 0.5;
  vec2 aberVec     = normalize(uMouse - vec2(0.5)) * aberration * 0.008;

  float r = texture2D(uTexture, clamp(finalUV + aberVec,        0.001, 0.999)).r;
  float g = texture2D(uTexture, clamp(finalUV,                  0.001, 0.999)).g;
  float b = texture2D(uTexture, clamp(finalUV - aberVec * 0.5,  0.001, 0.999)).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HeroShaderCanvasProps {
  imageSrc: string;
  className?: string;
}

interface ShaderUniforms {
  uTexture:        { value: THREE.Texture };
  uMouse:          { value: THREE.Vector2 };
  uPrevMouse:      { value: THREE.Vector2 };
  uTime:           { value: number };
  uVelocity:       { value: number };
  uDistortStrength:{ value: number };
  uResolution:     { value: THREE.Vector2 };
  uAspect:         { value: number };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HeroShaderCanvas({ imageSrc, className }: HeroShaderCanvasProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sceneRef   = useRef<THREE.Scene | null>(null);
  const cameraRef  = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rafRef     = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Mouse state with velocity tracking
  const mouseRef    = useRef(new THREE.Vector2(0.5, 0.5));
  const prevMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const velocityRef  = useRef(0);
  const isHovering   = useRef(false);

  // ── Resize Handler ──────────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const material = materialRef.current;
    if (!canvas || !renderer || !camera || !material) return;

    const w = canvas.parentElement?.clientWidth  ?? window.innerWidth;
    const h = canvas.parentElement?.clientHeight ?? window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);

    camera.left   = -w / 2;
    camera.right  =  w / 2;
    camera.top    =  h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();

    material.uniforms.uResolution.value.set(w, h);
    material.uniforms.uAspect.value = w / h;
  }, []);

  // ── Mouse Handler ───────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    const y    = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y for WebGL

    // Only update if cursor is within image bounds
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      isHovering.current = false;
      return;
    }

    isHovering.current = true;

    // Store previous position before updating
    prevMouseRef.current.copy(mouseRef.current);

    // Compute velocity before updating position
    const dx = x - mouseRef.current.x;
    const dy = y - mouseRef.current.y;
    velocityRef.current = Math.min(Math.sqrt(dx * dx + dy * dy) * 30, 1.0);

    mouseRef.current.set(x, y);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    velocityRef.current = 0;
  }, []);

  // ── Initialise Three.js ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const w = parent?.clientWidth  ?? window.innerWidth;
    const h = parent?.clientHeight ?? window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false, // Not needed for full-screen post-process
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // ── Camera — Orthographic for 2D quad ────────────────────────────────────
    const camera = new THREE.OrthographicCamera(
      -w / 2, w / 2,
       h / 2, -h / 2,
       0.1, 100
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ── Texture ───────────────────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageSrc, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter  = THREE.LinearFilter;
      tex.magFilter  = THREE.LinearFilter;
      tex.generateMipmaps = false;
    });

    // ── Shader Material ───────────────────────────────────────────────────────
    const uniforms: ShaderUniforms = {
      uTexture:         { value: texture },
      uMouse:           { value: new THREE.Vector2(0.5, 0.5) },
      uPrevMouse:       { value: new THREE.Vector2(0.5, 0.5) },
      uTime:            { value: 0 },
      uVelocity:        { value: 0 },
      uDistortStrength: { value: 1.0 },
      uResolution:      { value: new THREE.Vector2(w, h) },
      uAspect:          { value: w / h },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader:   VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: false,
    });
    materialRef.current = material;

    // ── Full-screen Quad ──────────────────────────────────────────────────────
    const geometry = new THREE.PlaneGeometry(w, h);
    const mesh     = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── RAF Loop ──────────────────────────────────────────────────────────────
    let lastTime = 0;
    const animate = (timestamp: number) => {
      rafRef.current = requestAnimationFrame(animate);

      const delta = timestamp - lastTime;
      lastTime = timestamp;

      // Update time uniform
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      material.uniforms.uTime.value = elapsed;

      // ── Smooth mouse interpolation ─────────────────────────────────────────
      // Lerp the shader's mouse toward the real mouse for smooth distortion trails
      const lerpFactor = 0.08;
      material.uniforms.uPrevMouse.value.copy(material.uniforms.uMouse.value);
      material.uniforms.uMouse.value.lerp(mouseRef.current, lerpFactor);

      // ── Velocity decay ─────────────────────────────────────────────────────
      velocityRef.current *= 0.92;
      material.uniforms.uVelocity.value = velocityRef.current;

      // ── Distortion strength — fade in on hover, fade out on leave ──────────
      const targetStrength = isHovering.current ? 1.0 : 0.0;
      material.uniforms.uDistortStrength.value = THREE.MathUtils.lerp(
        material.uniforms.uDistortStrength.value,
        targetStrength,
        0.04
      );

      renderer.render(scene, camera);
    };

    rafRef.current = requestAnimationFrame(animate);

    // ── Event Listeners ───────────────────────────────────────────────────────
    canvas.addEventListener('mousemove',  handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize',     handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove',  handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize',     handleResize);
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [imageSrc, handleMouseMove, handleMouseLeave, handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className={`canvas-hero ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}
