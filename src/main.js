import './style.css';
import * as THREE from 'three';
import { createScene } from './scene.js';
import { createCameraRig } from './camera.js';
import { HandTracker, GestureEngine, paintHand } from './hands.js';

const $ = (id) => document.getElementById(id);

// ---------- scene ----------
const { renderer, scene, camera, bodies, update: updateSim } = createScene($('scene'));
const rig = createCameraRig(camera);

// ---------- UI: title card ----------
let titleTimer;
function showTitle(b) {
  $('title').classList.add('hide'); clearTimeout(titleTimer);
  titleTimer = setTimeout(() => {
    $('kind').textContent = b ? b.kind : 'Overview';
    $('name').textContent = b ? b.name : 'Solar System';
    $('desc').textContent = b ? b.info : 'Aim at any planet, moon or satellite with your hand, then pinch to fly in.';
    $('facts').innerHTML = (b?.facts || []).map((f) => `<span class="glass rounded-full px-3 py-1 text-xs text-sky-100">${f}</span>`).join('');
    $('title').classList.remove('hide');
  }, 450);
}
function focusOn(b) { if (rig.setFocus(b)) showTitle(b); }

// ---------- UI: labels ----------
for (const b of bodies) {
  const el = document.createElement('div');
  el.className = 'label' + (b.kind === 'Planet' || b.kind === 'Star' ? ' major' : '');
  el.textContent = b.name; $('labels').appendChild(el); b.label = el;
}
const wp = new THREE.Vector3(), pp = new THREE.Vector3();
function relevant(b) {
  const f = rig.focus;
  if (!f) return b.kind === 'Planet' || b.kind === 'Star';
  const fam = f.family || f;
  return b === f || b.kind === 'Star' || b === fam || b.family === fam;
}
function screenOf(b) {
  b.obj.getWorldPosition(wp); pp.copy(wp).project(camera);
  return { x: (pp.x + 1) / 2 * innerWidth, y: (1 - pp.y) / 2 * innerHeight, front: pp.z < 1 && pp.z > -1, d: wp.distanceTo(camera.position) };
}
function pick(x, y) {
  let best = null, bestD = Infinity;
  for (const b of bodies) {
    if (!relevant(b)) continue; const s = screenOf(b); if (!s.front) continue;
    const pr = (b.r / s.d) * innerHeight * 1.2;
    const d = Math.hypot(s.x - x, s.y - y) - Math.max(pr, 8);
    if (d < 40 && d < bestD) { bestD = d; best = b; }
  }
  return best;
}
function drawLabels(hover) {
  for (const b of bodies) {
    const s = screenOf(b), show = relevant(b) && s.front;
    b.label.style.opacity = show ? (b === hover ? 1 : 0.75) : 0;
    if (show) b.label.style.transform = `translate(${s.x | 0}px,${s.y | 0}px)`;
    b.label.classList.toggle('hot', b === hover);
  }
}

// ---------- hands ----------
const tracker = new HandTracker($('video'));
const gestures = new GestureEngine();
const camOverlay = $('camoverlay'), cctx = camOverlay.getContext('2d');
const handLayer = $('handlayer'), hctx = handLayer.getContext('2d');
const cursor = $('cursor'), progress = cursor.querySelector('.ring-progress');
const sizeLayer = () => { handLayer.width = innerWidth; handLayer.height = innerHeight; };
sizeLayer(); addEventListener('resize', sizeLayer);

const H = { L: null, state: 'none', x: innerWidth / 2, y: innerHeight / 2, hover: null, fistT: 0, fresh: false };
function setStatus(text, color = 'bg-emerald-400') {
  $('status').textContent = text;
  $('dot').className = `h-2.5 w-2.5 rounded-full ${color}`;
}
function setLegend(g) { for (const el of document.querySelectorAll('.legend')) el.classList.toggle('active', el.dataset.g === g); }

