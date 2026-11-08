import * as THREE from 'three';
import { SUN, PLANETS } from './data.js';

const TEX_URL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/';

// ---------- procedural textures (instant, no network) ----------
function rng(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
function canvasTex(draw, w = 1024, h = 512) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function gas(cols, seed, spot) {
  return canvasTex((x, w, h) => {
    const r = rng(seed); const g = x.createLinearGradient(0, 0, 0, h);
    for (let i = 0; i <= 24; i++) g.addColorStop(i / 24, cols[Math.floor(r() * cols.length)]);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) {
      x.globalAlpha = 0.06 + r() * 0.1; x.fillStyle = cols[Math.floor(r() * cols.length)];
      x.beginPath(); x.ellipse(r() * w, r() * h, 40 + r() * 200, 1.5 + r() * 5, 0, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    if (spot) { x.fillStyle = spot[0]; x.globalAlpha = 0.85; x.beginPath(); x.ellipse(w * spot[1], h * spot[2], spot[3], spot[3] * 0.5, 0, 0, 7); x.fill(); x.globalAlpha = 1; }
  });
}
function rocky(base, spots, seed, caps) {
  return canvasTex((x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h); const r = rng(seed);
    for (let k = 0; k < 1500; k++) { x.globalAlpha = 0.05 + r() * 0.12; x.fillStyle = spots[Math.floor(r() * spots.length)]; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * r() * 40, 0, 7); x.fill(); }
    for (let k = 0; k < 120; k++) {
      const cx = r() * w, cy = r() * h, cr = 2 + r() * r() * 20;
      x.globalAlpha = 0.25; x.strokeStyle = '#000'; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, cr, 0, 7); x.stroke();
      x.globalAlpha = 0.1; x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - cr * 0.2, cy - cr * 0.2, cr * 0.8, 0, 7); x.fill();
    }
    x.globalAlpha = 1; if (caps) { x.fillStyle = caps; x.fillRect(0, 0, w, h * 0.035); x.fillRect(0, h * 0.965, w, h * 0.035); }
  });
}
function earthFallback() {
  return canvasTex((x, w, h) => {
    x.fillStyle = '#163e7a'; x.fillRect(0, 0, w, h); const r = rng(11);
    for (const [cx, cy, rx, ry] of [[0.18, 0.33, 0.1, 0.15], [0.28, 0.68, 0.05, 0.15], [0.52, 0.28, 0.06, 0.08], [0.54, 0.58, 0.07, 0.16], [0.7, 0.3, 0.16, 0.12], [0.83, 0.72, 0.05, 0.06]])
      for (let i = 0; i < 220; i++) { x.fillStyle = ['#3c7a3a', '#6b8f3e', '#a08a55', '#2f6a35'][Math.floor(r() * 4)]; x.beginPath(); x.ellipse((cx + (r() - 0.5) * rx * 2) * w, (cy + (r() - 0.5) * ry * 2) * h, 6 + r() * 16, 4 + r() * 10, r() * 3, 0, 7); x.fill(); }
    x.fillStyle = '#eef3ff'; x.fillRect(0, 0, w, h * 0.04); x.fillRect(0, h * 0.96, w, h * 0.04);
  });
}

const TEXTURES = {
  mercury: () => rocky('#8d8780', ['#6a645e', '#a9a39c', '#5a5550'], 5),
  venus: () => gas(['#e9cf98', '#d9b672', '#f1dcaa', '#cfa463', '#e2c287'], 7),
  mars: () => rocky('#b4532b', ['#8e3a1b', '#cf7042', '#6e2c15', '#d88a55'], 17, '#f3ece4'),
  jupiter: () => gas(['#d9b98f', '#c18d60', '#f1dfc4', '#a9714a', '#e7cba2', '#8e5e3c'], 19, ['#b4502e', 0.66, 0.62, 50]),
  saturn: () => gas(['#eadab0', '#d6be88', '#f3e6c2', '#c6a870', '#e0cb98'], 23),
  uranus: () => gas(['#a6e4ea', '#94d6de', '#b8eef2', '#8ccbd6'], 29),
  neptune: () => gas(['#3d63dc', '#2f50c2', '#5a7ee9', '#2a46aa'], 31, ['#1b2c7c', 0.4, 0.6, 30]),
  io: () => rocky('#e6d35c', ['#c9822e', '#fff3a0', '#9c5a1e', '#f0b040'], 37),
  europa: () => rocky('#dcd2c2', ['#b89a7a', '#efe8dc', '#a07858'], 41),
  ice: () => rocky('#c8d3db', ['#98a6b2', '#eef3f7', '#b0bcc6'], 43),
  rock: () => rocky('#7c6c5e', ['#5a4c40', '#9a8a7a', '#4a3e34'], 47),
  titan: () => gas(['#d9a24a', '#c98f3a', '#e6b460', '#b8802e'], 53),
};

