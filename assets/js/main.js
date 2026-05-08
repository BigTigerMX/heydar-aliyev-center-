/* =========================================================
   HEYDAR ALIYEV CENTER — INTERACTIVE LAYER
   ========================================================= */

document.documentElement.classList.remove('no-cursor');

/* =========================================================
   1. LOADER
   ========================================================= */
const loader = (() => {
  const el     = document.getElementById('loader');
  const counter= document.getElementById('loaderCount');
  const bar    = document.querySelector('.loader__bar');
  let progress = 0;

  function set(p) {
    progress = Math.min(p, 100);
    counter.textContent = String(Math.floor(progress)).padStart(3, '0');
    bar.style.setProperty('--p', progress / 100);
    bar.querySelector('::after');
    bar.children[0] && (bar.children[0].style.transform = `scaleX(${progress / 100})`);
    // Use after pseudo via style
    bar.style.setProperty('background-size', `${progress}% 100%`);
  }

  // animate the after via JS
  const styleSheet = document.styleSheets[0];

  function tick() {
    return new Promise(resolve => {
      let p = 0;
      const id = setInterval(() => {
        p += Math.random() * 7 + 2;
        if (p >= 100) { p = 100; clearInterval(id); }
        counter.textContent = String(Math.floor(p)).padStart(3, '0');
        bar.style.setProperty('--p', p / 100);
        // Style after pseudo via inline injected style
        document.documentElement.style.setProperty('--loader-p', p / 100);
        if (p >= 100) {
          setTimeout(resolve, 350);
        }
      }, 80);
    });
  }

  function hide() {
    el.classList.add('is-done');
    document.body.classList.remove('no-scroll');
  }

  return { tick, hide };
})();

// Hook the after pseudo using a small style rule
const loaderStyle = document.createElement('style');
loaderStyle.textContent = `.loader__bar::after { transform: scaleX(var(--loader-p, 0)); }`;
document.head.appendChild(loaderStyle);

document.body.classList.add('no-scroll');

// SAFETY NET — force-show everything after 5s even if something fails
setTimeout(() => {
  loader.hide();
  document.querySelectorAll('.rv, .rv-line, .split, .img-reveal').forEach(el => el.classList.add('in'));
}, 5000);

// Run on DOMContentLoaded (page parsed) instead of load (all images loaded)
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
   2. CUSTOM CURSOR (desktop)
   ========================================================= */
