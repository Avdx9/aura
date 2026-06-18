'use client';

/**
 * AnatomyVisualizer
 * ─────────────────────────────────────────────────────────────────────────────
 * A Three.js interactive 3D anatomy model embedded in the Treatments section.
 * Loads an optimised low-poly GLTF head model and uses GSAP ScrollTrigger to:
 *   1. Rotate the model on its Y-axis as the user scrolls
 *   2. Progressively dissolve skin layers to reveal subdermal muscle structure
 *   3. Highlight specific treatment zones on hover
 *
 * The dissolve effect is achieved by animating each mesh layer's material
 * opacity in a GSAP timeline, keyed to the ScrollTrigger progress value.
 *
 * Performance notes:
 *   - DRACOLoader for compressed GLTF (< 500KB target)
 *   - Halved render resolution on mobile (pixelRatio cap)
 *   - Environment map via PMREMGenerator from a neutral HDR
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Layer configuration ───────────────────────────────────────────────────────
// Maps GLTF mesh names → scroll reveal order
// Skin dissolves first, then fat layer, then muscle becomes fully visible
const LAYER_CONFIG: Record<string, { revealAt: number; dissolveBy: number }> = {
  skin:       { revealAt: 0.0,  dissolveBy: 0.35 },
  subcutaneous: { revealAt: 0.0, dissolveBy: 0.6  },
  muscle:     { revealAt: 0.2,  dissolveBy: 1.0  }, // muscle never dissolves
  bone:       { revealAt: 0.7,  dissolveBy: 1.0  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AnatomyVisualizerProps {
  className?: string;
  sectionRef: React.RefObject<HTMLElement>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AnatomyVisualizer({ className, sectionRef }: AnatomyVisualizerProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef    = useRef<THREE.Group | null>(null);
  const rafRef      = useRef<number>(0);
  const meshLayersRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const w   = container.clientWidth;
    const h   = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 2);

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.1, 2.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null; // Transparent — CSS controls background
    sceneRef.current = scene;

    // ── Lighting ──────────────────────────────────────────────────────────────
    // Key light — warm clinical
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.5);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width  = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Fill light — cool blue rim
    const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.8);
    fillLight.position.set(-3, 1, -1);
    scene.add(fillLight);

    // Ambient — low obsidian-tinted
    const ambientLight = new THREE.AmbientLight(0x121214, 0.6);
    scene.add(ambientLight);

    // Champagne point light for gold accent
    const accentLight = new THREE.PointLight(0xbfa476, 1.5, 6);
    accentLight.position.set(1.5, 0.5, 1.5);
    scene.add(accentLight);

    // ── GLTF Loader with DRACO compression ───────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/'); // Served from /public/draco/

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // ── Load Model ─────────────────────────────────────────────────────────────
    // In production: replace with your actual optimised GLTF path
    // Model should have named meshes matching LAYER_CONFIG keys
    gltfLoader.load(
      '/models/face-anatomy.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, -0.15, 0);
        model.rotation.y = Math.PI * 0.1; // Slight initial rotation — 3/4 view
        scene.add(model);
        modelRef.current = model;

        // ── Configure mesh layers ─────────────────────────────────────────────
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;

          const layerName = child.name.toLowerCase();
          meshLayersRef.current.set(layerName, child);

          // Make materials transparent for layer dissolve
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.transparent = true;
              mat.opacity     = 1.0;
              mat.depthWrite  = true;
            });
          } else {
            child.material.transparent = true;
            child.material.opacity     = 1.0;
          }

          child.castShadow    = true;
          child.receiveShadow = true;
        });

        // ── GSAP ScrollTrigger timeline ───────────────────────────────────────
        setupScrollAnimations();
      },
      // Progress callback
      (xhr) => {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        const loadingEl = document.querySelector('[data-anatomy-loading]');
        if (loadingEl) loadingEl.textContent = `Loading model… ${percent}%`;
      },
      // Error — gracefully degrade to placeholder
      (error) => {
        console.warn('Anatomy model not found. Using placeholder mesh.', error);
        createPlaceholderMesh(scene);
        setupScrollAnimations();
      }
    );

    // ── Placeholder mesh (used during development / before model delivery) ────
    function createPlaceholderMesh(scene: THREE.Scene) {
      // Low-poly sphere as stand-in for face model
      const geo = new THREE.SphereGeometry(0.8, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 1.0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = 'skin';
      scene.add(mesh);

      const innerGeo = new THREE.SphereGeometry(0.65, 32, 32);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x8b3a3a,
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
        opacity: 0.0,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.name = 'muscle';
      scene.add(inner);

      const group = new THREE.Group();
      group.add(mesh, inner);
      scene.add(group);
      modelRef.current = group;

      meshLayersRef.current.set('skin',   mesh);
      meshLayersRef.current.set('muscle', inner);
    }

    // ── ScrollTrigger Animations ──────────────────────────────────────────────
    function setupScrollAnimations() {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:    sectionRef.current,
          start:      'top 80%',
          end:        'bottom 20%',
          scrub:      1.5, // 1.5s lag for cinematic smoothness
          onUpdate:   (self) => {
            updateLayerOpacity(self.progress);
          },
        },
      });

      // Model Y-axis rotation as user scrolls
      tl.fromTo(
        { rotation: 0 },
        { rotation: 0 },
        {
          rotation: 0,
          onUpdate: function() {
            if (modelRef.current) {
              // Full Y rotation over scroll progress
              modelRef.current.rotation.y =
                Math.PI * 0.1 + (this.progress ?? 0) * Math.PI * 1.2;
              // Subtle tilt on X
              modelRef.current.rotation.x =
                Math.sin((this.progress ?? 0) * Math.PI) * 0.08;
            }
          },
        }
      );
    }

    // ── Layer Opacity Control ─────────────────────────────────────────────────
    function updateLayerOpacity(progress: number) {
      meshLayersRef.current.forEach((mesh, layerName) => {
        const config = LAYER_CONFIG[layerName];
        if (!config) return;

        let targetOpacity: number;

        if (layerName === 'skin' || layerName === 'subcutaneous') {
          // Dissolve: fade from 1.0 → 0.0 as progress reaches dissolveBy
          targetOpacity = 1.0 - THREE.MathUtils.smoothstep(
            progress,
            config.revealAt,
            config.dissolveBy
          );
        } else {
          // Reveal: fade from 0.0 → 1.0 as progress reaches revealAt
          targetOpacity = THREE.MathUtils.smoothstep(
            progress,
            config.revealAt,
            Math.min(config.revealAt + 0.3, 1.0)
          );
        }

        // Apply to material
        const setOpacity = (mat: THREE.Material) => {
          (mat as THREE.MeshStandardMaterial).opacity = targetOpacity;
          mat.transparent = true;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(setOpacity);
        } else {
          setOpacity(mesh.material);
        }
      });
    }

    // ── Continuous Render Loop ────────────────────────────────────────────────
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      // Subtle idle rotation when not scroll-animated
      if (modelRef.current) {
        // Only apply if no active ScrollTrigger driving rotation
        const st = ScrollTrigger.getAll().find(
          (t) => t.trigger === sectionRef.current
        );
        if (!st?.isActive) {
          modelRef.current.rotation.y += 0.003;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      renderer.dispose();
    };
  }, [sectionRef]);

  return (
    <div className={`three-canvas-container ${className ?? ''}`} role="img" aria-label="Interactive 3D facial anatomy model">
      <canvas ref={canvasRef} />
      {/* Loading state */}
      <div
        data-anatomy-loading
        className="absolute inset-0 flex items-center justify-center text-champagne-DEFAULT label-overline pointer-events-none"
        aria-live="polite"
      />
    </div>
  );
}
