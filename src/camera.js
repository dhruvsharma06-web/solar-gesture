import * as THREE from 'three';

// Cinematic camera: overview of the whole plane, or a smooth fly-in to one body.
export function createCameraRig(camera) {
  const rig = {
    focus: null,
    zoom: 1, goalZoom: 1,
    pos: new THREE.Vector3(0, 300, 420),
    target: new THREE.Vector3(),
    orbit: 0, flying: 0,
  };
  const tmp = new THREE.Vector3(), desired = new THREE.Vector3(), sunDir = new THREE.Vector3();

  const viewDist = (b) => b.r * (b.sat ? 22 : b.kind === 'Star' ? 4 : 4);
  const MIN_ZOOM = 0.35, MAX_ZOOM = 3;

  return {
    get focus() { return rig.focus; },
    get zoom() { return rig.goalZoom; },
    setFocus(b) { if (rig.focus === b) return false; rig.focus = b; rig.goalZoom = b ? 1.6 : 1; rig.zoom = Math.max(rig.zoom, 1.2); rig.flying = 1; return true; },
    zoomBy(f) { rig.goalZoom = THREE.MathUtils.clamp(rig.goalZoom * f, MIN_ZOOM, MAX_ZOOM); },
    update(dt) {
      rig.zoom += (rig.goalZoom - rig.zoom) * Math.min(1, dt * 2.5);
      rig.orbit += dt * 0.04;
      if (rig.focus) {
        rig.focus.obj.getWorldPosition(tmp);
        const dist = viewDist(rig.focus) * rig.zoom;
        // stay on the sunlit side, gently swaying
        sunDir.copy(tmp).negate(); if (sunDir.lengthSq() < 1) sunDir.set(0, 0, 1); sunDir.normalize();
        const base = Math.atan2(sunDir.x, sunDir.z) + 0.6 + Math.sin(rig.orbit) * 0.4;
        desired.set(tmp.x + Math.sin(base) * dist, tmp.y + dist * 0.35, tmp.z + Math.cos(base) * dist);
      } else {
        tmp.set(0, 0, 0);
        const dist = 400 * rig.zoom, tilt = 0.62;
        desired.set(Math.sin(rig.orbit) * dist * Math.cos(tilt), dist * Math.sin(tilt), Math.cos(rig.orbit) * dist * Math.cos(tilt));
      }
      rig.flying = Math.max(0, rig.flying - dt * 0.6);
      const ease = Math.min(1, rig.flying > 0 ? dt * 2.4 : dt * 5);
      rig.pos.lerp(desired, ease); rig.target.lerp(tmp, Math.min(1, ease * 1.5));
      camera.position.copy(rig.pos); camera.lookAt(rig.target);
    },
  };
}
