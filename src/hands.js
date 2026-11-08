import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/** Webcam + MediaPipe hand landmarker. Detection is throttled and self-tuning so it can never freeze the page. */
export class HandTracker {
  constructor(video) {
    this.video = video; this.landmarker = null; this.ready = false;
    this.interval = 66; this.lastRun = 0; this.cost = 0;
    this.small = document.createElement('canvas'); this.small.width = 256; this.small.height = 192;
    this.sctx = this.small.getContext('2d');
  }
  async startCamera() {
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } });
    await this.video.play();
  }
  async loadModel() {
    const fs = await FilesetResolver.forVisionTasks(new URL('mediapipe', document.baseURI).href);
    const opts = (delegate) => ({
      baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: 'VIDEO', numHands: 1,
      minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5,
    });
    try { this.landmarker = await HandLandmarker.createFromOptions(fs, opts('GPU')); this.delegate = 'GPU'; }
    catch { this.landmarker = await HandLandmarker.createFromOptions(fs, opts('CPU')); this.delegate = 'CPU'; }
    this.ready = true;
  }
  /** Returns {landmarks} when a new detection ran this frame, otherwise null. */
  poll(now) {
    if (!this.ready || document.hidden || this.video.readyState < 2 || now - this.lastRun < this.interval) return null;
    this.lastRun = now;
    const t0 = performance.now(); let landmarks = null;
    try {
      this.sctx.drawImage(this.video, 0, 0, this.small.width, this.small.height);
      landmarks = this.landmarker.detectForVideo(this.small, t0).landmarks?.[0] ?? null;
    } catch (e) { console.warn('hand detect failed', e); }
    this.cost = performance.now() - t0;
    this.interval = Math.min(200, Math.max(50, this.cost * 4)); // back off if the device is slow
    return { landmarks };
  }
}

const D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Turns raw landmarks into stable gestures: 'aim' | 'pinch' | 'fist' | 'none'. */
export class GestureEngine {
  constructor() { this.pinchOn = false; this.cand = 'none'; this.count = 0; this.state = 'none'; }
  update(L) {
    if (!L) { this.state = 'none'; this.cand = 'none'; this.count = 0; this.pinchOn = false; return this.state; }
    const size = D(L[0], L[9]) || 1e-3;
    const p = D(L[4], L[8]) / size;
    if (this.pinchOn) { if (p > 0.5) this.pinchOn = false; } else if (p < 0.3) this.pinchOn = true; // hysteresis
    const extended = [[8, 6], [12, 10], [16, 14], [20, 18]].map(([t, j]) => D(L[t], L[0]) > D(L[j], L[0]) * 1.12);
    const n = extended.filter(Boolean).length;
    const raw = this.pinchOn ? 'pinch' : n === 0 ? 'fist' : 'aim';
    if (raw === this.cand) this.count++; else { this.cand = raw; this.count = 1; }
    if (this.count >= 2) this.state = raw; // debounce: 2 consistent detections
    return this.state;
  }
  /** Screen point between thumb and index tips, mirrored like a selfie. */
  static pointer(L, w, h) { return { x: (1 - (L[4].x + L[8].x) / 2) * w, y: ((L[4].y + L[8].y) / 2) * h }; }
}

const BONES = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]];
const PALETTE = { aim: ['#93d2ff', '#3b82f6'], pinch: ['#86efac', '#16a34a'], fist: ['#fdba74', '#ea580c'], none: ['#93d2ff', '#3b82f6'] };

/** Draws a clean, glowing hand skeleton. */
export function paintHand(ctx, L, w, h, state, { mirror = false, scale = 1, alpha = 1 } = {}) {
  const [c1, c2] = PALETTE[state] || PALETTE.none;
  const P = (i) => ({ x: (mirror ? 1 - L[i].x : L[i].x) * w, y: L[i].y * h });
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); [0, 5, 9, 13, 17].forEach((i, k) => { const p = P(i); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.closePath();
  ctx.fillStyle = c2 + '26'; ctx.fill();
  for (const f of BONES) {
    ctx.beginPath(); f.forEach((i, k) => { const p = P(i); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
    ctx.strokeStyle = c2 + '55'; ctx.lineWidth = 10 * scale; ctx.stroke();
    ctx.strokeStyle = c1; ctx.lineWidth = 2.5 * scale; ctx.stroke();
  }
  for (let i = 0; i < 21; i++) {
    const p = P(i), tip = i % 4 === 0 && i > 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, (tip ? 5 : 3) * scale, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    if (tip) { ctx.beginPath(); ctx.arc(p.x, p.y, 10 * scale, 0, 7); ctx.strokeStyle = c1; ctx.lineWidth = 2 * scale; ctx.stroke(); }
  }
  if (state === 'pinch') { const a = P(4), b = P(8); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 * scale; ctx.stroke(); }
  ctx.restore();
}
