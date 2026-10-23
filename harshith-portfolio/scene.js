// Hero centerpiece: an illustrative isometric production cell (robot handling,
// conveyor, inspection gantry, output tote). Conceptual only, with no live data.
import * as THREE from './assets/vendor/three.module.min.js';

const BELT_Y = 0.86;            // top surface of the belt
const BELT_START = -2.45;
const BELT_END = 3.5;
const SPEED = 0.5;              // belt speed, units per second
const CYCLE = 4.8;              // seconds per pick-and-place cycle
const GANTRY_X = 1.2;
const TOTE_X = 4.05;
const PART = { w: 0.46, h: 0.26 };
const ROBOT = { x: -3.3, z: 1.15, shoulder: 0.78, l1: 1.2, l2: 1.1 };
const GRIP_DROP = 0.37;         // wrist joint height above the top of a held part
const PICK = new THREE.Vector3(-3.6, 0.22 + PART.h * 1.5, -0.75);
const DROP = new THREE.Vector3(-2.2, BELT_Y + PART.h / 2, 0);
const RELEASE = 0.68;           // cycle phase when the robot lets go on the belt

const COLORS = {
  plate: 0xf3f0e9, plinth: 0xc9d1d1, steel: 0x345163, navy: 0x102a43, belt: 0x203746,
  slat: 0x3d5663, roller: 0x8c9a9a, copper: 0xae633d, copperDark: 0x7d432c,
  zone: 0xd7a078, partBody: 0xe4e8e6, partCap: 0x345163, teal: 0x2d6a68, cabinet: 0xe1e7e4,
};

