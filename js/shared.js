// ============ OXYMA SHARED ============
// OXYMA mark — simplified X built from four chevrons pointing inward,
// with a fine rainbow outline echoing the brand cover art.
window.OXYMA_MARK = function(opts) {
  opts = opts || {};
  var size = opts.size || 38;
  var color = opts.color || 'currentColor';
  var rainbow = opts.rainbow ? 'url(#oxyma-spectrum)' : color;
  // Path: an X-shaped polygon — four notches cut into the corners.
  // The shape is: square 0,0–100,100 with notches at each corner forming an X / star-like X.
  var d = 'M 50 35 L 15 0 L 0 0 L 0 15 L 35 50 L 0 85 L 0 100 L 15 100 L 50 65 L 85 100 L 100 100 L 100 85 L 65 50 L 100 15 L 100 0 L 85 0 Z';
  return '\
<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" aria-label="OXYMA">\
<defs>\
<linearGradient id="oxyma-spectrum" x1="0" y1="0" x2="1" y2="1">\
<stop offset="0%" stop-color="#BB1E10"/>\
<stop offset="14%" stop-color="#F67828"/>\
<stop offset="28%" stop-color="#FACA31"/>\
<stop offset="42%" stop-color="#61993B"/>\
<stop offset="56%" stop-color="#00694C"/>\
<stop offset="70%" stop-color="#0089B6"/>\
<stop offset="84%" stop-color="#76689A"/>\
<stop offset="100%" stop-color="#C5618C"/>\
</linearGradient>\
<pattern id="oxyma-stripes" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">\
<rect width="3" height="6" fill="' + color + '"/>\
</pattern>\
</defs>\
<path d="' + d + '" fill="' + (opts.rainbow ? rainbow : color) + '"/>\
</svg>';
};