(() => {
  if (matchMedia('(max-width: 1024px)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
  const dot  = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let dx = mx, dy = my;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.addEventListener('mousedown', () => cursor.classList.add('is-drag'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('is-drag'));

  const interactive = 'a, button, .gallery__item, .room, .form-section__visual, .viewer__canvas, .nav__toggle, [data-cursor=link]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactive)) cursor.classList.add('is-link');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactive)) cursor.classList.remove('is-link');
  });

  function loop() {
    dx += (mx - dx) * 0.7;
    dy += (my - dy) * 0.7;
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform  = `translate3d(${dx}px, ${dy}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* =========================================================
   3. NAV
   ========================================================= */
(() => {
  const nav    = document.getElementById('nav');
  const toggle = document.querySelector('.nav__toggle');

  let scrolled = false;
  window.addEventListener('scroll', () => {
    const s = window.scrollY > 60;
    if (s !== scrolled) {
      scrolled = s;
      nav.classList.toggle('is-scrolled', s);
    }
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });
})();

/* =========================================================
   4. SCROLL REVEAL
   ========================================================= */
function initRevealAnimations() {
  // Wrap text marked .split with .word > .inner spans, each with stagger delay
  document.querySelectorAll('.split').forEach(el => {
    if (el.dataset.splitDone) return;
    const text = el.textContent;
    let i = 0;
    el.innerHTML = text
      .split(/(\s+)/)
      .map(w => {
        if (w.trim() === '') return w;
        const delay = (i++ * 0.055).toFixed(3);
        return `<span class="word"><span class="inner" style="transition-delay:${delay}s">${w}</span></span>`;
      })
      .join('');
    el.dataset.splitDone = '1';
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.rv, .rv-line, .split, .img-reveal').forEach(el => io.observe(el));

  // Counters
  const counters = document.querySelectorAll('[data-count]');
  const cIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { runCounter(e.target); cIO.unobserve(e.target); }
    });
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
    el.textContent = isInt
      ? Math.floor(v).toLocaleString('es')
      : v.toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = isInt ? target.toLocaleString('es') : target.toFixed(decimals);
  }
  requestAnimationFrame(step);
}

/* =========================================================
   5. HERO INTRO
   ========================================================= */
function initHeroIntro() {
  document.querySelectorAll('.hero .split').forEach(el => el.classList.add('in'));
  document.querySelectorAll('.hero .rv').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 200 + i * 80);
  });
}

/* =========================================================
   6. LIGHTBOX
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
   7. THREE.JS — HERO BACKGROUND PARAMETRIC MESH
   ========================================================= */
(() => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.6, 11);
  camera.lookAt(0, 0, 0);

  /* parametric flowing surface */
  const segX = 80, segY = 50;
  const geo = new THREE.BufferGeometry();
  const pos = [];
  const idx = [];

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
      const a = j * (segX + 1) + i;
      const b = a + 1, c = a + (segX + 1), d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xb08d4a, wireframe: true, transparent: true, opacity: .35,
  });
  const wireMesh = new THREE.Mesh(geo, wireMat);
  scene.add(wireMesh);

  /* particles */
  const pCount = 1500;
  const pGeo = new THREE.BufferGeometry();
  const pArr = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pArr[i*3+0] = (Math.random() - .5) * 60;
    pArr[i*3+1] = (Math.random() - .5) * 30;
    pArr[i*3+2] = (Math.random() - .5) * 30;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const points = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0xd6b575, size: 0.03, transparent: true, opacity: .55 })
  );
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
  window.addEventListener('resize', resize);

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
   8. THREE.JS — INTERACTIVE BUILDING VIEWER
   Loads STL from assets/models/heydar.stl (the Printables model
   used for the physical maqueta). Falls back to a parametric
   shell if the STL is missing.
   ========================================================= */
(() => {
  const canvas = document.getElementById('viewerCanvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
  camera.position.set(7, 4, 11);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, .55));
  const sun = new THREE.DirectionalLight(0xfff5e8, 1.4);
  sun.position.set(8, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 15;
  sun.shadow.camera.bottom = -15;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xb08d4a, .5);
  rim.position.set(-6, 4, -4);
  scene.add(rim);
  const fill = new THREE.HemisphereLight(0xefeae0, 0x9a9388, .35);
  scene.add(fill);

  // Material — Heydar Aliyev fachada blanca
  const mat = new THREE.MeshPhongMaterial({
    color: 0xfafaf6,
    specular: 0xc4bcae,
    shininess: 90,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  // Ground
  const groundGeo = new THREE.PlaneGeometry(60, 60);
  const groundMat = new THREE.ShadowMaterial({ opacity: .22 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Holder for whatever model gets loaded
  const modelGroup = new THREE.Group();
  modelGroup.position.y = -2.5;
  scene.add(modelGroup);

  // Loading UI
  const loadingEl = document.getElementById('viewerLoading');
  const statusEl  = document.getElementById('viewerLabelStatus');
  const setStatus = txt => statusEl && (statusEl.textContent = txt);

  // ---------- Fallback parametric shell (used if STL missing) ----------
  function buildFallback() {
    const sX = 90, sY = 50;
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const idx = [];
    for (let j = 0; j <= sY; j++) {
      for (let i = 0; i <= sX; i++) {
        const u = i / sX, v = j / sY;
        const ang = u * Math.PI;
        const radiusZ = 2.4 + Math.sin(v * Math.PI) * 1.2;
        const x = (u - .5) * 12;
        const y = v * 5.2 +
                  Math.sin(u * Math.PI * 1.3) * .45 +
                  Math.cos(v * Math.PI * 2) * .12 +
                  Math.exp(-Math.pow((u - .5) * 3, 2)) * .9;
        const z = Math.sin(ang) * radiusZ * (.55 + .45 * Math.sin(v * Math.PI));
        pos.push(x, y, z);
      }
    }
    for (let j = 0; j < sY; j++) {
      for (let i = 0; i < sX; i++) {
        const a = j * (sX + 1) + i;
        const b = a + 1, c = a + (sX + 1), d = c + 1;
        idx.push(a, b, d, a, d, c);
      }
    }
    geo.setIndex(idx);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    modelGroup.add(mesh);

    const wf = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0x1f3a5f, wireframe: true, transparent: true, opacity: .07
    }));
    modelGroup.add(wf);

    setStatus('Mesh · parametric (STL no encontrado)');
  }

  // ---------- STL loader (preferred) ----------
  function fitAndCenter(geometry) {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const size = new THREE.Vector3();
    bb.getSize(size);
    const center = new THREE.Vector3();
    bb.getCenter(center);
    geometry.translate(-center.x, -bb.min.y, -center.z);
    const target = 9;
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = target / maxDim;
    geometry.scale(scale, scale, scale);
  }

  function tryLoadSTL() {
    if (!THREE.STLLoader) {
      buildFallback();
      loadingEl?.classList.add('is-done');
      return;
    }
    const loader = new THREE.STLLoader();
    loader.load(
      'assets/models/heydar.stl',
      geometry => {
        fitAndCenter(geometry);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        modelGroup.add(mesh);
        const wf = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          color: 0x1f3a5f, wireframe: true, transparent: true, opacity: .06
        }));
        modelGroup.add(wf);
        setStatus('STL · Printables 1296501');
        loadingEl?.classList.add('is-done');
      },
      xhr => {
        if (xhr.lengthComputable && loadingEl) {
          const pct = (xhr.loaded / xhr.total * 100).toFixed(0);
          loadingEl.querySelector('span').textContent = `Cargando · ${pct}%`;
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

  // Orbit controls
  let theta = .55, phi = 1.05, radius = 13;
  let drag = false, prevX = 0, prevY = 0;
  let auto = true;

  const onDown = e => {
    drag = true;
    auto = false;
    prevX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    prevY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  };
  const onUp = () => { drag = false; };
  const onMove = e => {
    if (!drag) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    theta -= (x - prevX) * .01;
    phi   = Math.max(.2, Math.min(Math.PI * .48, phi + (y - prevY) * .008));
    prevX = x; prevY = y;
  };

  canvas.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('mousemove', onMove);

  canvas.addEventListener('touchstart', e => onDown(e), { passive: true });
  window.addEventListener('touchend', onUp);
  window.addEventListener('touchmove', e => { onMove(e); }, { passive: true });

  canvas.addEventListener('wheel', e => {
    radius = Math.max(6, Math.min(28, radius + e.deltaY * .012));
    e.preventDefault();
  }, { passive: false });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  function loop() {
    requestAnimationFrame(loop);
    if (auto) theta += .0035;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi) * .9 + .5;
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  loop();
})();

/* =========================================================
   11. AMBIENT DUST — site-wide drifting particles
   ========================================================= */
(() => {
  const canvas = document.getElementById('ambientDust');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = reduceMotion ? 0 : 70;
  const dust = [];
  for (let i = 0; i < COUNT; i++) {
    dust.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + .4,
      vx: (Math.random() - .5) * .08,
      vy: -(Math.random() * .12 + .03),
      a: Math.random() * .35 + .12,
      tw: Math.random() * Math.PI * 2,
    });
  }

  let mx = w / 2, my = h / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  let t = 0;
  function loop() {
    requestAnimationFrame(loop);
    if (!COUNT) return;
    t += .01;
    ctx.clearRect(0, 0, w, h);
    for (const p of dust) {
      // gentle attraction toward cursor
      const dx = mx - p.x, dy = my - p.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 40000) {
        p.vx += dx * .000004;
        p.vy += dy * .000004;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.tw += .02;
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
   12. AMBIENT CURVES — subtle response to scroll
   ========================================================= */
(() => {
  const curves = document.querySelectorAll('.ambient__curve');
  if (!curves.length) return;
  let scrollY = 0, target = 0;
  window.addEventListener('scroll', () => {
    target = window.scrollY;
  }, { passive: true });
  function loop() {
    requestAnimationFrame(loop);
    scrollY += (target - scrollY) * .08;
    const norm = scrollY * .0006;
    curves.forEach((c, i) => {
      c.style.transform = `translate3d(${(i % 2 === 0 ? -1 : 1) * norm * 30}px, ${norm * (10 + i * 4)}px, 0)`;
    });
  }
  loop();
})();

/* =========================================================
   9. PARALLAX SCROLL ELEMENTS
   ========================================================= */
(() => {
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  function update() {
    const vh = window.innerHeight;
    items.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const center = rect.top + rect.height / 2;
      const offset = (center - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* =========================================================
   10. SECTION INDEX (live current section in nav)
   ========================================================= */
(() => {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__list a, .nav__menu a');

  if (!sections.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(a => {
          a.style.opacity = a.getAttribute('href') === '#' + id ? '1' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();
