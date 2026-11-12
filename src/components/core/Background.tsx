'use client';

import { useEffect, useRef } from 'react';
import type * as THREE_NS from 'three';
import { useTheme } from '../../context/ThemeContext';

type Floater = {
  mesh: THREE_NS.LineSegments;
  rotX: number;
  rotY: number;
  floatFreq: number;
  floatPhase: number;
  baseY: number;
};

/**
 * Animated WebGL background (STRUCTURAL_CORE scene).
 * Renders a fixed canvas behind the app — big screens only.
 * All rendering logic lives in useEffect so SSR is safe.
 */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDarkMode } = useTheme();

useEffect(() => {
  // Light mode / mobile / reduced-motion mein WebGL chalao hi mat
  if (!isDarkMode) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = canvasRef.current;
  if (!canvas) return;

  let disposed = false;
  let raf = 0;
  let cleanup = () => {};

  const start = async () => {
    const THREE = await import('three');
    if (disposed) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x010203, 6, 22);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    onResize();
    window.addEventListener('resize', onResize);

    // ─── Terrain Shader ────────────────────────────────────────
    const VERTEX_SHADER = `
      varying vec2 vUv;
      varying float vZ;
      uniform float uTime;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float wave = sin(pos.x * 0.5 + uTime * 0.4)
                   * cos(pos.y * 0.5 + uTime * 0.3);
        wave += sin(pos.x * 1.2 - uTime * 0.2) * 0.2;

        float dist = distance(uv, vec2(0.5));
        pos.z += wave * (1.0 + dist * 2.0);

        vZ = pos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const FRAGMENT_SHADER = `
      varying vec2 vUv;
      varying float vZ;

      void main() {
        float grid = max(
          step(0.96, fract(vUv.x * 50.0)),
          step(0.96, fract(vUv.y * 30.0))
        );

        vec3 darkBase  = vec3(0.02, 0.08, 0.12);
        vec3 tealGlow  = vec3(0.20, 0.80, 0.75);

        vec3 color = mix(darkBase, tealGlow, clamp(vZ + 0.5, 0.0, 1.0));
        gl_FragColor = vec4(color, grid * 0.85);
      }
    `;

    const terrainUniforms = { uTime: { value: 0 } };

    const terrainMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 28, 60, 36), // pehle 120x72 tha
      new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: terrainUniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    terrainMesh.rotation.x = -Math.PI / 2.5;
    terrainMesh.position.set(0, -2, -3);
    scene.add(terrainMesh);

    // ─── Floating Geometries ───────────────────────────────────
    const geoTetra = new THREE.TetrahedronGeometry(1, 0);
    const geoIco = new THREE.IcosahedronGeometry(1, 0);

    const floaters: Floater[] = [];

    for (let i = 0; i < 15; i++) {
      const sourceGeo = Math.random() > 0.5 ? geoTetra : geoIco;
      const edges = new THREE.EdgesGeometry(sourceGeo);
      const mat = new THREE.LineBasicMaterial({ color: 0x00aaaa });
      const mesh = new THREE.LineSegments(edges, mat);

      mesh.scale.setScalar(0.15 + Math.random() * 0.4);
      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6
      );

      scene.add(mesh);

      floaters.push({
        mesh,
        rotX: (Math.random() - 0.5) * 1.2,
        rotY: (Math.random() - 0.5) * 1.2,
        floatFreq: 0.2 + Math.random() * 0.4,
        floatPhase: i,
        baseY: mesh.position.y,
      });
    }

    // ─── Render Loop (30fps cap + tab hidden pe pause) ─────────
    const clock = new THREE.Clock();
    let last = 0;

    function animate(now: number) {
      raf = requestAnimationFrame(animate);
      if (document.hidden || now - last < 33) return;
      last = now;

      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      terrainUniforms.uTime.value = elapsed;

      for (const f of floaters) {
        f.mesh.rotation.x += f.rotX * delta;
        f.mesh.rotation.y += f.rotY * delta;
        f.mesh.position.y =
          f.baseY + Math.sin(elapsed * f.floatFreq + f.floatPhase) * 0.3;
      }

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(animate);

    // ─── Cleanup ───────────────────────────────────────────────
    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      geoTetra.dispose();
      geoIco.dispose();
      for (const f of floaters) {
        f.mesh.geometry.dispose();
        (f.mesh.material as THREE_NS.Material).dispose();
      }
      terrainMesh.geometry.dispose();
      (terrainMesh.material as THREE_NS.Material).dispose();
      renderer.dispose();
    };
  };

  // Load path se bahar: browser idle hone par hi start
  const idle = typeof window.requestIdleCallback === 'function';
  const handle: number =
    idle
      ? window.requestIdleCallback(() => void start(), { timeout: 400 })
      : window.setTimeout(() => void start(), 300);

  return () => {
    disposed = true;
    if (idle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
    cleanup();
  };
}, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-500 lg:block ${
        isDarkMode ? 'lg:opacity-100' : 'lg:opacity-0'
      } opacity-0`}
    />
  );
}
