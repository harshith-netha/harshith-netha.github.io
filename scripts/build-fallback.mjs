// Regenerates assets/production-line.svg, the static stand-in for the hero
// scene, by projecting the same model that scene.js renders with WebGL.
// Run from the project root after changing the scene: node scripts/build-fallback.mjs
import { writeFileSync } from 'node:fs';
import * as THREE from '../assets/vendor/three.module.min.js';
import { buildModel, cameraDirection, DEFAULT_AZIMUTH, LOOK_AT } from '../scene.js';

const W = 800, H = 560, PAD_X = 14, PAD_TOP = 46, PAD_BOTTOM = 10;
const LIGHT = new THREE.Vector3(-5, 10, 4).normalize();
const LABELS = { handling: 'Material handling', inspection: 'Quality inspection', output: 'Finished output' };

const model = buildModel();
model.root.updateMatrixWorld(true);

const camera = new THREE.OrthographicCamera();
camera.position.copy(LOOK_AT).addScaledVector(cameraDirection(DEFAULT_AZIMUTH), 30);
camera.lookAt(LOOK_AT);
camera.updateMatrixWorld();
const view = camera.matrixWorldInverse;

// Fit the model bounds into the drawing, leaving room above for labels.
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const point of model.fitPoints) {
  const v = point.clone().applyMatrix4(view);
  minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
}
const scale = Math.min((W - 2 * PAD_X) / (maxX - minX), (H - PAD_TOP - PAD_BOTTOM) / (maxY - minY));
const offX = W / 2 - ((minX + maxX) / 2) * scale;
const offY = PAD_TOP + (H - PAD_TOP - PAD_BOTTOM) / 2 + ((minY + maxY) / 2) * scale;
const toScreen = (world) => {
  const v = world.clone().applyMatrix4(view);
  return { x: offX + v.x * scale, y: offY - v.y * scale, z: v.z };
};
const fmt = (num) => (Math.round(num * 10) / 10).toString();
const pathOf = (pts) => `M${pts.map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join('L')}Z`;

const toLinear = (color) => color.clone().convertSRGBToLinear();
function shade(material, normal) {
  const hemi = 0.78 + 0.22 * (normal.y * 0.5 + 0.5);
  const lit = toLinear(material.color).multiplyScalar(0.5 * hemi + 0.62 * Math.max(0, normal.dot(LIGHT)));
  if (material.emissive && material.emissiveIntensity) lit.add(toLinear(material.emissive).multiplyScalar(material.emissiveIntensity * 0.35));
  return `#${lit.convertLinearToSRGB().getHexString()}`;
}

function isVisible(obj) {
  for (let o = obj; o; o = o.parent) if (!o.visible) return false;
  return true;
}

// Long boxes are re-tessellated along their long axes so painter's sorting holds up.
function svgGeometry(mesh, isGround) {
  if (isGround || mesh.geometry.type !== 'BoxGeometry') return mesh.geometry;
  const seg = (size) => Math.max(1, Math.ceil(size / 0.55));
  return new THREE.BoxGeometry(1, 1, 1, seg(mesh.scale.x), seg(mesh.scale.y), seg(mesh.scale.z));
}

