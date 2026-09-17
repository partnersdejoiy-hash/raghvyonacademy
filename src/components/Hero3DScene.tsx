import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCcw, Sparkles } from 'lucide-react';

export const Hero3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [activeConcept, setActiveConcept] = useState<string>('Hover or drag to explore 3D elements');

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionHandler);

    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch (e) {
      setWebGLSupported(false);
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Brand Colors:
    // Royal Blue: #2454A6 -> 0x2454a6
    // Fresh Teal: #35B8A6 -> 0x35b8a6
    // Sunshine Yellow: #F7C948 -> 0xf7c948
    // Coral: #F28C72 -> 0xf28c72
    // Ivory / Cream: #FFF9EE -> 0xfff9ee

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    mainLight.position.set(5, 7, 6);
    scene.add(mainLight);

    const tealFillLight = new THREE.PointLight(0x35b8a6, 2, 20);
    tealFillLight.position.set(-6, -2, 4);
    scene.add(tealFillLight);

    const yellowBackLight = new THREE.PointLight(0xf7c948, 1.8, 15);
    yellowBackLight.position.set(3, -4, -3);
    scene.add(yellowBackLight);

    // Group to hold all 3D education elements
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // 1. STUDENT MASCOT (Friendly geometric character)
    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(0, -0.2, 0);

    // Head
    const headGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffdfba,
      roughness: 0.35,
      metalness: 0.05
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    mascotGroup.add(headMesh);

    // Graduation Mortarboard Cap
    const capBaseGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.25, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x2454a6,
      roughness: 0.2,
      metalness: 0.1
    });
    const capBase = new THREE.Mesh(capBaseGeo, capMat);
    capBase.position.set(0, 0.95, 0);
    mascotGroup.add(capBase);

    // Mortarboard Top diamond plate
    const capPlateGeo = new THREE.BoxGeometry(1.6, 0.06, 1.6);
    const capPlate = new THREE.Mesh(capPlateGeo, capMat);
    capPlate.position.set(0, 1.08, 0);
    capPlate.rotation.y = Math.PI / 4;
    mascotGroup.add(capPlate);

    // Tassel button & string
    const tasselBtnGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
    const tasselMat = new THREE.MeshStandardMaterial({
      color: 0xf7c948,
      roughness: 0.2,
      metalness: 0.5
    });
    const tasselBtn = new THREE.Mesh(tasselBtnGeo, tasselMat);
    tasselBtn.position.set(0, 1.12, 0);
    mascotGroup.add(tasselBtn);

    const tasselStringGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
    const tasselString = new THREE.Mesh(tasselStringGeo, tasselMat);
    tasselString.position.set(0.35, 0.95, 0.35);
    tasselString.rotation.z = -0.6;
    mascotGroup.add(tasselString);

    // Eyeglasses (Scholar look)
    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: 0x172b4d,
      roughness: 0.2
    });
    const glassLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5
    });

    const leftFrame = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 16, 32), glassFrameMat);
    leftFrame.position.set(-0.35, 0.1, 0.95);
    mascotGroup.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 16, 32), glassFrameMat);
    rightFrame.position.set(0.35, 0.1, 0.95);
    mascotGroup.add(rightFrame);

    const bridgeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8);
    const bridge = new THREE.Mesh(bridgeGeo, glassFrameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.1, 0.95);
    mascotGroup.add(bridge);

    // Warm Smile
    const smileCurve = new THREE.TorusGeometry(0.2, 0.03, 16, 24, Math.PI * 0.7);
    const smileMesh = new THREE.Mesh(smileCurve, new THREE.MeshBasicMaterial({ color: 0xc45c43 }));
    smileMesh.position.set(0, -0.32, 0.93);
    smileMesh.rotation.z = Math.PI * 1.15;
    mascotGroup.add(smileMesh);

    // Cheerful rosy cheeks
    const cheekMat = new THREE.MeshBasicMaterial({ color: 0xf28c72, transparent: true, opacity: 0.45 });
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), cheekMat);
    leftCheek.position.set(-0.55, -0.15, 0.85);
    mascotGroup.add(leftCheek);
    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), cheekMat);
    rightCheek.position.set(0.55, -0.15, 0.85);
    mascotGroup.add(rightCheek);

    sceneGroup.add(mascotGroup);

    // 2. FLOATING GLOBE (Global & US/India curriculum reach)
    const globeGroup = new THREE.Group();
    globeGroup.position.set(2.8, 1.2, -0.5);

    const globeGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x35b8a6,
      roughness: 0.4,
      metalness: 0.1
    });
    const globeSphere = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeSphere);

    // Equatorial and meridian rings
    const ringGeo = new THREE.TorusGeometry(0.85, 0.03, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf7c948, metalness: 0.7, roughness: 0.2 });
    const globeRing = new THREE.Mesh(ringGeo, ringMat);
    globeRing.rotation.x = Math.PI / 2.8;
    globeRing.rotation.y = Math.PI / 6;
    globeGroup.add(globeRing);

    sceneGroup.add(globeGroup);

    // 3. FLOATING BOOKS
    const createBook = (colorHex: number, pageColorHex = 0xfffaef) => {
      const book = new THREE.Group();
      // Cover
      const coverGeo = new THREE.BoxGeometry(0.9, 0.12, 1.2);
      const coverMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 });
      const cover = new THREE.Mesh(coverGeo, coverMat);
      book.add(cover);
      // Pages
      const pagesGeo = new THREE.BoxGeometry(0.84, 0.08, 1.14);
      const pagesMat = new THREE.MeshStandardMaterial({ color: pageColorHex, roughness: 0.9 });
      const pages = new THREE.Mesh(pagesGeo, pagesMat);
      pages.position.set(0.04, 0, 0);
      book.add(pages);
      return book;
    };

    const book1 = createBook(0x2454a6); // Royal Blue book
    book1.position.set(-2.8, 1.1, -0.2);
    book1.rotation.set(0.4, 0.5, -0.3);
    sceneGroup.add(book1);

    const book2 = createBook(0xf28c72); // Coral book
    book2.position.set(-2.4, -1.6, 0.3);
    book2.rotation.set(-0.2, -0.4, 0.2);
    sceneGroup.add(book2);

    const book3 = createBook(0xf7c948); // Sunshine yellow book
    book3.position.set(2.4, -1.5, 0.2);
    book3.rotation.set(0.3, -0.6, -0.2);
    sceneGroup.add(book3);

    // 4. FLOATING MATHEMATICAL & SCIENTIFIC SYMBOLS
    const symbolsGroup = new THREE.Group();

    // Infinity symbol / lemniscate made of two tori
    const infMat = new THREE.MeshStandardMaterial({ color: 0x35b8a6, roughness: 0.25, metalness: 0.4 });
    const infLeft = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 16, 32), infMat);
    infLeft.position.set(-0.2, 0, 0);
    const infRight = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 16, 32), infMat);
    infRight.position.set(0.2, 0, 0);
    const infinityMesh = new THREE.Group();
    infinityMesh.add(infLeft);
    infinityMesh.add(infRight);
    infinityMesh.position.set(-1.8, 2.2, 0.5);
    symbolsGroup.add(infinityMesh);

    // Plus symbol (+)
    const plusMat = new THREE.MeshStandardMaterial({ color: 0xf7c948, roughness: 0.3 });
    const barV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), plusMat);
    const barH = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.08), plusMat);
    const plusMesh = new THREE.Group();
    plusMesh.add(barV);
    plusMesh.add(barH);
    plusMesh.position.set(1.9, 2.3, 0.6);
    symbolsGroup.add(plusMesh);

    // Square Root / Radical sign (geometric polygon approximation)
    const sqrtMat = new THREE.MeshStandardMaterial({ color: 0x2454a6, roughness: 0.3, metalness: 0.2 });
    const sqrtGroup = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), sqrtMat);
    stem.position.set(-0.15, -0.05, 0);
    stem.rotation.z = -0.3;
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.06), sqrtMat);
    topBar.position.set(0.05, 0.12, 0);
    sqrtGroup.add(stem);
    sqrtGroup.add(topBar);
    sqrtGroup.position.set(2.8, -0.2, 0.8);
    symbolsGroup.add(sqrtGroup);

    // Pi Symbol (π)
    const piMat = new THREE.MeshStandardMaterial({ color: 0xf28c72, roughness: 0.3 });
    const piGroup = new THREE.Group();
    const piTop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.06), piMat);
    piTop.position.set(0, 0.15, 0);
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.06), piMat);
    leg1.position.set(-0.08, 0, 0);
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.06), piMat);
    leg2.position.set(0.08, 0, 0);
    piGroup.add(piTop);
    piGroup.add(leg1);
    piGroup.add(leg2);
    piGroup.position.set(-2.5, -0.2, 0.7);
    symbolsGroup.add(piGroup);

    sceneGroup.add(symbolsGroup);

    // 5. FLOATING PARTICLES & KNOWLEDGE STARS
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 45;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 7;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x35b8a6,
      size: 0.09,
      transparent: true,
      opacity: 0.75
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    sceneGroup.add(particleSystem);

    // Mouse Tracking Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.35;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation toward mouse target
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX;
      camera.position.y = mouseY;
      camera.lookAt(0, 0, 0);

      // Gentle floating animations if reduced-motion is not requested
      if (!reducedMotion) {
        mascotGroup.position.y = -0.2 + Math.sin(elapsedTime * 1.5) * 0.08;
        mascotGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.12;

        globeSphere.rotation.y += 0.008;
        globeRing.rotation.z += 0.004;
        globeGroup.position.y = 1.2 + Math.cos(elapsedTime * 1.2) * 0.09;

        book1.position.y = 1.1 + Math.sin(elapsedTime * 1.4) * 0.07;
        book1.rotation.y = 0.5 + Math.cos(elapsedTime * 0.8) * 0.1;

        book2.position.y = -1.6 + Math.cos(elapsedTime * 1.3) * 0.08;
        book2.rotation.x = -0.2 + Math.sin(elapsedTime * 0.7) * 0.08;

        book3.position.y = -1.5 + Math.sin(elapsedTime * 1.6) * 0.07;
        book3.rotation.z = -0.2 + Math.sin(elapsedTime * 0.9) * 0.1;

        infinityMesh.rotation.y = elapsedTime * 0.8;
        plusMesh.rotation.z = Math.sin(elapsedTime * 1.1) * 0.3;
        sqrtGroup.position.y = -0.2 + Math.cos(elapsedTime * 1.5) * 0.06;
        piGroup.position.y = -0.2 + Math.sin(elapsedTime * 1.3) * 0.06;

        particleSystem.rotation.y = elapsedTime * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      mediaQuery.removeEventListener('change', motionHandler);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] rounded-3xl border border-[#2454A6]/15 shadow-md overflow-hidden flex items-center justify-center group bg-[#FFF9EE]">
      {/* High-Quality Professional Educational Imagery Asset */}
      <img
        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80"
        alt="Modern Classroom and Academic Mentorship"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Subtle Brand Overlay to maintain brand readability & make 3D elements pop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FFF9EE]/94 via-[#FFF9EE]/84 to-[#FFFFFF]/88 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#2454A6]/5 to-[#2454A6]/15 pointer-events-none" />

      {/* 3D Canvas Mount */}
      {webGLSupported ? (
        <div
          ref={containerRef}
          className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
          title="Interactive 3D Education Scene: Drag or hover to explore"
        />
      ) : (
        /* Static High-Resolution Fallback when WebGL is unavailable */
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-[#2454A6]/10 flex items-center justify-center text-[#2454A6] text-4xl shadow-inner">
            🎓
          </div>
          <h4 className="text-xl font-bold text-[#172B4D]">Interactive Learning Engine</h4>
          <p className="text-sm text-[#172B4D]/70 max-w-sm">
            Concept-focused mentoring with intuitive visual models for Mathematics, Science, and Language Mastery.
          </p>
        </div>
      )}

      {/* Interactive Exploration Overlay Pills */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#2454A6]/15 shadow-sm text-xs font-semibold text-[#172B4D]">
        <span className="w-2 h-2 rounded-full bg-[#35B8A6] animate-pulse"></span>
        <span>Interactive 3D Learning Canvas</span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 shadow-xs text-xs text-[#172B4D] pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#F7C948]" />
          <span>Interactive Student Mascot & Floating Tools</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#2454A6]/5 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-medium text-[#2454A6]">
          <span>Hover & Tilt Mouse</span>
        </div>
      </div>
    </div>
  );
};
