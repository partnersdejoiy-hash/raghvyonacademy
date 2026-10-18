// The (a+b)³ cube: eight glossy blocks, the academy's motif in 3D.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Colour by how many sides are "b": a³, a²b, ab², b³.
export const TERM_COLOURS = ['#d8ff3e', '#8fd3ff', '#ffb3c7', '#ffc39a'];

export type CubeOptions = { a: number; b: number; explode: number; drag?: boolean; particles?: boolean };
export type CubeHandle = { setSizes(a: number, b: number): void; setExplode(v: number): void; dispose(): void };

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function mountCube(canvas: HTMLCanvasElement, opts: CubeOptions): CubeHandle {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#d8ff3e', 1.2);
  rim.position.set(-6, -3, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight('#8fd3ff', 0.6);
  fill.position.set(-4, 5, 2);
  scene.add(fill);

  const group = new THREE.Group();
  group.rotation.set(0.5, -0.65, 0);
  scene.add(group);

  const materials = TERM_COLOURS.map(
    (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.1 }),
  );

  // A faint outline of the full cube, so the blocks read as pieces of one whole even when apart.
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 4.2, 4.2)),
    new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.12 }),
  );
  group.add(frame);

  // Drifting specks around the cube for depth.
  let points: THREE.Points | undefined;
  if (opts.particles && !reduce) {
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 5 + Math.random() * 6;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t) * 0.6, r * Math.cos(p)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    points = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 0.045, transparent: true, opacity: 0.55, sizeAttenuation: true }));
    scene.add(points);
  }

  const blocks: { mesh: THREE.Mesh; dir: THREE.Vector3; home: THREE.Vector3 }[] = [];
  let a = opts.a;
  let b = opts.b;
  let explode = opts.explode;
  let explodeTarget = opts.explode;

  function build() {
    for (const { mesh } of blocks) {
      group.remove(mesh);
      mesh.geometry.dispose();
    }
    blocks.length = 0;
    const scale = 4.2 / (a + b);
    const gap = 0.07;
    for (let i = 0; i < 8; i++) {
      const bits = [i & 1, (i >> 1) & 1, (i >> 2) & 1];
      const size = bits.map((k) => (k ? b : a) * scale - gap);
      const pos = bits.map((k) => (k ? a * scale + (b * scale) / 2 : (a * scale) / 2) - ((a + b) * scale) / 2);
      const geo = new RoundedBoxGeometry(size[0], size[1], size[2], 4, Math.min(0.14, Math.min(...size) / 4));
      const mesh = new THREE.Mesh(geo, materials[bits[0] + bits[1] + bits[2]]);
      const home = new THREE.Vector3(pos[0], pos[1], pos[2]);
      const dir = new THREE.Vector3(...bits.map((k) => (k ? 1 : -1))).normalize();
      blocks.push({ mesh, dir, home });
      group.add(mesh);
    }
    place();
  }

  function place() {
    for (const { mesh, dir, home } of blocks) mesh.position.copy(home).addScaledVector(dir, explode);
    frame.material.opacity = 0.04 + Math.min(explode, 2) * 0.06;
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 17 : 13;
    camera.updateProjectionMatrix();
  }

  const target = { x: 0.5, y: -0.65 };
  let dragging = false;
  let last = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    if (opts.drag) {
      if (!dragging) return;
      target.y += (e.clientX - last.x) * 0.01;
      target.x += (e.clientY - last.y) * 0.01;
      last = { x: e.clientX, y: e.clientY };
    } else {
      target.y = -0.65 + (e.clientX / innerWidth - 0.5) * 0.5;
      target.x = 0.5 + (e.clientY / innerHeight - 0.5) * 0.3;
    }
  };
  const onDown = (e: PointerEvent) => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => (dragging = false);
  window.addEventListener('pointermove', onMove);
  if (opts.drag) {
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
  }

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let frameId = 0;
  const clock = new THREE.Clock();
  function tick() {
    frameId = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    if (!reduce && !dragging) target.y += opts.drag ? 0.002 : 0.0015;
    group.rotation.x += (target.x - group.rotation.x) * 0.06;
    group.rotation.y += (target.y - group.rotation.y) * 0.06;
    if (!reduce) group.position.y = Math.sin(t * 0.8) * 0.1;
    if (points) points.rotation.y = t * 0.02;
    explode += (explodeTarget - explode) * (reduce ? 1 : 0.06);
    place();
    renderer.render(scene, camera);
  }

  resize();
  build();
  tick();

  return {
    setSizes(na, nb) {
      a = na;
      b = nb;
      build();
    },
    setExplode(v) {
      explodeTarget = v;
    },
    dispose() {
      cancelAnimationFrame(frameId);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      blocks.forEach(({ mesh }) => mesh.geometry.dispose());
      materials.forEach((m) => m.dispose());
      frame.geometry.dispose();
      points?.geometry.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
