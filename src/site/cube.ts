// The (a+b)³ cube: eight blocks, the academy's one motif in 3D.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Colour by how many sides are "b": a³, a²b, ab², b³.
export const TERM_COLOURS = ['#d8ff3e', '#c3cbe5', '#efd3da', '#f9cdbd'];

export type CubeOptions = { a: number; b: number; explode: number; drag?: boolean };

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function mountCube(canvas: HTMLCanvasElement, opts: CubeOptions) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  scene.add(new THREE.HemisphereLight('#ffffff', '#2a2f44', 1.6));
  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#d8ff3e', 0.9);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  const group = new THREE.Group();
  group.rotation.set(0.55, -0.7, 0);
  scene.add(group);

  const materials = TERM_COLOURS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.05 }));
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
    const gap = 0.06;
    for (let i = 0; i < 8; i++) {
      const bits = [i & 1, (i >> 1) & 1, (i >> 2) & 1];
      const size = bits.map((k) => (k ? b : a) * scale - gap);
      const pos = bits.map((k) => (k ? a * scale + (b * scale) / 2 : (a * scale) / 2) - ((a + b) * scale) / 2);
      const geo = new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(0.12, Math.min(...size) / 4));
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
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.8 ? 17 : 13;
    camera.updateProjectionMatrix();
  }

  // Pointer tilt for the hero, drag-to-turn for the live cube.
  const target = { x: 0.55, y: -0.7 };
  let dragging = false;
  let last = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    if (opts.drag) {
      if (!dragging) return;
      target.y += (e.clientX - last.x) * 0.01;
      target.x += (e.clientY - last.y) * 0.01;
      last = { x: e.clientX, y: e.clientY };
    } else {
      target.y = -0.7 + (e.clientX / innerWidth - 0.5) * 0.6;
      target.x = 0.55 + (e.clientY / innerHeight - 0.5) * 0.3;
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

  let frame = 0;
  const clock = new THREE.Clock();
  function tick() {
    frame = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    if (!reduce && !dragging) target.y += opts.drag ? 0.002 : 0.0012;
    group.rotation.x += (target.x - group.rotation.x) * 0.06;
    group.rotation.y += (target.y - group.rotation.y) * 0.06;
    if (!reduce) group.position.y = Math.sin(t * 0.8) * 0.08;
    explode += (explodeTarget - explode) * (reduce ? 1 : 0.05);
    place();
    renderer.render(scene, camera);
  }

  resize();
  build();
  tick();

  return {
    setSizes(na: number, nb: number) {
      a = na;
      b = nb;
      build();
    },
    setExplode(v: number) {
      explodeTarget = v;
    },
    dispose() {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      blocks.forEach(({ mesh }) => mesh.geometry.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
