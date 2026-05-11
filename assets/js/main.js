/* =========================================================
   HEYDAR ALIYEV CENTER — INTERACTIVE LAYER · v3
   ========================================================= */

document.documentElement.classList.remove('no-cursor');

/* =========================================================
   LOADER
   ========================================================= */
const loader = (() => {
  const el      = document.getElementById('loader');
  const counter = document.getElementById('loaderCount');
  function tick() {
    return new Promise(resolve => {
      let p = 0;
      const id = setInterval(() => {
        p += Math.random() * 7 + 3;
        if (p >= 100) { p = 100; clearInterval(id); }
        counter.textContent = String(Math.floor(p)).padStart(3, '0');
        document.documentElement.style.setProperty('--loader-p', p / 100);
        if (p >= 100) setTimeout(resolve, 300);
      }, 70);
    });
  }
  function hide() {
    el.classList.add('is-done');
    document.body.classList.remove('no-scroll');
  }
  return { tick, hide };
})();

const loaderStyle = document.createElement('style');
loaderStyle.textContent = `.loader__bar::after { transform: scaleX(var(--loader-p, 0)); }`;
document.head.appendChild(loaderStyle);

document.body.classList.add('no-scroll');

setTimeout(() => {
  loader.hide();
  document.querySelectorAll('.rv, .rv-line, .split, .img-reveal').forEach(el => el.classList.add('in'));
}, 5000);