function hull(points) {
  const pts = [...points].sort((p, q) => p.x - q.x || p.y - q.y);
  const cross = (o, p, q) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
  const lower = [], upper = [];
  for (const p of pts) {
    while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
    lower.push(p);
  }
  for (const p of pts.reverse()) {
    while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

const ground = [], polys = [], shadows = [];

model.root.traverse((mesh) => {
  if (!mesh.isMesh || !isVisible(mesh)) return;
  const worldBox = new THREE.Box3().setFromObject(mesh);
  const isGround = worldBox.max.y <= 0.011;
  const geo = svgGeometry(mesh, isGround);
  const pos = geo.attributes.position;
  const index = geo.index.array;
  const doubleSided = mesh.material.side === THREE.DoubleSide;
  const world = (i) => new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
  const normalOf = (ids) => {
    const [p0, p1, p2] = ids.map(world);
    return p1.sub(p0).cross(p2.sub(p0)).normalize();
  };

  // Triangles come in pairs that form planar quads (box faces, cylinder sides); merge them.
  for (let i = 0; i < index.length; i += 3) {
    let ids = [index[i], index[i + 1], index[i + 2]];
    const normal = normalOf(ids);
    if (i + 5 < index.length) {
      const next = [index[i + 3], index[i + 4], index[i + 5]];
      if (next.filter((id) => ids.includes(id)).length === 2 && normal.dot(normalOf(next)) > 0.999) {
        ids = [ids[0], ids[1], next.find((id) => !ids.includes(id)), ids[2]];
        i += 3;
      }
    }
    if (normal.clone().transformDirection(view).z <= 0 && !doubleSided) continue;
    const screen = ids.map((id) => toScreen(world(id)));
    const poly = {
      d: pathOf(screen),
      fill: shade(mesh.material, normal),
      depth: isGround ? worldBox.max.y : screen.reduce((s, p) => s + p.z, 0) / screen.length,
      opacity: mesh.material.transparent ? mesh.material.opacity : 1,
    };
    (isGround ? ground : polys).push(poly);
  }

  // Soft cast shadow on the platform: project the mesh along the light and take the hull.
  if (!isGround && !mesh.material.transparent) {
    const pts = [];
    for (let i = 0; i < pos.count; i++) {
      const p = world(i);
      if (p.y < 0) continue;
      const t = p.y / LIGHT.y;
      pts.push(toScreen(new THREE.Vector3(p.x - LIGHT.x * t, 0, p.z - LIGHT.z * t)));
    }
    if (pts.length > 2) shadows.push(pathOf(hull(pts)));
  }
});

ground.sort((p, q) => p.depth - q.depth);
polys.sort((p, q) => p.depth - q.depth);
const plate = ground.filter((p) => p.depth === 0);
const draw = (p) => `<path d="${p.d}" fill="${p.fill}" stroke="${p.fill}"${p.opacity < 1 ? ` fill-opacity="${p.opacity}" stroke-opacity="0"` : ''}/>`;

const labels = Object.entries(LABELS).map(([key, text]) => {
  const p = toScreen(model.anchors[key]);
  const w = text.length * 8.6 + 40;
  const x = Math.min(Math.max(p.x - w / 2, 4), W - w - 4);
  const y = Math.max(p.y - 36, 4);
  const dot = key === 'inspection' ? '#386e6a' : '#a95532';
  return `<g transform="translate(${fmt(x)} ${fmt(y)})"><rect width="${fmt(w)}" height="34" rx="6" fill="#fff" fill-opacity=".94" stroke="#dce2e7"/><rect x="13" y="13" width="8" height="8" rx="2" fill="${dot}"/><text x="30" y="22">${text}</text></g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<!-- Generated by scripts/build-fallback.mjs from scene.js. Illustrative only. -->
<defs><clipPath id="deck">${plate.map((p) => `<path d="${p.d}"/>`).join('')}</clipPath></defs>
<g stroke-width=".7" stroke-linejoin="round">${ground.map(draw).join('')}</g>
<g clip-path="url(#deck)" fill="#142b3d" fill-opacity=".07">${shadows.map((d) => `<path d="${d}"/>`).join('')}</g>
<g stroke-width=".7" stroke-linejoin="round">${polys.map(draw).join('')}</g>
<g font-family="Manrope, 'Segoe UI', Arial, sans-serif" font-size="14.5" font-weight="700" fill="#142b3d">${labels.join('')}</g>
</svg>
`;
writeFileSync(new URL('../assets/production-line.svg', import.meta.url), svg);
console.log(`assets/production-line.svg: ${polys.length + ground.length} faces, ${shadows.length} shadows, ${(svg.length / 1024).toFixed(1)} KB`);
