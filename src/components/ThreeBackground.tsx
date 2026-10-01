import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SpecializationId } from '../types';

interface ThreeBackgroundProps {
  mode: 'entry' | 'specializations' | 'detail';
  specializationId?: SpecializationId;
  hoveredSpecialization?: SpecializationId | null;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  mode,
  specializationId,
  hoveredSpecialization,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId: number;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.innerWidth > 768,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    // Particle sprite generator
    const makeParticleTexture = () => {
      const tc = document.createElement('canvas');
      tc.width = tc.height = 64;
      const cx = tc.getContext('2d');
      if (cx) {
        const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, '#ffffff');
        gr.addColorStop(0.35, 'rgba(255, 255, 255, 0.4)');
        gr.addColorStop(1, 'rgba(255, 255, 255, 0)');
        cx.fillStyle = gr;
        cx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(tc);
    };

    const particleTexture = makeParticleTexture();

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0c0e, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = window.innerWidth < window.innerHeight ? 14 : 10;

    // Mouse tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove);

    // Groups
    const groupBack = new THREE.Group();
    const groupMid = new THREE.Group();
    const groupFront = new THREE.Group();
    const groupSpecial = new THREE.Group();
    scene.add(groupBack, groupMid, groupFront, groupSpecial);

    // Helper material
    const makeLineMaterial = (color: number, opacity: number) =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      });

    // 1. Grid
    const grid = new THREE.GridHelper(70, 70, 0x35607f, 0x1c2e3d);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    grid.position.set(0, -4.2, -6);
    groupBack.add(grid);

    // 2. Random 3D circuit traces
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const D8 = [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
    ];

    const circuitPaths: Array<{ cp: THREE.CurvePath<THREE.Vector3>; u: number; v: number }> = [];
    const circuitSegments: number[] = [];

    const traceCount = window.innerWidth < 640 ? 6 : 12;
    for (let k = 0; k < traceCount; k++) {
      let x = (rnd() - 0.5) * 26;
      let y = (rnd() - 0.5) * 13;
      let d = Math.floor(rnd() * 8);
      const cp = new THREE.CurvePath<THREE.Vector3>();
      const z = -5 - rnd() * 2;

      for (let s = 0; s < 6; s++) {
        const l = 1 + rnd() * 2.2;
        d = (d + [0, 0, 1, -1, 2, -2][Math.floor(rnd() * 6)] + 8) % 8;
        const n = D8[d];
        const nx = x + n[0] * l;
        const ny = y + n[1] * l;
        const a = new THREE.Vector3(x, y, z);
        const b = new THREE.Vector3(nx, ny, z);
        cp.add(new THREE.LineCurve3(a, b));
        circuitSegments.push(x, y, z, nx, ny, z);
        x = nx;
        y = ny;
      }
      circuitPaths.push({ cp, u: rnd(), v: 0.03 + rnd() * 0.04 });
    }

    const circuitMaterial = makeLineMaterial(0xc9733f, 0.22);
    const circuitGeo = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute(circuitSegments, 3)
    );
    groupBack.add(new THREE.LineSegments(circuitGeo, circuitMaterial));

    // Pulses traveling on circuit lines
    const pulsePositions = new Float32Array(circuitPaths.length * 3);
    const pulseGeo = new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(pulsePositions, 3)
    );
    groupBack.add(
      new THREE.Points(
        pulseGeo,
        new THREE.PointsMaterial({
          size: 0.22,
          map: particleTexture,
          color: 0xffc9a0,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      )
    );

    // 3. Floating geometric polyhedra wireframes
    const createWireframe = (
      geo: THREE.BufferGeometry,
      pos: [number, number, number],
      color: number,
      opacity: number,
      scale: number
    ) => {
      const mesh = new THREE.LineSegments(new THREE.EdgesGeometry(geo), makeLineMaterial(color, opacity));
      mesh.position.set(...pos);
      mesh.scale.setScalar(scale);
      groupMid.add(mesh);
      return mesh;
    };

    const wireframes = [
      createWireframe(new THREE.IcosahedronGeometry(1, 0), [-7.5, 2.6, -3], 0xd08050, 0.26, 1.7),
      createWireframe(new THREE.OctahedronGeometry(1, 0), [7.8, -1.4, -4], 0x5aa9d6, 0.24, 1.9),
      createWireframe(new THREE.BoxGeometry(1, 1, 1), [-8.5, -2.6, -6], 0x5aa9d6, 0.2, 1.6),
      createWireframe(new THREE.IcosahedronGeometry(1, 1), [8.6, 3.2, -7], 0xd08050, 0.16, 1.3),
    ];

    // 4. Subtle Orbiting Rings
    const createRing = (r: number, color: number, opacity: number, rx: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 140; i++) {
        const a = (i / 140) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
      }
      const ringMesh = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        makeLineMaterial(color, opacity)
      );
      ringMesh.rotation.x = rx;
      ringMesh.position.z = -4;
      groupMid.add(ringMesh);
      return ringMesh;
    };

    const rings = [
      createRing(7.4, 0x5aa9d6, 0.15, 1.15),
      createRing(10.5, 0xc9733f, 0.13, 1.35),
    ];

    // 5. Star dust particles
    const particleCount = window.innerWidth < 640 ? 160 : 360;
    const starPos = new Float32Array(particleCount * 3);
    const starColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      starPos[i * 3] = (rnd() - 0.5) * 34;
      starPos[i * 3 + 1] = (rnd() - 0.5) * 19;
      starPos[i * 3 + 2] = -9 + rnd() * 15;

      const isCopper = rnd() < 0.75;
      const b = 0.35 + rnd() * 0.65;
      if (isCopper) {
        starColors[i * 3] = 0.88 * b;
        starColors[i * 3 + 1] = 0.54 * b;
        starColors[i * 3 + 2] = 0.32 * b;
      } else {
        starColors[i * 3] = 0.32 * b;
        starColors[i * 3 + 1] = 0.65 * b;
        starColors[i * 3 + 2] = 0.85 * b;
      }
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starPoints = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.1,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    groupFront.add(starPoints);

    // 6. Interactive 3D Discipline Model for Detail View / Active selection
    const activeDiscipline = specializationId || hoveredSpecialization;
    let telecomGroup: THREE.Group | null = null;
    let computerGroup: THREE.Group | null = null;
    let industrialGroup: THREE.Group | null = null;

    if (mode === 'detail' || (mode === 'specializations' && activeDiscipline)) {
      const activeId = activeDiscipline || 'communications';

      if (activeId === 'communications') {
        telecomGroup = new THREE.Group();
        const matCopper = new THREE.MeshStandardMaterial({ color: 0xc98a4a, metalness: 0.85, roughness: 0.3 });
        const matBlue = new THREE.MeshStandardMaterial({ color: 0x123a78, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide });

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.2, 12), matCopper);
        mast.position.y = -0.8;
        telecomGroup.add(mast);

        const dish = new THREE.Group();
        dish.position.y = 0.3;
        dish.rotation.z = -0.7;
        telecomGroup.add(dish);

        const pr: THREE.Vector2[] = [];
        for (let i = 0; i <= 24; i++) {
          const r = (i / 24) * 1.25;
          pr.push(new THREE.Vector2(r, r * r * 0.42));
        }
        const latheGeo = new THREE.LatheGeometry(pr, 36);
        dish.add(new THREE.Mesh(latheGeo, matBlue));
        dish.add(
          new THREE.Mesh(
            latheGeo,
            new THREE.MeshBasicMaterial({ color: 0x32d6ff, wireframe: true, transparent: true, opacity: 0.25 })
          )
        );

        const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.02, 6, 48), matCopper);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.65;
        dish.add(rim);

        // Focal feed horn
        const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.24, 12), matCopper);
        horn.position.y = 0.62;
        dish.add(horn);

        const hot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0x9ff0ff }));
        hot.position.y = 0.76;
        dish.add(hot);

        telecomGroup.position.set(window.innerWidth > 820 ? 3.5 : 0, 0, -1);
        groupSpecial.add(telecomGroup);
      } else if (activeId === 'computer-networks') {
        computerGroup = new THREE.Group();
        const matPcb = new THREE.MeshStandardMaterial({ color: 0x151a22, roughness: 0.7 });
        const matDie = new THREE.MeshStandardMaterial({ color: 0xc98a4a, metalness: 0.9, roughness: 0.25 });

        const pcb = new THREE.Mesh(new THREE.BoxGeometry(3, 0.05, 3), matPcb);
        pcb.position.y = -0.12;
        computerGroup.add(pcb);

        const die = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.9), matDie);
        die.position.y = 0.06;
        computerGroup.add(die);

        const core = new THREE.Mesh(
          new THREE.PlaneGeometry(0.35, 0.35),
          new THREE.MeshBasicMaterial({ color: 0x32d6ff, transparent: true, opacity: 0.85 })
        );
        core.rotation.x = -Math.PI / 2;
        core.position.y = 0.12;
        computerGroup.add(core);

        // Surrounding network nodes
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const r = 1.6 + (i % 2) * 0.5;
          const node = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.09),
            new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x32d6ff : 0x3c86e8 })
          );
          node.position.set(Math.cos(a) * r, 0.2 + Math.sin(i * 1.5) * 0.4, Math.sin(a) * r);
          computerGroup.add(node);
        }

        computerGroup.position.set(window.innerWidth > 820 ? 3.5 : 0, 0, -1);
        groupSpecial.add(computerGroup);
      } else if (activeId === 'industrial') {
        industrialGroup = new THREE.Group();
        const matCopper = new THREE.MeshStandardMaterial({ color: 0xc98a4a, metalness: 0.85, roughness: 0.3 });
        const matOrange = new THREE.MeshStandardMaterial({ color: 0xff8a00, metalness: 0.75, roughness: 0.4 });
        const matDark = new THREE.MeshStandardMaterial({ color: 0x2b2e34, roughness: 0.5 });

        // Gears
        const gearA = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.15, 20), matCopper);
        gearA.rotation.x = Math.PI / 2;
        gearA.position.set(-0.6, 0.4, 0);
        industrialGroup.add(gearA);

        const gearB = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 14), matOrange);
        gearB.rotation.x = Math.PI / 2;
        gearB.position.set(0.7, 0.4, 0);
        industrialGroup.add(gearB);

        // Conveyor belt base
        const belt = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.8), matDark);
        belt.position.y = -1.2;
        industrialGroup.add(belt);

        industrialGroup.position.set(window.innerWidth > 820 ? 3.5 : 0, 0, -1);
        groupSpecial.add(industrialGroup);
      }

      // Add directional light for models
      const dirLight = new THREE.DirectionalLight(0xffe4c8, 1.8);
      dirLight.position.set(4, 5, 4);
      scene.add(dirLight);

      const ambLight = new THREE.AmbientLight(0x9fb4cc, 0.6);
      scene.add(ambLight);
    }

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < h ? 14 : 10;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerping
      const lerpSpeed = prefersReducedMotion ? 0.01 : 0.05;
      currentMouseX += (targetMouseX - currentMouseX) * lerpSpeed;
      currentMouseY += (targetMouseY - currentMouseY) * lerpSpeed;

      // Parallax shifts
      groupBack.position.set(-currentMouseX * 0.3, currentMouseY * 0.2, 0);
      groupMid.position.set(-currentMouseX * 0.6, currentMouseY * 0.4, 0);
      groupFront.position.set(-currentMouseX * 1.1, currentMouseY * 0.7, 0);

      // Grid scrolling
      grid.position.z = -6 + (time * 0.4) % 1;

      // Wireframes slow rotation
      wireframes.forEach((m, idx) => {
        m.rotation.x = time * 0.08 * (idx % 2 === 0 ? 1 : -1) + idx;
        m.rotation.y = time * 0.09;
      });

      // Rings
      rings.forEach((r, idx) => {
        r.rotation.z = time * 0.03 * (idx === 0 ? 1 : -1);
      });

      // Circuit pulse particles along paths
      circuitPaths.forEach((item, idx) => {
        item.u = (item.u + item.v * delta) % 1;
        const pt = item.cp.getPoint(item.u);
        pulsePositions[idx * 3] = pt.x;
        pulsePositions[idx * 3 + 1] = pt.y;
        pulsePositions[idx * 3 + 2] = pt.z;
      });
      pulseGeo.attributes.position.needsUpdate = true;

      // Star dust slow drift
      starPoints.rotation.y = time * 0.01;

      // Special active models rotation
      if (telecomGroup) {
        telecomGroup.rotation.y = time * 0.25 + currentMouseX * 0.2;
      }
      if (computerGroup) {
        computerGroup.rotation.y = time * 0.18 + currentMouseX * 0.3;
      }
      if (industrialGroup) {
        industrialGroup.rotation.y = time * 0.15 + currentMouseX * 0.2;
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [mode, specializationId, hoveredSpecialization]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-90 transition-opacity duration-1000"
      style={{ display: 'block' }}
    />
  );
};