const smooth = (x) => x * x * (3 - 2 * x);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Builds the scene graph. Shared by the live renderer and scripts/build-fallback.mjs.
export function buildModel() {
  const root = new THREE.Group();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 28);
  const mat = {};
  for (const [name, color] of Object.entries(COLORS)) {
    mat[name] = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.08 });
  }
  mat.copper.roughness = 0.42;
  mat.copper.metalness = 0.28;
  mat.roller.metalness = 0.45;
  mat.lens = new THREE.MeshStandardMaterial({ color: COLORS.teal, emissive: COLORS.teal, emissiveIntensity: 0.9 });
  mat.lamp = new THREE.MeshStandardMaterial({ color: COLORS.teal, emissive: COLORS.teal, emissiveIntensity: 0.3 });
  mat.beam = new THREE.MeshBasicMaterial({ color: 0x5fa39c, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide });

  function box(m, sx, sy, sz, x, y, z, parent = root) {
    const mesh = new THREE.Mesh(unitBox, m);
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  // Cylinder along y by default; axis 'z' lays it across the belt.
  function cyl(m, r, h, x, y, z, parent = root, axis = 'y') {
    const mesh = new THREE.Mesh(unitCyl, m);
    mesh.scale.set(r, h, r);
    mesh.position.set(x, y, z);
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Platform and the robot's safety-zone floor marking
  box(mat.plate, 9.6, 0.14, 4.1, 0.05, -0.07, 0);
  box(mat.plinth, 9.4, 0.22, 3.9, 0.05, -0.25, 0);
  const [x0, x1, z0, z1] = [-4.35, -2.55, 0.15, 1.9];
  box(mat.zone, x1 - x0, 0.01, 0.05, (x0 + x1) / 2, 0.005, z1);
  box(mat.zone, x1 - x0, 0.01, 0.05, (x0 + x1) / 2, 0.005, z0);
  box(mat.zone, 0.05, 0.01, z1 - z0, x0, 0.005, (z0 + z1) / 2);
  box(mat.zone, 0.05, 0.01, z1 - z0, x1, 0.005, (z0 + z1) / 2);

  // Conveyor: belt, frame, drums, legs and moving slats
  const beltLen = BELT_END - BELT_START;
  const beltMid = (BELT_START + BELT_END) / 2;
  box(mat.belt, beltLen, 0.08, 1.0, beltMid, BELT_Y - 0.04, 0);
  for (const z of [-0.56, 0.56]) box(mat.steel, beltLen + 0.36, 0.18, 0.08, beltMid, BELT_Y - 0.06, z);
  for (const x of [BELT_START - 0.08, BELT_END + 0.08]) cyl(mat.roller, 0.13, 1.04, x, BELT_Y - 0.12, 0, root, 'z');
  for (const x of [-2.2, -0.3, 2.2, 3.3]) {
    for (const z of [-0.5, 0.5]) box(mat.steel, 0.1, BELT_Y - 0.15, 0.1, x, (BELT_Y - 0.15) / 2, z);
    box(mat.steel, 0.06, 0.06, 1.0, x, 0.3, 0);
  }
  const SLATS = 14;
  const slats = Array.from({ length: SLATS }, () => box(mat.slat, 0.05, 0.016, 0.9, 0, BELT_Y + 0.008, 0));

  // Input pallet with a stack of parts
  box(mat.roller, 1.2, 0.08, 1.0, PICK.x, 0.04, PICK.z);
  for (const dx of [-0.45, 0, 0.45]) box(mat.plinth, 0.12, 0.1, 1.0, PICK.x + dx, 0.13, PICK.z);
  const makePart = () => {
    const g = new THREE.Group();
    box(mat.partBody, PART.w, PART.h, PART.w, 0, 0, 0, g);
    cyl(mat.partCap, 0.11, 0.07, 0, PART.h / 2 + 0.035, 0, g);
    const mark = box(mat.teal, 0.11, 0.02, 0.11, 0.14, PART.h / 2 + 0.01, 0.14, g);
    mark.visible = false;
    g.userData.mark = mark;
    root.add(g);
    return g;
  };
  for (const dx of [-0.26, 0.26]) {
    for (const dz of [-0.24, 0.24]) makePart().position.set(PICK.x + dx, 0.22 + PART.h / 2, PICK.z + dz);
  }
  const stackTop = makePart();
  stackTop.position.copy(PICK);

  // Inspection gantry with a sweeping scanner head and status lamp
  for (const z of [-0.8, 0.8]) box(mat.steel, 0.14, 2.0, 0.14, GANTRY_X, 1.0, z);
  box(mat.navy, 0.2, 0.18, 1.78, GANTRY_X, 2.05, 0);
  const head = new THREE.Group();
  head.position.set(GANTRY_X, 1.84, 0);
  root.add(head);
  box(mat.navy, 0.34, 0.24, 0.3, 0, 0, 0, head);
  box(mat.lens, 0.2, 0.03, 0.16, 0, -0.13, 0, head);
  const beamHeight = 1.84 - 0.15 - BELT_Y;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.3, beamHeight, 20, 1, true), mat.beam);
  beam.position.y = -0.15 - beamHeight / 2;
  beam.userData.glow = true;
  head.add(beam);
  cyl(mat.lamp, 0.075, 0.14, GANTRY_X, 2.21, 0.8);

  // Control cabinet beside the inspection station
  box(mat.cabinet, 0.95, 1.3, 0.5, GANTRY_X + 0.15, 0.65, -1.45);
  box(mat.navy, 0.6, 0.36, 0.02, GANTRY_X + 0.15, 0.98, -1.19);
  box(mat.teal, 0.3, 0.04, 0.01, GANTRY_X + 0.08, 1.02, -1.175);
  cyl(mat.copper, 0.05, 0.04, GANTRY_X + 0.3, 0.6, -1.19, root, 'z');

  // Output tote
  const tote = { w: 0.8, d: 1.0, h: 0.55, t: 0.05 };
  box(mat.steel, tote.w, tote.t, tote.d, TOTE_X, tote.t / 2, 0);
  for (const s of [-1, 1]) {
    box(mat.steel, tote.t, tote.h, tote.d, TOTE_X + (s * (tote.w - tote.t)) / 2, tote.h / 2, 0);
    box(mat.steel, tote.w, tote.h, tote.t, TOTE_X, tote.h / 2, (s * (tote.d - tote.t)) / 2);
  }

  // Articulated robot: yaw turret, shoulder, elbow, level wrist, parallel gripper
  box(mat.navy, 0.9, 0.08, 0.9, ROBOT.x, 0.04, ROBOT.z);
  cyl(mat.steel, 0.36, 0.32, ROBOT.x, 0.24, ROBOT.z);
  const turret = new THREE.Group();
  turret.position.set(ROBOT.x, 0.4, ROBOT.z);
  root.add(turret);
  cyl(mat.copper, 0.3, 0.3, 0, 0.15, 0, turret);
  const shoulder = new THREE.Group();
  shoulder.position.y = ROBOT.shoulder - 0.4;
  turret.add(shoulder);
  cyl(mat.copperDark, 0.19, 0.46, 0, 0, 0, shoulder, 'z');
  box(mat.copper, ROBOT.l1, 0.2, 0.22, ROBOT.l1 / 2, 0, 0, shoulder);
  const elbow = new THREE.Group();
  elbow.position.x = ROBOT.l1;
  shoulder.add(elbow);
  cyl(mat.copperDark, 0.15, 0.36, 0, 0, 0, elbow, 'z');
  box(mat.copper, ROBOT.l2, 0.15, 0.17, ROBOT.l2 / 2, 0, 0, elbow);
  const wrist = new THREE.Group();
  wrist.position.x = ROBOT.l2;
  elbow.add(wrist);
  cyl(mat.copperDark, 0.1, 0.26, 0, 0, 0, wrist, 'z');
  const hand = new THREE.Group();
  wrist.add(hand);
  box(mat.steel, 0.1, 0.22, 0.1, 0, -0.11, 0, hand);
  box(mat.steel, 0.14, 0.06, 0.62, 0, -0.25, 0, hand);
  for (const s of [-1, 1]) box(mat.navy, 0.1, 0.25, 0.05, 0, -0.39, s * (PART.w / 2 + 0.03), hand);

  // Cycle keyframes in cylindrical coordinates around the robot axis.
  const toCyl = (p) => ({ yaw: Math.atan2(-(p.z - ROBOT.z), p.x - ROBOT.x), r: Math.hypot(p.x - ROBOT.x, p.z - ROBOT.z), y: p.y });
  const lift = (p) => p.clone().setY(p.y + 0.5);
  const keys = [
    [0, lift(PICK)], [0.1, PICK], [0.18, PICK], [0.3, lift(PICK)], [0.55, lift(DROP)],
    [0.64, DROP], [0.71, DROP], [0.82, lift(DROP)], [1, lift(PICK)],
  ].map(([u, p]) => ({ u, ...toCyl(p) }));

  turret.traverse((obj) => { obj.userData.moves = true; });
  const held = makePart();
  held.traverse((obj) => { obj.userData.moves = true; });
  const beltParts = Array.from({ length: 4 }, makePart);
  const target = new THREE.Vector3();

  function setArm(u) {
    let i = 0;
    while (u > keys[i + 1].u) i++;
    const a = keys[i], b = keys[i + 1];
    const k = smooth((u - a.u) / (b.u - a.u));
    const yaw = a.yaw + wrapAngle(b.yaw - a.yaw) * k;
    const r = a.r + (b.r - a.r) * k;
    target.set(ROBOT.x + Math.cos(yaw) * r, a.y + (b.y - a.y) * k, ROBOT.z - Math.sin(yaw) * r);

    // Two-link planar IK, elbow up, with the wrist kept level.
    const h = target.y + PART.h / 2 + GRIP_DROP - ROBOT.shoulder;
    const d = Math.min(Math.hypot(r, h), ROBOT.l1 + ROBOT.l2 - 1e-3);
    const cosE = (d * d - ROBOT.l1 ** 2 - ROBOT.l2 ** 2) / (2 * ROBOT.l1 * ROBOT.l2);
    const e = Math.acos(THREE.MathUtils.clamp(cosE, -1, 1));
    const a1 = Math.atan2(h, r) + Math.atan2(ROBOT.l2 * Math.sin(e), ROBOT.l1 + ROBOT.l2 * Math.cos(e));
    turret.rotation.y = yaw;
    shoulder.rotation.z = a1;
    elbow.rotation.z = -e;
    wrist.rotation.z = -(a1 - e);
    hand.rotation.y = -yaw;     // keep the fingers square to the parts
  }

  function update(t) {
    const cycle = t / CYCLE;
    const u = cycle - Math.floor(cycle);
    setArm(u);

    held.visible = u >= 0.14 && u < RELEASE;
    held.position.copy(target);
    stackTop.visible = u < 0.14 || u > 0.9;

    // Parts already released onto the belt, newest first.
    let near = false;
    const newest = Math.floor(cycle - RELEASE);
    beltParts.forEach((part, j) => {
      const age = t - (newest - j + RELEASE) * CYCLE;
      const x = DROP.x + SPEED * age;
      part.visible = age >= 0 && x < BELT_END + 0.6;
      if (!part.visible) return;
      const over = Math.max(0, x - BELT_END);
      part.position.set(x, DROP.y - (over / 0.55) ** 2 * 0.72, 0);
      part.rotation.z = -Math.min(1, over / 0.3) * 0.45;
      part.userData.mark.visible = x > GANTRY_X + 0.05;
      if (Math.abs(x - GANTRY_X) < 0.3) near = true;
    });

    const slatGap = beltLen / SLATS;
    slats.forEach((s, i) => { s.position.x = BELT_START + ((t * SPEED + i * slatGap) % beltLen); });
    head.position.z = Math.sin(t * 2.2) * 0.32;
    mat.lamp.emissiveIntensity = near ? 1.6 : 0.3;
  }

  const anchors = {
    handling: new THREE.Vector3(ROBOT.x, 2.75, ROBOT.z),
    inspection: new THREE.Vector3(GANTRY_X, 2.45, 0),
    output: new THREE.Vector3(TOTE_X, 0.95, 0),
  };
  // Points used to fit the camera: every mesh's box corners across one full cycle,
  // so the moving arm never leaves the frame.
  const fitPoints = [];
  const meshBox = new THREE.Box3();
  for (let k = 0; k < 8; k++) {
    update((k / 8) * CYCLE);
    root.updateMatrixWorld(true);
    root.traverse((obj) => {
      if (!obj.isMesh || (k > 0 && !obj.userData.moves)) return;
      meshBox.setFromObject(obj);
      for (let i = 0; i < 8; i++) {
        fitPoints.push(new THREE.Vector3(i & 1 ? meshBox.max.x : meshBox.min.x, i & 2 ? meshBox.max.y : meshBox.min.y, i & 4 ? meshBox.max.z : meshBox.min.z));
      }
    });
  }
  fitPoints.push(...Object.values(anchors));
  const still = CYCLE * 1.42;     // a composed frame: arm mid-swing, parts spread along the belt
  update(still);
  return { root, anchors, fitPoints, update, still };
}