// ============ NAV (component) ============
window.renderNav = function(active) {
  var links = [
    { href: 'o-projektu.html', label: 'O projektu', key: 'about' },
    { href: 'nabidka-prostor.html', label: 'Nabídka prostor', key: 'offer' },
    { href: 'shell-core.html', label: 'Shell & Core', key: 'shell' },
    { href: 'kontakt.html', label: 'Kontakt', key: 'contact' },
  ];
  var html = '\
<nav class="nav">\
  <div class="nav-inner">\
    <a href="index.html" class="brand" aria-label="OXYMA">\
      <img src="assets/logo-oxyma-h.png" alt="OXYMA" class="brand-logo brand-logo-light" />\
      <img src="assets/logo-oxyma-h-white.png" alt="OXYMA" class="brand-logo brand-logo-dark" />\
    </a>\
    <div class="nav-links">' +
      links.map(function(l) {
        return '<a href="' + l.href + '"' + (l.key === active ? ' aria-current="page"' : '') + '>' + l.label + '</a>';
      }).join('') +
    '</div>\
    <a href="kontakt.html" class="nav-cta">Domluvit prohlídku</a>\
  </div>\
</nav>';
  document.write(html);
  // Logo shrinks on scroll
  requestAnimationFrame(function() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var onScroll = function() {
      if (window.scrollY > 40) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
};

// ============ FOOTER ============
window.renderFooter = function() {
  var html = '\
<div class="spectrum-bar"></div>\
<footer class="footer">\
  <div class="shell">\
    <div class="footer-grid">\
      <div>\
        <a href="index.html" class="brand" aria-label="OXYMA" style="color:var(--paper);">\
          <img src="assets/logo-oxyma-h-white.png" alt="OXYMA" class="brand-logo" style="height:42px;" />\
        </a>\
        <p style="margin-top:24px;max-width:36ch;color:rgba(246,244,239,0.7);font-size:14px;">\
          Technologické centrum v pražských Malešicích. Tři budovy — Arc, Beam a Chroma — fáze 1.\
        </p>\
      </div>\
      <div>\
        <h4>Stránky</h4>\
        <ul>\
          <li><a href="o-projektu.html">O projektu</a></li>\
          <li><a href="nabidka-prostor.html">Nabídka prostor</a></li>\
          <li><a href="shell-core.html">Shell &amp; Core</a></li>\
          <li><a href="kontakt.html">Kontakt</a></li>\
        </ul>\
      </div>\
      <div>\
        <h4>Kontakt</h4>\
        <ul>\
          <li>stulcova@ttc.cz</li>\
          <li>+420 731 603 875</li>\
          <li>Praha 10 — Malešice</li>\
        </ul>\
      </div>\
      <div>\
        <h4>Investor</h4>\
        <ul>\
          <li>TTC REAL ESTATE, a.s.</li>\
          <li>Vinohradská 3217/167</li>\
          <li>100 00 Praha 10 — Strašnice</li>\
          <li><a href="https://www.oxyma.cz">www.oxyma.cz</a></li>\
        </ul>\
      </div>\
    </div>\
    <div class="footer-bottom">\
      <span>© 2025 OXYMA — Všechna práva vyhrazena</span>\
      <span>Vizualizace mají ilustrační charakter</span>\
    </div>\
  </div>\
</footer>';
  document.write(html);
};

// ============ TWEAKS (theme + accent) ============
window.initTweaks = function(defaults) {
  defaults = defaults || { theme: 'light', accent: 'red' };
  var current = JSON.parse(localStorage.getItem('oxyma-tweaks') || 'null') || defaults;
  var accentMap = { red: '#BB1E10', orange: '#F67828', yellow: '#FACA31', green: '#61993B', teal: '#00694C', blue: '#0089B6', navy: '#005387', lilac: '#76689A', pink: '#C5618C' };

  function apply() {
    document.documentElement.setAttribute('data-theme', current.theme);
    document.documentElement.style.setProperty('--accent', accentMap[current.accent] || '#BB1E10');
    document.querySelectorAll('[data-tweak]').forEach(function(el) {
      var k = el.getAttribute('data-tweak');
      el.querySelectorAll('button[data-val]').forEach(function(b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-val') === current[k] ? 'true' : 'false');
      });
    });
  }

  function setKey(k, v) {
    current[k] = v;
    localStorage.setItem('oxyma-tweaks', JSON.stringify(current));
    apply();
    if (window.parent !== window) {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: current }, '*');
    }
  }

  // Listen for host edit-mode toggle
  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === '__activate_edit_mode') {
      var p = document.querySelector('.tweaks-panel');
      if (p) p.classList.add('open');
    } else if (e.data.type === '__deactivate_edit_mode') {
      var p = document.querySelector('.tweaks-panel');
      if (p) p.classList.remove('open');
    }
  });

  // Mount panel
  var panel = document.createElement('div');
  panel.className = 'tweaks-panel';
  panel.innerHTML = '\
<h5>Tweaks</h5>\
<div class="tweak-row" data-tweak="theme">\
  <label>Téma</label>\
  <div class="seg">\
    <button data-val="light">Světlé</button>\
    <button data-val="dark">Tmavé</button>\
  </div>\
</div>\
<div class="tweak-row" data-tweak="accent">\
  <label>Akcent</label>\
  <div class="seg" style="flex-wrap:wrap;">\
    <button data-val="red"   style="background:#BB1E10;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="orange"style="background:#F67828;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="yellow"style="background:#FACA31;color:#000;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="green" style="background:#61993B;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="teal"  style="background:#00694C;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="blue"  style="background:#0089B6;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="navy"  style="background:#005387;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="lilac" style="background:#76689A;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
    <button data-val="pink"  style="background:#C5618C;color:#fff;border:none;height:24px;flex:1 0 22%;"></button>\
  </div>\
</div>\
<p style="font-size:10px;opacity:0.55;margin-top:4px;letter-spacing:.06em;">Aktivuje se panelem v horní liště.</p>';
  document.body.appendChild(panel);

  panel.addEventListener('click', function(e) {
    var b = e.target.closest('button[data-val]');
    if (!b) return;
    var key = b.closest('[data-tweak]').getAttribute('data-tweak');
    setKey(key, b.getAttribute('data-val'));
  });

  apply();

  // Announce edit-mode availability AFTER listener is mounted
  if (window.parent !== window) {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  }
};
