/* =========================================================
   Shabihub — site script (no build step, no dependencies
   except Three.js for the hero, loaded from a CDN)
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header shadow ---------- */
  var hdr = document.getElementById('hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var mnav = document.getElementById('mnav');
  var burger = document.getElementById('burger');
  function setMenu(open) {
    if (!mnav) return;
    mnav.classList.toggle('is-open', open);
    mnav.setAttribute('aria-hidden', String(!open));
    if (burger) burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  [burger, document.getElementById('mbarMenu')].forEach(function (b) {
    if (b) b.addEventListener('click', function () { setMenu(true); });
  });
  var closeBtn = document.getElementById('mnavClose');
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  if (mnav) {
    // only one accordion open at a time
    mnav.querySelectorAll('details').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) mnav.querySelectorAll('details').forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.rv, .reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Counters ---------- */
  function runCount(el) {
    var end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', t0 = null;
    if (reduce) { el.textContent = end + suffix; return; }
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Logo marquee: duplicate the set for a seamless loop ---------- */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (img) {
      var copy = img.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.alt = '';
      track.appendChild(copy);
    });
  });

  /* ---------- 3D tilt on service cards (desktop pointers only) ---------- */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'rotateX(' + (-y * 9) + 'deg) rotateY(' + (x * 11) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Enquiry forms ----------
     No server is needed: on submit the visitor's email app opens with the
     enquiry pre-filled, addressed to contact@shabihub.com.
     To collect submissions without email, see README (Formspree). */
  document.querySelectorAll('form').forEach(function (form) {
    if (form.hasAttribute('action')) return; // a real form endpoint was configured
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var ok = f.value.trim() && (f.type !== 'email' || /^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('is-invalid', !ok);
        if (!ok && !bad) bad = f;
      });
      if (bad) { bad.focus(); return; }

      var lines = [];
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (!f.name || !f.value.trim()) return;
        var lbl = f.closest('label') || form.querySelector('label[for="' + f.id + '"]');
        var name = lbl ? lbl.childNodes[0].textContent.replace('*', '').trim() : f.name;
        lines.push(name + ': ' + f.value.trim());
      });
      var subj = (form.querySelector('[name="subject"]') || {}).value || 'Website enquiry';
      window.location.href = 'mailto:contact@shabihub.com?subject=' + encodeURIComponent(subj) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      var note = form.querySelector('.form__note');
      if (note) { note.textContent = 'Your email app should open with the enquiry ready to send.'; note.classList.add('ok'); }
    });
  });

  /* ---------- Industry solutions tabs ---------- */
  /* Desktop: tabs on the left, panel on the right.
     Mobile/tablet: accordion — each panel is moved directly under its industry row,
     so the solutions open in place and nothing is hidden off-screen. */
  document.querySelectorAll('.ix').forEach(function (ix) {
    var tabs = ix.querySelectorAll('.ix__tab');
    var panels = ix.querySelectorAll('.ix__panel');
    var panelsWrap = ix.querySelector('.ix__panels');
    var mq = window.matchMedia('(max-width: 1024px)');

    function tabFor(key) { return ix.querySelector('.ix__tab[data-ix="' + key + '"]'); }
    function layout() {
      panels.forEach(function (p) {
        if (mq.matches) tabFor(p.dataset.ix).insertAdjacentElement('afterend', p);
        else panelsWrap.appendChild(p);
      });
      // desktop always needs one industry open
      if (!mq.matches && !ix.querySelector('.ix__tab.is-on')) show(tabs[0].dataset.ix);
    }
    function show(key) {
      tabs.forEach(function (t) {
        var on = t.dataset.ix === key;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('aria-expanded', String(on));
      });
      panels.forEach(function (p) { p.hidden = p.dataset.ix !== key; });
    }
    if (mq.addEventListener) mq.addEventListener('change', layout); else mq.addListener(layout);

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        if (mq.matches) {
          if (t.classList.contains('is-on')) { show(null); return; } // tap again to close
          show(t.dataset.ix);
          var y = t.getBoundingClientRect().top + window.scrollY - 76;  // keep the row under the sticky header
          window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        } else {
          show(t.dataset.ix);
        }
      });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); show(next.dataset.ix);
      });
    });
    show(tabs[0].dataset.ix);
    layout();
  });

  /* ---------- 3D orbit art in inner-page heroes ----------
     Uses the icon of the page's section badge where we can guess it. */
  var heroIcons = { 'ai': 'fa-brain', 'web': 'fa-code', 'app': 'fa-mobile-screen-button', 'mobile': 'fa-mobile-screen-button',
    'marketing': 'fa-bullhorn', 'erp': 'fa-cubes', 'about': 'fa-users', 'portfolio': 'fa-briefcase', 'blog': 'fa-pen-nib',
    'contact': 'fa-paper-plane', 'result': 'fa-chart-line', 'service': 'fa-layer-group' };
  document.querySelectorAll('.page-hero__inner').forEach(function (inner) {
    var label = ((inner.querySelector('.badge') || {}).textContent || '').toLowerCase();
    var icon = 'fa-microchip';
    Object.keys(heroIcons).some(function (k) { if (label.indexOf(k) > -1) { icon = heroIcons[k]; return true; } return false; });
    var art = document.createElement('div');
    art.className = 'ph-art';
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = '<div class="ph-art__orb"><span class="ph-art__icon"><i class="fa-solid ' + icon + '"></i></span></div>' +
      '<div class="ph-art__ring"></div><div class="ph-art__ring"></div><div class="ph-art__ring"></div>';
    inner.appendChild(art);
  });

  /* ---------- Footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Hero 3D: "AI core" (Three.js) ---------- */
  var canvas = document.getElementById('core3d');
  if (canvas && window.THREE) {
    try { initCore(canvas); document.documentElement.classList.add('has-3d'); } catch (err) { /* CSS fallback stays */ }
  }

  function initCore(canvas) {
    var THREE = window.THREE;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    var group = new THREE.Group();
    scene.add(group);

    // inner glowing core
    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 1),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, emissive: 0x3b1fa8, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.25, flatShading: true })
    );
    group.add(core);

    // wireframe shell
    var shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.75, 2),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.28 })
    );
    group.add(shell);

    // network nodes on the shell
    var nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    var nodeMat = new THREE.MeshBasicMaterial({ color: 0xe9e5ff });
    var pos = shell.geometry.attributes.position;
    for (var i = 0; i < pos.count; i += 7) {
      var n = new THREE.Mesh(nodeGeo, nodeMat);
      n.position.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      shell.add(n);
    }

    // orbit rings with satellites
    var rings = [];
    [[2.45, 0.35, 0x60a5fa], [2.85, -0.6, 0xc084fc], [3.25, 1.1, 0x818cf8]].forEach(function (cfg, k) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(cfg[0], 0.006, 8, 160),
        new THREE.MeshBasicMaterial({ color: cfg[2], transparent: true, opacity: 0.55 })
      );
      ring.rotation.x = Math.PI / 2 + cfg[1];
      ring.rotation.y = k * 0.6;
      var sat = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: cfg[2] }));
      sat.position.x = cfg[0];
      ring.add(sat);
      group.add(ring);
      rings.push(ring);
    });

    // particle dust
    var count = window.innerWidth < 700 ? 300 : 700;
    var arr = new Float32Array(count * 3);
    for (var p = 0; p < count; p++) {
      var r = 2.2 + Math.random() * 3.2, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      arr[p * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[p * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[p * 3 + 2] = r * Math.cos(ph);
    }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xc7d2fe, size: 0.022, transparent: true, opacity: 0.7 }));
    scene.add(dust);

    scene.add(new THREE.AmbientLight(0x8b85ff, 0.6));
    var l1 = new THREE.PointLight(0x60a5fa, 1.6, 20); l1.position.set(4, 3, 5); scene.add(l1);
    var l2 = new THREE.PointLight(0xe879f9, 1.3, 20); l2.position.set(-4, -2, 3); scene.add(l2);

    function fit() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 420 ? 8.6 : 7.2;
      camera.updateProjectionMatrix();
    }
    fit();
    window.addEventListener('resize', fit);

    var mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
    }

    var clock = new THREE.Clock();
    function frame() {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      var t = clock.getElapsedTime();
      if (!reduce) {
        core.rotation.y = t * 0.35; core.rotation.x = t * 0.18;
        shell.rotation.y = -t * 0.12; shell.rotation.z = t * 0.05;
        rings.forEach(function (r, k) { r.rotation.z = t * (0.25 + k * 0.12) * (k % 2 ? -1 : 1); });
        dust.rotation.y = t * 0.02;
        core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.03);
        group.rotation.y += (mx * 0.35 - group.rotation.y) * 0.04;
        group.rotation.x += (my * 0.25 - group.rotation.x) * 0.04;
      }
      renderer.render(scene, camera);
    }
    frame();
  }
})();