const ELEVATION = THREE.MathUtils.degToRad(30);
export const LOOK_AT = new THREE.Vector3(0.05, 0.7, 0);
export const DEFAULT_AZIMUTH = THREE.MathUtils.degToRad(-32);
export function cameraDirection(azimuth, out = new THREE.Vector3()) {
  return out.set(Math.sin(azimuth) * Math.cos(ELEVATION), Math.sin(ELEVATION), Math.cos(azimuth) * Math.cos(ELEVATION));
}

export function createScene(viewport, { onReady, onStateChange, initialPlaying, motionManaged = false } = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Throws when WebGL is unavailable; the caller keeps the SVG fallback.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const model = buildModel();
  scene.add(model.root);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc4ced6, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-5, 10, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 1, far: 30 });
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 3;
  scene.add(sun);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.1 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.37;
  catcher.receiveShadow = true;
  scene.add(catcher);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const labels = [...viewport.querySelectorAll('[data-anchor]')];
  const tmp = new THREE.Vector3();

  let width = 1, height = 1;
  let azimuth = DEFAULT_AZIMUTH;
  let tween = null;
  let simTime = model.still;
  let playing = initialPlaying ?? !reduceMotion.matches;
  let userPaused = false;
  let onScreen = true;
  let lost = false;
  let looping = false;
  let last = 0;

  function fit() {
    camera.position.copy(LOOK_AT).addScaledVector(cameraDirection(azimuth, tmp), 30);
    camera.lookAt(LOOK_AT);
    camera.updateMatrixWorld();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of model.fitPoints) {
      tmp.copy(c).applyMatrix4(camera.matrixWorldInverse);
      minX = Math.min(minX, tmp.x); maxX = Math.max(maxX, tmp.x);
      minY = Math.min(minY, tmp.y); maxY = Math.max(maxY, tmp.y);
    }
    const padX = 10, padTop = 34, padBottom = 6;
    const scale = Math.max((maxX - minX) / Math.max(1, width - 2 * padX), (maxY - minY) / Math.max(1, height - padTop - padBottom));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2 + ((padTop - padBottom) / 2) * scale;
    camera.left = cx - (width * scale) / 2;
    camera.right = cx + (width * scale) / 2;
    camera.top = cy + (height * scale) / 2;
    camera.bottom = cy - (height * scale) / 2;
    camera.updateProjectionMatrix();
    placeLabels();
  }

  function placeLabels() {
    for (const label of labels) {
      tmp.copy(model.anchors[label.dataset.anchor]).project(camera);
      const half = label.offsetWidth / 2 + 2;
      const x = THREE.MathUtils.clamp(((tmp.x + 1) / 2) * width, half, width - half);
      const y = Math.max(label.offsetHeight + 2, ((1 - tmp.y) / 2) * height);
      label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }

  function render() {
    if (lost) return;
    model.update(simTime);
    renderer.render(scene, camera);
  }

  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (playing) simTime += dt;
    if (tween) {
      const k = Math.min(1, (now - tween.start) / tween.duration);
      azimuth = tween.from + (tween.to - tween.from) * smooth(k);
      fit();
      if (k === 1) tween = null;
    }
    render();
    updateLoop();
  }

  // The loop runs only while something moves and the scene can be seen.
  function updateLoop() {
    const active = !lost && onScreen && !document.hidden && (playing || !!tween);
    if (active === looping) return;
    looping = active;
    last = 0;
    renderer.setAnimationLoop(active ? tick : null);
  }

  function resize() {
    const rect = viewport.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    fit();
    render();
  }

  const notify = () => onStateChange?.({ playing });
  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    updateLoop();
  });
  const onVisibility = () => updateLoop();
  const onMotionPref = () => {
    playing = !reduceMotion.matches && !userPaused;
    notify();
    updateLoop();
  };
  const onLost = (event) => {
    event.preventDefault();
    lost = true;
    viewport.classList.remove('scene-ready');
    updateLoop();
  };
  const onRestored = () => {
    lost = false;
    resize();
    viewport.classList.add('scene-ready');
    updateLoop();
  };

  function dispose() {
    renderer.setAnimationLoop(null);
    looping = false;
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    reduceMotion.removeEventListener('change', onMotionPref);
    canvas.removeEventListener('webglcontextlost', onLost);
    canvas.removeEventListener('webglcontextrestored', onRestored);
    scene.traverse((obj) => {
      obj.geometry?.dispose();
      obj.material?.dispose();
    });
    renderer.dispose();
    canvas.remove();
    viewport.classList.remove('scene-ready');
  }

  try {
    viewport.prepend(canvas);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    resize();
  } catch (error) {
    dispose();
    throw error;
  }
  resizeObserver.observe(viewport);
  visibilityObserver.observe(viewport);
  document.addEventListener('visibilitychange', onVisibility);
  if (!motionManaged) reduceMotion.addEventListener('change', onMotionPref);

  // Reveal only after the first frame has been drawn.
  requestAnimationFrame(() => {
    if (lost) return;
    viewport.classList.add('scene-ready');
    placeLabels();
    notify();
    updateLoop();
    onReady?.();
  });

  return {
    setPlaying(value) {
      playing = Boolean(value);
      userPaused = !playing;
      if (!playing) tween = null;
      notify();
      updateLoop();
    },
    togglePlay() {
      playing = !playing;
      userPaused = !playing;
      notify();
      updateLoop();
    },
    rotate() {
      const to = (tween ? tween.to : azimuth) + Math.PI / 2;
      if (!playing || reduceMotion.matches || !onScreen || document.hidden) {
        tween = null;
        azimuth = to;
        fit();
        render();
      } else {
        tween = { from: azimuth, to, start: performance.now(), duration: 900 };
        updateLoop();
      }
    },
    refreshLabels: placeLabels,
    dispose,
  };
}
