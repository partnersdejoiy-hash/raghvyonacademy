import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DScene: React.FC = () => {
  const mount = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(true);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);
  useEffect(() => { pauseRef.current = paused; }, [paused]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch { setAvailable(false); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
    camera.position.set(0, .4, 10);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xb5d8ff, 5); light.position.set(3, 5, 5); scene.add(light);
    const accent = new THREE.PointLight(0x6ef2c3, 30); accent.position.set(-3, 1, 3); scene.add(accent);
    const universe = new THREE.Group(); scene.add(universe);
    const material = (color: number) => new THREE.MeshStandardMaterial({ color, metalness: .35, roughness: .22 });
    const center = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), material(0x6ef2c3)); universe.add(center);
    const rings: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const orbit = new THREE.Group(); orbit.rotation.set(i * .8 + .5, i * 1.05, .35); universe.add(orbit); rings.push(orbit);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, .022, 8, 100), material(i === 1 ? 0xf7c948 : 0x7c9dff)); orbit.add(ring);
      const electron = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 20), material(0xf7c948)); electron.position.x = 2.1; orbit.add(electron);
    }
    const books: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const book = new THREE.Group();
      const pages = new THREE.Mesh(new THREE.BoxGeometry(.95, .12, 1.3), material(0xeaf1ff)); book.add(pages);
      for (const y of [-.095, .095]) {
        const cover = new THREE.Mesh(new THREE.BoxGeometry(1.03, .045, 1.38), material([0x7c9dff, 0xf7c948, 0x6ef2c3][i])); cover.position.y = y; book.add(cover);
      }
      book.position.set(i === 0 ? -2.5 : 2.5, i === 1 ? 1.7 : -1.8, .3); book.rotation.set(.5, i * .6, -.25); universe.add(book); books.push(book);
    }
    const points = new Float32Array(150 * 3);
    for (let i = 0; i < points.length; i++) points[i] = (Math.random() - .5) * 11;
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xabc4ff, size: .035, transparent: true, opacity: .65 })); scene.add(stars);
    let pointerX = 0, pointerY = 0;
    const move = (e: PointerEvent) => { const rect = host.getBoundingClientRect(); pointerX = ((e.clientX - rect.left) / rect.width - .5) * .8; pointerY = ((e.clientY - rect.top) / rect.height - .5) * .4; };
    const leave = () => { pointerX = pointerY = 0; };
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave);
    const resize = new ResizeObserver(() => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); }); resize.observe(host);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true, frame = 0, previous = performance.now(), time = 0;
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); observer.observe(host);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((now - previous) / 1000, .05); previous = now;
      if (!visible || document.hidden) return;
      if (!motion.matches && !pauseRef.current) {
        time += delta; center.rotation.y = time * .3; center.rotation.x = time * .15;
        rings.forEach((ring, i) => { ring.rotation.z = time * (.25 + i * .1); });
        books.forEach((book, i) => { book.position.y = (i === 1 ? 1.7 : -1.8) + Math.sin(time + i) * .18; book.rotation.y += delta * .12; });
        universe.rotation.y += (pointerX - universe.rotation.y) * .04;
        universe.rotation.x += (pointerY - universe.rotation.x) * .04;
      }
      renderer.render(scene, camera);
    }; frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(m => m.dispose()); } }); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div className="cosmos-scene">
    <div className="cosmos-orbit" aria-hidden="true" />
    <div ref={mount} className="cosmos-canvas" role="img" aria-label="Interactive 3D atom with orbiting electrons and floating books" />
    {!available && <div className="cosmos-fallback"><span>✦</span><p>A universe of possibilities.</p></div>}
    <div className="scene-label">THE LEARNING UNIVERSE <span>01 / EXPLORE</span></div>
    <div className="scene-bottom"><span>{available ? 'Move your pointer to explore' : 'Your learning journey starts here'}</span>{available && <button onClick={() => setPaused(p => !p)} aria-pressed={paused}>{paused ? 'Play motion' : 'Pause motion'}</button>}</div>
  </div>;
};
