// Copies MediaPipe's WASM runtime into /public so hand tracking works without a CDN.
import { cpSync, mkdirSync } from 'node:fs';
mkdirSync('public/mediapipe', { recursive: true });
cpSync('node_modules/@mediapipe/tasks-vision/wasm', 'public/mediapipe', { recursive: true });
console.log('MediaPipe wasm copied to public/mediapipe');