function handStep(dt, now) {
  const res = tracker.poll(now);
  if (res) {
    H.L = res.landmarks; H.state = gestures.update(H.L); H.fresh = true;
    cctx.clearRect(0, 0, camOverlay.width, camOverlay.height);
    if (H.L) paintHand(cctx, H.L, camOverlay.width, camOverlay.height, H.state, { scale: 0.8 });
    $('fps').textContent = `${tracker.delegate} · ${tracker.cost.toFixed(0)}ms`;
  }
  if (!tracker.ready) return;
  const L = H.L;
  if (H.fresh) { hctx.clearRect(0, 0, handLayer.width, handLayer.height); if (L) paintHand(hctx, L, innerWidth, innerHeight, H.state, { mirror: true, scale: 1.4, alpha: 0.28 }); H.fresh = false; }
  if (!L) { cursor.style.opacity = 0; H.hover = null; H.fistT = 0; setLegend(null); setStatus('Raise your hand ✋', 'bg-amber-400 animate-pulse'); return; }

  // smoothed pointer
  const p = GestureEngine.pointer(L, innerWidth, innerHeight), k = Math.min(1, dt * 14);
  H.x += (p.x - H.x) * k; H.y += (p.y - H.y) * k;
  cursor.style.opacity = 1; cursor.style.transform = `translate(${H.x}px,${H.y}px)`;

  if (H.state !== 'pinch') H.hover = pick(H.x, H.y);
  cursor.dataset.state = H.state === 'aim' && H.hover ? 'hover' : H.state; // dataset works on SVG-hosting divs safely

  if (H.state === 'pinch') {
    if (H.hover && H.hover !== rig.focus) focusOn(H.hover);
    rig.zoomBy(1 - dt * 0.8);
    setLegend('pinch'); setStatus(H.hover ? `Flying to ${H.hover.name}` : 'Zooming in', 'bg-emerald-400');
  }
  if (H.state === 'fist') {
    H.fistT += dt; rig.zoomBy(1 + dt * 1.1);
    if (rig.focus && H.fistT > 1.2) { focusOn(null); H.fistT = 0; }
    setLegend('fist'); setStatus(rig.focus ? 'Hold to return to overview' : 'Pulling back', 'bg-orange-400');
  } else H.fistT = 0;
  if (H.state === 'aim') { setLegend('aim'); setStatus(H.hover ? `${H.hover.name}: pinch to fly in` : 'Move to aim', 'bg-sky-400'); }
  progress.style.strokeDashoffset = H.state === 'fist' && rig.focus ? 100 - Math.min(H.fistT / 1.2, 1) * 100 : 100;
}

// ---------- mouse / keyboard ----------
renderer.domElement.addEventListener('click', (e) => { const b = pick(e.clientX, e.clientY); if (b) focusOn(b); });
addEventListener('wheel', (e) => rig.zoomBy(1 + e.deltaY * 0.001), { passive: true });
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') focusOn(null);
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const i = rig.focus ? bodies.indexOf(rig.focus) : -1, step = e.key === 'ArrowRight' ? 1 : -1;
    focusOn(bodies[(i + step + bodies.length) % bodies.length]);
  }
});

// ---------- start ----------
$('enter').addEventListener('click', async () => {
  $('intro').style.opacity = 0; setTimeout(() => $('intro').remove(), 1000);
  showTitle(null);
  $('camcard').classList.remove('hidden');
  try {
    await tracker.startCamera();
    camOverlay.width = tracker.video.videoWidth || 640; camOverlay.height = tracker.video.videoHeight || 480;
    setStatus('Loading hand tracking…', 'bg-amber-400 animate-pulse');
    await tracker.loadModel();
    setStatus('Raise your hand ✋', 'bg-amber-400 animate-pulse');
  } catch (err) {
    console.error(err);
    setStatus('Camera unavailable: use mouse & keys', 'bg-rose-500');
  }
});

// ---------- main loop: each part isolated so one error can never freeze the app ----------
const clock = new THREE.Clock();
let lastErr = 0;
function safe(name, fn) {
  try { fn(); } catch (e) { const t = performance.now(); if (t - lastErr > 2000) { console.error(`[${name}]`, e); lastErr = t; } }
}
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05), now = performance.now();
  safe('sim', () => updateSim(dt));
  safe('hands', () => handStep(dt, now));
  safe('camera', () => rig.update(dt));
  safe('render', () => renderer.render(scene, camera));
  safe('labels', () => drawLabels(H.hover));
}
frame();

// debug hook: lets you (or a test) feed fake landmarks
window.__orbit = { bodies, focusOn, feed: (L) => { tracker.ready = true; tracker.delegate = 'test'; tracker.poll = () => ({ landmarks: L }); } };