export function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.02, 25000);
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  scene.add(new THREE.AmbientLight(0x404a60, 0.6));
  scene.add(new THREE.PointLight(0xfff2dd, 3, 0, 0));

  // texture loading with safe fallback (never a black placeholder)
  const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  const texCache = {};
  const tex = (k) => (texCache[k] ??= TEXTURES[k]());
  function remote(file, fallback, onLoad) {
    loader.load(TEX_URL + file, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; onLoad(t); }, undefined, () => {});
    return fallback;
  }

  // ---------- stars ----------
  {
    const n = 7000, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new THREE.Color();
    const axis = new THREE.Vector3(1, 0, 0.3).normalize();
    for (let i = 0; i < n; i++) {
      const band = i < 3000, r = 9000 + Math.random() * 5000, t = Math.random() * Math.PI * 2;
      const u = band ? Math.PI / 2 + (Math.random() - 0.5) * 0.3 * (Math.random() + 0.3) : Math.acos(2 * Math.random() - 1);
      const v = new THREE.Vector3(r * Math.sin(u) * Math.cos(t), r * Math.cos(u), r * Math.sin(u) * Math.sin(t)).applyAxisAngle(axis, 1);
      p.set([v.x, v.y, v.z], i * 3);
      col.setHSL(0.58 + (Math.random() - 0.5) * 0.25, 0.4, band ? 0.35 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4);
      c.set([col.r, col.g, col.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true })));
  }

  const glowTex = canvasTex((x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,200,110,.5)'); g.addColorStop(0.25, 'rgba(255,140,40,.16)'); g.addColorStop(0.55, 'rgba(255,90,10,.03)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, 256, 256);

  // ---------- sun ----------
  const sunMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 } },
    vertexShader: `varying vec3 p;varying vec3 n;varying vec3 v;void main(){p=position;n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float t;varying vec3 p;varying vec3 n;varying vec3 v;
      float h(vec3 q){return fract(sin(dot(q,vec3(127.1,311.7,74.7)))*43758.5453);}
      float no(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
        return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 x){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*no(x);x*=2.1;a*=.5;}return s;}
      void main(){vec3 q=normalize(p)*3.;float f=fbm(q+vec3(t*.05,t*.03,0.)+fbm(q*2.-t*.04));
        vec3 col=mix(vec3(1.,.35,.02),vec3(1.,.85,.4),f);col+=pow(f,4.)*vec3(1.,.9,.6);
        float limb=pow(max(dot(n,v),0.),.4);gl_FragColor=vec4(col*(.75+.4*limb),1.);}`,
  });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN.r, 64, 64), sunMat);
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  corona.scale.set(SUN.r * 4.5, SUN.r * 4.5, 1); sun.add(corona); scene.add(sun);

  const bodies = [{ ...SUN, obj: sun, mesh: sun, family: null }];
  const movers = [];

  const orbitLine = (radius, color, opacity = 0.18) => {
    const pts = []; for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)); }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  };

  let earthClouds = null;
  for (const P of PLANETS) {
    const anchor = new THREE.Object3D(); scene.add(anchor); scene.add(orbitLine(P.d, P.color));
    let mat;
    if (P.tex === 'earth') {
      mat = new THREE.MeshPhongMaterial({ map: earthFallback(), specular: new THREE.Color(0x333333), shininess: 18 });
      remote('earth_atmos_2048.jpg', null, (t) => { mat.map = t; mat.needsUpdate = true; });
      remote('earth_specular_2048.jpg', null, (t) => { mat.specularMap = t; mat.needsUpdate = true; });
    } else mat = new THREE.MeshStandardMaterial({ map: tex(P.tex), roughness: 0.95 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(P.r, 64, 48), mat);
    const tiltG = new THREE.Object3D(); tiltG.rotation.z = P.tilt || 0; tiltG.add(mesh); anchor.add(tiltG);
    if (P.tex === 'earth') {
      remote('earth_clouds_1024.png', null, (t) => {
        earthClouds = new THREE.Mesh(new THREE.SphereGeometry(P.r * 1.012, 64, 48), new THREE.MeshPhongMaterial({ map: t, transparent: true, opacity: 0.8, depthWrite: false }));
        mesh.add(earthClouds);
      });
    }
    if (P.atmosphere) anchor.add(atmosphere(P.r, P.atmosphere));
    if (P.rings) mesh.add(saturnRings());
    const planet = { ...P, kind: 'Planet', obj: anchor, mesh, family: null, phase: Math.random() * 6.28, spin: 0.15 };
    planet.family = planet;
    movers.push(planet); bodies.push(planet);

    for (const M of P.moons || []) {
      const sys = new THREE.Object3D(); anchor.add(sys); sys.add(orbitLine(M.d, 0x9aa8c0, 0.25));
      const a = new THREE.Object3D(); sys.add(a);
      const mm = M.tex === 'moon'
        ? new THREE.MeshStandardMaterial({ map: tex('rock'), roughness: 1 })
        : new THREE.MeshStandardMaterial({ map: tex(M.tex), roughness: 1 });
      if (M.tex === 'moon') remote('moon_1024.jpg', null, (t) => { mm.map = t; mm.needsUpdate = true; });
      const m = new THREE.Mesh(new THREE.SphereGeometry(M.r, 32, 24), mm); a.add(m);
      const o = { ...M, kind: 'Moon of ' + P.name, obj: a, mesh: m, family: planet, phase: Math.random() * 6.28, spin: 0.05, period: Math.max(Math.abs(M.period), 3) * Math.sign(M.period) };
      movers.push(o); bodies.push(o);
    }
    for (const S of P.sats || []) {
      const sys = new THREE.Object3D(); sys.rotation.x = S.incl * 0.12; sys.rotation.y = Math.random() * 6; anchor.add(sys);
      sys.add(orbitLine(S.d, S.color, 0.5));
      const a = new THREE.Object3D(); sys.add(a);
      const m = satelliteModel(Math.max(P.r * 0.025, 0.05) * (S.big || 1), S.color); a.add(m);
      const o = { ...S, kind: 'Satellite · ' + P.name, obj: a, mesh: m, family: planet, r: m.userData.size * 2.5, phase: Math.random() * 6.28, sat: true };
      movers.push(o); bodies.push(o);
    }
  }

  function atmosphere(radius, color) {
    return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.08, 48, 32), new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(color) } },
      vertexShader: `varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `uniform vec3 c;varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(n,v)),4.)*.8;gl_FragColor=vec4(c*f,f);}`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
  }
  function saturnRings() {
    const rt = canvasTex((x, w, h) => { const r = rng(9); for (let i = 0; i < w; i++) { const f = i / w; let a = 0.15 + r() * 0.5; if (f > 0.55 && f < 0.6) a = 0.03; if (f < 0.08) a *= 0.3; const g = 190 + Math.floor(r() * 50); x.fillStyle = `rgba(${g},${g - 15},${g - 55},${a})`; x.fillRect(i, 0, 1, h); } }, 1024, 4);
    const geo = new THREE.RingGeometry(8.8, 16, 128, 1); const pos = geo.attributes.position, uv = geo.attributes.uv, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); uv.setXY(i, (v.length() - 8.8) / 7.2, 0.5); }
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: rt, side: THREE.DoubleSide, transparent: true, roughness: 1, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; return m;
  }
  function satelliteModel(s, color) {
    const g = new THREE.Group(); g.userData.size = s;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(s * 0.6, s * 0.6, s * 2.2, 10), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.8, roughness: 0.3 })));
    const pm = new THREE.MeshStandardMaterial({ color: 0x1a3a8a, emissive: 0x0a1a50, metalness: 0.6, roughness: 0.4 });
    for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(s * 4, s * 0.05, s * 1.4), pm); p.position.x = sx * s * 2.7; g.add(p); }
    const b = new THREE.Mesh(new THREE.SphereGeometry(s * 0.35, 8, 8), new THREE.MeshBasicMaterial({ color })); b.position.y = s * 1.3; g.add(b);
    return g;
  }

  // ---------- simulation step ----------
  let time = 0, days = 0;
  function update(dt) {
    time += dt; days += dt * 2;
    sunMat.uniforms.t.value = time; sun.rotation.y += dt * 0.02;
    for (const o of movers) {
      const a = o.phase + (o.sat ? time / o.secs : days / o.period) * Math.PI * 2;
      o.obj.position.set(Math.cos(a) * o.d, 0, -Math.sin(a) * o.d);
      if (o.sat) o.mesh.rotation.y = -a; else o.mesh.rotation.y += dt * o.spin;
    }
    if (earthClouds) earthClouds.rotation.y += dt * 0.01;
  }

  return { renderer, scene, camera, bodies, update };
}