function bootApp() {
  try {
    loader.tick().then(() => {
      loader.hide();
      try { initRevealAnimations(); } catch(e) { console.warn(e); }
      try { initHeroIntro();        } catch(e) { console.warn(e); }
    });
  } catch (err) {
    console.error('boot failed', err);
    loader.hide();
    document.querySelectorAll('.rv, .rv-line, .split, .img-reveal').forEach(el => el.classList.add('in'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

/* =========================================================
   CUSTOM CURSOR (desktop)
   ========================================================= */
(() => {
  if (matchMedia('(max-width: 1024px)').matches) return;
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
  const dot  = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  let mx = innerWidth/2, my = innerHeight/2, dx = mx, dy = my, rx = mx, ry = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => cursor.classList.add('is-drag'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('is-drag'));
  const interactive = 'a, button, .gallery__item, .room, .form-section__visual, .viewer__stage, [data-cursor=link]';
  document.addEventListener('mouseover', e => { if (e.target.closest(interactive)) cursor.classList.add('is-link'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(interactive)) cursor.classList.remove('is-link'); });
  function loop() {
    dx += (mx - dx) * .7;
    dy += (my - dy) * .7;
    rx += (mx - rx) * .18;
    ry += (my - ry) * .18;
    dot.style.transform  = `translate3d(${dx}px, ${dy}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* =========================================================
   NAV
   ========================================================= */
(() => {
  const nav    = document.getElementById('nav');
  const toggle = document.querySelector('.nav__toggle');
  let scrolled = false;
  window.addEventListener('scroll', () => {
    const s = scrollY > 60;
    if (s !== scrolled) { scrolled = s; nav.classList.toggle('is-scrolled', s); }
  }, { passive: true });
  toggle?.addEventListener('click', () => nav.classList.toggle('is-open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));
})();

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
function initRevealAnimations() {
  document.querySelectorAll('.split').forEach(el => {
    if (el.dataset.splitDone) return;
    const text = el.textContent;
    let i = 0;
    el.innerHTML = text.split(/(\s+)/).map(w => {
      if (w.trim() === '') return w;
      const delay = (i++ * 0.055).toFixed(3);
      return `<span class="word"><span class="inner" style="transition-delay:${delay}s">${w}</span></span>`;
    }).join('');
    el.dataset.splitDone = '1';
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rv, .rv-line, .split, .img-reveal').forEach(el => io.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const cIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cIO.unobserve(e.target); } });
  }, { threshold: .55 });
  counters.forEach(c => cIO.observe(c));
}

function runCounter(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 2200;
  const start = performance.now();
  const isInt = decimals === 0;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = eased * target;
    el.textContent = isInt ? Math.floor(v).toLocaleString('es') : v.toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = isInt ? target.toLocaleString('es') : target.toFixed(decimals);
  }
  requestAnimationFrame(step);
}

function initHeroIntro() {
  document.querySelectorAll('.hero .split').forEach(el => el.classList.add('in'));
  document.querySelectorAll('.hero .rv').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 200 + i * 80);
  });
}

/* =========================================================
   LIGHTBOX
   ========================================================= */
(() => {
  const lb     = document.getElementById('lightbox');
  const lbImg  = lb.querySelector('img');
  const lbCap  = lb.querySelector('.lightbox__cap');
  const close  = lb.querySelector('.lightbox__close');
  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = item.dataset.cap || img.alt || '';
      lb.classList.add('is-open');
      document.body.classList.add('no-scroll');
    });
  });
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }
  close.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();

/* =========================================================
   THREE.JS — HERO BACKGROUND PARAMETRIC SHEET
   ========================================================= */
(() => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.6, 11);

  const segX = 80, segY = 50;
  const geo = new THREE.BufferGeometry();
  const pos = [], idx = [];
  for (let j = 0; j <= segY; j++) {
    for (let i = 0; i <= segX; i++) {
      const u = i / segX, v = j / segY;
      const x = (u - .5) * 22;
      const z = (v - .5) * 12;
      const y =
        Math.sin(u * Math.PI) * 2.8 +
        Math.cos(v * Math.PI * .9) * .6 +
        Math.sin((u * 2.2 + v * .7) * Math.PI) * .35 +
        Math.exp(-Math.pow((u - .5) * 2.7, 2)) * 1.4 - 1.4;
      pos.push(x, y, z);
    }
  }
  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i, b = a + 1, c = a + (segX + 1), d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();

  const wireMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color: 0xb08d4a, wireframe: true, transparent: true, opacity: .35,
  }));
  scene.add(wireMesh);

  const pCount = 1500;
  const pGeo = new THREE.BufferGeometry();
  const pArr = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pArr[i*3+0] = (Math.random() - .5) * 60;
    pArr[i*3+1] = (Math.random() - .5) * 30;
    pArr[i*3+2] = (Math.random() - .5) * 30;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd6b575, size: 0.03, transparent: true, opacity: .55 }));
  scene.add(points);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth - .5) * 2;
    my = (e.clientY / innerHeight - .5) * 2;
  });
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  let t = 0;
  function loop() {
    requestAnimationFrame(loop);
    t += .005;
    wireMesh.rotation.y = mx * .15 + Math.sin(t * .25) * .08;
    wireMesh.rotation.x = my * .06 + Math.sin(t * .18) * .04;
    points.rotation.y = t * .05;
    renderer.render(scene, camera);
  }
  loop();
})();

/* =========================================================
   THREE.JS — INTERACTIVE BUILDING VIEWER · v3
   STL with Physical material, view presets, smoother controls.
   ========================================================= */
(() => {
  const canvas = document.getElementById('viewerCanvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  if (THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf2ede2, 38, 110);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 1000);

  // ── Studio-style 3-point lighting for clean white architectural model ──
  scene.add(new THREE.AmbientLight(0xffffff, .55));

  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(7, 14, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -14;
  key.shadow.camera.right = 14;
  key.shadow.camera.top = 14;
  key.shadow.camera.bottom = -14;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 60;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 4;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xeaf1ff, .7);
  fill.position.set(-9, 5, 4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xfff1d4, .85);
  rim.position.set(-3, 9, -10);
  scene.add(rim);

  const sky = new THREE.HemisphereLight(0xf6f1e6, 0xc4bda9, .55);
  scene.add(sky);

  const goldAccent = new THREE.PointLight(0xc6a368, .55, 40, 2);
  goldAccent.position.set(6, 3, -5);
  scene.add(goldAccent);

  // ── Material: clean architectural white, soft sheen ──
  const useStdMat = !THREE.MeshPhysicalMaterial;
  const mat = useStdMat
    ? new THREE.MeshStandardMaterial({ color: 0xfafaf6, roughness: .42, metalness: .02, side: THREE.DoubleSide })
    : new THREE.MeshPhysicalMaterial({
        color: 0xfafaf6, roughness: .42, metalness: .02,
        clearcoat: .35, clearcoatRoughness: .55,
        sheen: .15, sheenRoughness: .6,
        side: THREE.DoubleSide,
      });

  // ── Plinth (subtle stone disc) ──
  const plinth = new THREE.Mesh(
    new THREE.CircleGeometry(18, 96),
    new THREE.MeshStandardMaterial({ color: 0xe6dfd0, roughness: .92, metalness: 0 })
  );
  plinth.rotation.x = -Math.PI / 2;
  plinth.position.y = -2.5;
  plinth.receiveShadow = true;
  scene.add(plinth);

  // ── Single subtle reference ring (instead of 4 noisy ones) ──
  const ringGroup = new THREE.Group();
  const refRingGeo = new THREE.RingGeometry(11.9, 12, 128);
  const refRingMat = new THREE.MeshBasicMaterial({
    color: 0xb08d4a, transparent: true, opacity: .18, side: THREE.DoubleSide,
  });
  const refRing = new THREE.Mesh(refRingGeo, refRingMat);
  refRing.rotation.x = -Math.PI / 2;
  refRing.position.y = -2.49;
  ringGroup.add(refRing);
  scene.add(ringGroup);

  const modelGroup = new THREE.Group();
  modelGroup.position.y = -2.5;
  scene.add(modelGroup);

  const loadingEl = document.getElementById('viewerLoading');
  const statusEl  = document.getElementById('viewerLabelStatus');
  const fpsEl     = document.getElementById('viewerLabelFps');
  const setStatus = txt => statusEl && (statusEl.textContent = txt);

  function fitAndCenter(geometry) {
    geometry.computeBoundingBox();
    let bb = geometry.boundingBox;
    let size = new THREE.Vector3(); bb.getSize(size);
    // Auto-detect Z-up STL: the building is wider than tall, so the "vertical" axis
    // should be the SMALLEST of the three. If Z is smaller than Y, the file is Z-up.
    if (size.z < size.y) {
      geometry.rotateX(-Math.PI / 2);
      geometry.computeBoundingBox();
      bb = geometry.boundingBox;
      size = new THREE.Vector3(); bb.getSize(size);
    }
    const center = new THREE.Vector3(); bb.getCenter(center);
    geometry.translate(-center.x, -bb.min.y, -center.z);
    const target = 12;
    const maxDim = Math.max(size.x, size.z);
    const scale = target / maxDim;
    geometry.scale(scale, scale, scale);
  }

  function buildFallback() {
    const sX = 140, sY = 70;
    const geo = new THREE.BufferGeometry();
    const pos = [], idx = [];
    function bump(u, v, cu, cv, h, wu, wv) {
      const du = (u - cu) / wu, dv = (v - cv) / wv;
      return h * Math.exp(-(du*du + dv*dv));
    }
    for (let j = 0; j <= sY; j++) {
      for (let i = 0; i <= sX; i++) {
        const u = i / sX, v = j / sY;
        const x = (u - .5) * 14;
        const z = (v - .5) * 6;
        const a1 = bump(u, v, .32, .55, 4.6, .18, .28);
        const a2 = bump(u, v, .68, .48, 3.0, .22, .30);
        const a3 = bump(u, v, .88, .50, 1.2, .14, .35);
        const sk = Math.exp(-Math.pow((u - .5) * 2.4, 4)) * Math.exp(-Math.pow((v - .5) * 2.4, 4));
        const ripple = Math.sin(u * Math.PI * 14) * Math.cos(v * Math.PI * 5) * .04;
        const y = Math.max(a1, a2, a3) * (sk * 1.6 + .55) + ripple - .1;
        pos.push(x, y, z);
      }
    }
    for (let j = 0; j < sY; j++) {
      for (let i = 0; i < sX; i++) {
        const a = j * (sX + 1) + i, b = a + 1, c = a + (sX + 1), d = c + 1;
        idx.push(a, b, d, a, d, c);
      }
    }
    geo.setIndex(idx);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    modelGroup.add(mesh);
    setStatus('Mesh · paramétrico');
  }

  function tryLoadSTL() {
    if (!THREE.STLLoader) {
      buildFallback();
      loadingEl?.classList.add('is-done');
      return;
    }
    const stlLoader = new THREE.STLLoader();
    stlLoader.load(
      'assets/models/heydar.stl',
      geometry => {
        fitAndCenter(geometry);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = true; mesh.receiveShadow = true;
        modelGroup.add(mesh);
        // Whisper-thin wireframe reading (paramétrico de Hadid)
        const wf = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          color: 0x1f3a5f, wireframe: true, transparent: true, opacity: .022
        }));
        wf.scale.setScalar(1.0008);
        modelGroup.add(wf);
        setStatus('STL · Printables 1296501');
        loadingEl?.classList.add('is-done');
      },
      xhr => {
        if (xhr.lengthComputable && loadingEl) {
          const pct = (xhr.loaded / xhr.total * 100).toFixed(0);
          const span = loadingEl.querySelector('span');
          if (span) span.textContent = `Cargando · ${pct}%`;
        }
      },
      err => {
        console.warn('STL load failed, using fallback:', err);
        buildFallback();
        loadingEl?.classList.add('is-done');
      }
    );
  }
  tryLoadSTL();

  // Camera state — slightly closer and lower for more presence
  const state = {
    theta: .85, phi: 1.12, radius: 17,
    targetTheta: .85, targetPhi: 1.12, targetRadius: 17,
    auto: true,
  };
  const VIEWS = {
    iso:   { theta: .85,            phi: 1.12, radius: 17 },
    front: { theta: 0,              phi: 1.32, radius: 18 },
    side:  { theta: Math.PI / 2,    phi: 1.32, radius: 18 },
    top:   { theta: .15,            phi: 0.18, radius: 19 },
    reset: { theta: .85,            phi: 1.12, radius: 17 },
  };

  function setView(name) {
    const v = VIEWS[name];
    if (!v) return;
    state.targetTheta  = v.theta;
    state.targetPhi    = v.phi;
    state.targetRadius = v.radius;
    state.auto = false;
    document.querySelectorAll('.viewer__btn').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  }
  document.querySelectorAll('.viewer__btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  // Drag controls
  let drag = false, prevX = 0, prevY = 0;
  const onDown = e => {
    drag = true; state.auto = false;
    prevX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    prevY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  };
  const onUp   = () => { drag = false; };
  const onMove = e => {
    if (!drag) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    state.targetTheta -= (x - prevX) * .009;
    state.targetPhi   = Math.max(.05, Math.min(Math.PI * .5, state.targetPhi + (y - prevY) * .008));
    prevX = x; prevY = y;
  };
  canvas.addEventListener('mousedown', onDown);
  addEventListener('mouseup', onUp);
  addEventListener('mousemove', onMove);
  canvas.addEventListener('touchstart', e => onDown(e), { passive: true });
  addEventListener('touchend', onUp);
  addEventListener('touchmove', e => onMove(e), { passive: true });
  canvas.addEventListener('wheel', e => {
    state.targetRadius = Math.max(7, Math.min(32, state.targetRadius + e.deltaY * .015));
    state.auto = false;
    e.preventDefault();
  }, { passive: false });

  // Resume auto-orbit after inactivity
  let lastInteraction = performance.now();
  ['mousedown','wheel','touchstart','keydown'].forEach(ev => {
    canvas.addEventListener(ev, () => { lastInteraction = performance.now(); }, { passive: true });
  });
  document.querySelectorAll('.viewer__btn').forEach(b => {
    b.addEventListener('click', () => { lastInteraction = performance.now(); });
  });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  let frames = 0, fpsLast = performance.now();
  function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    if (state.auto || now - lastInteraction > 4500) {
      state.auto = true;
      state.targetTheta += .002;
    }
    state.theta  += (state.targetTheta  - state.theta)  * .08;
    state.phi    += (state.targetPhi    - state.phi)    * .08;
    state.radius += (state.targetRadius - state.radius) * .08;

    camera.position.x = state.radius * Math.sin(state.phi) * Math.sin(state.theta);
    camera.position.y = state.radius * Math.cos(state.phi) * .85 + 1.1;
    camera.position.z = state.radius * Math.sin(state.phi) * Math.cos(state.theta);
    camera.lookAt(0, .9, 0);

    ringGroup.rotation.y += .0008;
    renderer.render(scene, camera);

    frames++;
    if (now - fpsLast > 1000) {
      const fps = Math.round(frames * 1000 / (now - fpsLast));
      if (fpsEl) fpsEl.textContent = `WebGL · ${fps} fps`;
      frames = 0;
      fpsLast = now;
    }
  }
  loop();
})();

/* =========================================================
   AMBIENT TOPOGRAPHIC LINES — drifting contour map
   ========================================================= */
(() => {
  const canvas = document.getElementById('ambientTopo');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function hash(x, y) {
    let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function valueNoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi,         yf = y - yi;
    const u = smooth(xf),      v = smooth(yf);
    const a = hash(xi,   yi);
    const b = hash(xi+1, yi);
    const c = hash(xi,   yi+1);
    const d = hash(xi+1, yi+1);
    return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
  }
  function fbm(x, y, t) {
    let total = 0, amp = .55, freq = 1;
    for (let i = 0; i < 3; i++) {
      total += valueNoise(x * freq + t * .12, y * freq - t * .08) * amp;
      amp *= .5; freq *= 2;
    }
    return total;
  }

  let time = 0;
  function loop() {
    requestAnimationFrame(loop);
    if (!reduceMotion) time += 0.0035;
    ctx.clearRect(0, 0, w, h);

    const cell = 24;
    const cols = Math.ceil(w / cell) + 2;
    const rows = Math.ceil(h / cell) + 2;
    const field = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        field[j * cols + i] = fbm(i * .15, j * .15, time);
      }
    }
    const levels = [.30, .42, .54, .66];
    const colors = [
      'rgba(176,141,74,0.20)',
      'rgba(176,141,74,0.13)',
      'rgba(31,58,95,0.10)',
      'rgba(214,181,117,0.08)',
    ];
    for (let l = 0; l < levels.length; l++) {
      const lvl = levels[l];
      ctx.beginPath();
      ctx.strokeStyle = colors[l];
      ctx.lineWidth = 1;
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const a = field[j * cols + i];
          const b = field[j * cols + (i + 1)];
          const c = field[(j + 1) * cols + (i + 1)];
          const d = field[(j + 1) * cols + i];
          let code = 0;
          if (a > lvl) code |= 1;
          if (b > lvl) code |= 2;
          if (c > lvl) code |= 4;
          if (d > lvl) code |= 8;
          const x0 = i * cell, y0 = j * cell;
          const lerp = (p, q) => (lvl - p) / (q - p);
          const T = () => [x0 + cell * lerp(a, b), y0];
          const R = () => [x0 + cell, y0 + cell * lerp(b, c)];
          const B = () => [x0 + cell * lerp(d, c), y0 + cell];
          const L = () => [x0, y0 + cell * lerp(a, d)];
          const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
          switch (code) {
            case 1: case 14: seg(T(), L()); break;
            case 2: case 13: seg(T(), R()); break;
            case 4: case 11: seg(R(), B()); break;
            case 8: case 7:  seg(L(), B()); break;
            case 3: case 12: seg(L(), R()); break;
            case 6: case 9:  seg(T(), B()); break;
            case 5:          seg(T(), L()); seg(R(), B()); break;
            case 10:         seg(T(), R()); seg(L(), B()); break;
          }
        }
      }
      ctx.stroke();
    }
  }
  loop();
})();

/* =========================================================
   AMBIENT DUST — gentle particles, attracted to cursor
   ========================================================= */
(() => {
  const canvas = document.getElementById('ambientDust');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  const COUNT = reduceMotion ? 0 : 60;
  const dust = [];
  for (let i = 0; i < COUNT; i++) {
    dust.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + .4,
      vx: (Math.random() - .5) * .08,
      vy: -(Math.random() * .12 + .03),
      a: Math.random() * .35 + .12,
      tw: Math.random() * Math.PI * 2,
    });
  }
  let mx = w/2, my = h/2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function loop() {
    requestAnimationFrame(loop);
    if (!COUNT) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of dust) {
      const dx = mx - p.x, dy = my - p.y, d2 = dx*dx + dy*dy;
      if (d2 < 40000) { p.vx += dx * .000004; p.vy += dy * .000004; }
      p.x += p.vx; p.y += p.vy; p.tw += .02;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      const a = p.a * (.7 + .3 * Math.sin(p.tw));
      ctx.beginPath();
      ctx.fillStyle = `rgba(176, 141, 74, ${a.toFixed(3)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  loop();
})();

/* =========================================================
   PARALLAX SCROLL ELEMENTS
   ========================================================= */
(() => {
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;
  function update() {
    const vh = innerHeight;
    items.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const center = rect.top + rect.height / 2;
      const offset = (center - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

/* =========================================================
   SECTION INDEX (live current section in nav)
   ========================================================= */
(() => {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__list a, .nav__menu a');
  if (!sections.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(a => { a.style.opacity = a.getAttribute('href') === '#' + id ? '1' : ''; });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
})();
