// Interactive building schemas for Arc / Beam / Chroma
(function () {
  const BLDG = {
    arc: {
      name: 'OXYMA Arc',
      desc: 'Vývoj, laboratoře a testovací prostředí. Nejrobustnější inženýrské zázemí v kampusu.',
      total: '18 400 m²',
      floors: 7,
      parking: '420 míst',
      color: 'oklch(65% 0.22 22)',
      floorData: [
        { n: '6.NP', name: 'Střecha · terasa', units: [{t:'REL', lbl:'Zelená terasa', s:'sdílené'}]},
        { n: '5.NP', name: 'Vývoj &amp; labs', units:[{t:'LAB', lbl:'Lab. 5A', s:'680 m²'},{t:'LAB', lbl:'Lab. 5B', s:'520 m²'},{t:'VYV', lbl:'Vývoj 5C', s:'380 m²'}]},
        { n: '4.NP', name: 'Vývoj', units:[{t:'VYV', lbl:'Vývoj 4A', s:'720 m²'},{t:'VYV', lbl:'Vývoj 4B', s:'560 m²'},{t:'KNC', lbl:'Tým 4C', s:'340 m²'}]},
        { n: '3.NP', name: 'Kanceláře &amp; vývoj', units:[{t:'KNC', lbl:'Kanc. 3A', s:'1 200 m²'},{t:'VYV', lbl:'Vývoj 3B', s:'480 m²'}]},
        { n: '2.NP', name: 'Kanceláře', units:[{t:'KNC', lbl:'Kanc. 2A', s:'820 m²'},{t:'KNC', lbl:'Kanc. 2B', s:'540 m²'},{t:'KNC', lbl:'Kanc. 2C', s:'260 m²'}]},
        { n: '1.NP', name: 'Recepce &amp; lobby', units:[{t:'RTL', lbl:'Recepce', s:'180 m²'},{t:'RTL', lbl:'Kavárna', s:'140 m²'},{t:'KNC', lbl:'Showroom', s:'320 m²'}]},
        { n: '1.PP', name: 'Parkování · tech.', units:[{t:'TEC', lbl:'Technologie', s:'-'}]},
      ],
    },
    beam: {
      name: 'OXYMA Beam',
      desc: 'Administrativa, coworking a servisní podlaží. Centrální budova spojující Arc a Chromu.',
      total: '12 200 m²',
      floors: 4,
      parking: '280 míst',
      color: 'oklch(60% 0.17 220)',
      floorData: [
        { n: '3.NP', name: 'Zelená terasa &amp; clubs', units:[{t:'REL', lbl:'Terasa', s:'sdílené'},{t:'REL', lbl:'Club room', s:'220 m²'}]},
        { n: '2.NP', name: 'Kanceláře', units:[{t:'KNC', lbl:'Kanc. 2A', s:'960 m²'},{t:'KNC', lbl:'Kanc. 2B', s:'620 m²'},{t:'KNC', lbl:'Kanc. 2C', s:'280 m²'}]},
        { n: '1.NP', name: 'Coworking · lobby', units:[{t:'KNC', lbl:'Coworking', s:'540 m²'},{t:'RTL', lbl:'Restaurace', s:'380 m²'},{t:'RTL', lbl:'Shop', s:'90 m²'}]},
        { n: '1.PP', name: 'Parkování · tech.', units:[{t:'TEC', lbl:'Technologie', s:'-'}]},
      ],
    },
    chroma: {
      name: 'OXYMA Chroma',
      desc: 'Nerušivá výroba, montáž, retail a služby. Nejvyšší výkony připojení, efektivní zásobování.',
      total: '15 600 m²',
      floors: 6,
      parking: '360 míst · 40 nákladních',
      color: 'oklch(60% 0.23 340)',
      floorData: [
        { n: '5.NP', name: 'Kanceláře', units:[{t:'KNC', lbl:'Kanc. 5A', s:'580 m²'},{t:'KNC', lbl:'Kanc. 5B', s:'420 m²'}]},
        { n: '4.NP', name: 'Vývoj · labs', units:[{t:'LAB', lbl:'Lab. 4A', s:'720 m²'},{t:'VYV', lbl:'Vývoj 4B', s:'380 m²'}]},
        { n: '3.NP', name: 'Výroba', units:[{t:'VYR', lbl:'Výroba 3A', s:'1 400 m²'},{t:'VYR', lbl:'Výroba 3B', s:'680 m²'}]},
        { n: '2.NP', name: 'Výroba · montáž', units:[{t:'VYR', lbl:'Výroba 2A', s:'1 600 m²'},{t:'VYR', lbl:'Montáž 2B', s:'540 m²'}]},
        { n: '1.NP', name: 'Retail &amp; lobby', units:[{t:'RTL', lbl:'Retail 1A', s:'280 m²'},{t:'RTL', lbl:'Retail 1B', s:'190 m²'},{t:'RTL', lbl:'Kavárna', s:'120 m²'}]},
        { n: '1.PP', name: 'Parkování · nákl.', units:[{t:'TEC', lbl:'Zásobování', s:'-'}]},
      ],
    },
  };

  const TYPE_COLOR = {
    KNC: 'oklch(73% 0.19 55)',
    LAB: 'oklch(70% 0.2 145)',
    VYV: 'oklch(60% 0.17 220)',
    VYR: 'oklch(60% 0.23 340)',
    RTL: 'oklch(80% 0.16 90)',
    REL: 'oklch(65% 0.22 22)',
    TEC: 'rgba(120,120,120,0.35)',
  };

  const TYPE_NAME = {
    KNC: 'Kanceláře', LAB: 'Laboratoře', VYV: 'Vývoj',
    VYR: 'Výroba', RTL: 'Retail', REL: 'Relax', TEC: 'Technologie'
  };

  let state = { bldg: 'arc', floor: null, sizeFilter: 'all' };

  function sizeBucket(s) {
    const m = s.match(/([\d ]+)/);
    if (!m) return null;
    const n = parseInt(m[1].replace(/\s/g, ''));
    if (isNaN(n)) return null;
    if (n < 500) return 's';
    if (n < 1000) return 'm';
    return 'l';
  }
  function matchesFilter(u) {
    if (state.sizeFilter === 'all') return true;
    return sizeBucket(u.s) === state.sizeFilter;
  }

  function renderBuilding() {
    const b = BLDG[state.bldg];
    if (state.floor === null || state.floor >= b.floorData.length) state.floor = Math.min(1, b.floorData.length - 1);

    // Plan SVG - cross-section with floors
    const plan = document.getElementById('bv-plan');
    const tip = plan.querySelector('#unit-tip');
    const floors = b.floorData;
    const W = 600, H = 560, pad = 60;
    const floorH = (H - pad * 2) / floors.length;

    const floorsSvg = floors.map((f, i) => {
      const y = pad + i * floorH;
      const isSelected = i === state.floor;
      const units = f.units;
      const cellW = (W - pad * 2) / Math.max(units.length, 1);
      const cells = units.map((u, j) => {
        const x = pad + j * cellW;
        const fill = TYPE_COLOR[u.t] || '#999';
        const dim = !matchesFilter(u) ? ' dim' : '';
        return `<rect class="unit${dim}" x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${floorH - 4}"
          fill="${fill}" fill-opacity="${isSelected ? 0.95 : 0.35}"
          stroke="currentColor" stroke-width="1"
          data-type="${u.t}" data-lbl="${u.lbl}" data-size="${u.s}" data-floor="${i}"/>
          <text x="${x + 10}" y="${y + 18}" font-family="JetBrains Mono" font-size="9" letter-spacing="1" fill="${isSelected ? '#fff' : 'currentColor'}" pointer-events="none">${u.t}</text>`;
      }).join('');
      return `
        <g>
          ${cells}
          <text x="${pad - 10}" y="${y + floorH / 2 + 4}" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="currentColor" opacity="${isSelected ? 1 : 0.5}" letter-spacing="1">${f.n}</text>
        </g>
      `;
    }).join('');

    const svg = `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="color: var(--ink);">
        <!-- ground -->
        <line x1="${pad}" y1="${H - pad + 8}" x2="${W - pad}" y2="${H - pad + 8}" stroke="currentColor" stroke-width="1" opacity="0.6"/>
        <line x1="${pad}" y1="${H - pad + 12}" x2="${W - pad}" y2="${H - pad + 12}" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
        <!-- outer frame -->
        <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
        ${floorsSvg}
        <!-- roof label -->
        <text x="${W/2}" y="${pad - 18}" text-anchor="middle" font-family="Space Grotesk" font-weight="500" font-size="14" letter-spacing="2" fill="currentColor">${b.name.toUpperCase()}</text>
        <text x="${W/2}" y="${H - 20}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" letter-spacing="2" fill="currentColor" opacity="0.5">ŘEZ · ${b.floors} NP + 1 PP</text>
      </svg>
    `;
    // Clear old svg but preserve tip element
    plan.innerHTML = svg;
    plan.appendChild(tip);

    // Attach unit hover
    plan.querySelectorAll('.unit').forEach(u => {
      u.addEventListener('mouseenter', (e) => {
        const d = u.dataset;
        tip.innerHTML = `<strong>${d.lbl}</strong>${TYPE_NAME[d.type] || d.type} · ${d.size}`;
        tip.classList.add('on');
      });
      u.addEventListener('mousemove', (e) => {
        const rect = plan.getBoundingClientRect();
        tip.style.left = (e.clientX - rect.left) + 'px';
        tip.style.top = (e.clientY - rect.top) + 'px';
      });
      u.addEventListener('mouseleave', () => tip.classList.remove('on'));
      u.addEventListener('click', () => {
        state.floor = parseInt(u.dataset.floor);
        renderBuilding();
      });
    });

    // Info side
    const info = document.getElementById('bv-info');
    const selected = floors[state.floor];
    info.innerHTML = `
      <div>
        <div class="section-num" style="margin: 0 0 12px;">${b.name.split(' ')[1].toUpperCase()}</div>
        <h3>${b.name}</h3>
        <p style="margin-top: 14px; color: var(--muted);">${b.desc}</p>
      </div>
      <div class="bv-stats">
        <div class="bv-stat"><div class="k">Celková plocha</div><div class="v">${b.total}</div></div>
        <div class="bv-stat"><div class="k">Nadzemní podlaží</div><div class="v">${b.floors}</div></div>
        <div class="bv-stat"><div class="k">Parkování</div><div class="v">${b.parking}</div></div>
        <div class="bv-stat"><div class="k">Akcent</div><div class="v" style="display: flex; align-items: center; gap: 10px;"><span style="display: inline-block; width: 22px; height: 22px; background: ${b.color};"></span></div></div>
      </div>
      <div>
        <div class="spec-k" style="margin-bottom: 10px;">Patra - klikněte</div>
        <div class="floor-picker">
          ${floors.map((f, i) => `
            <button class="floor-btn" aria-selected="${i === state.floor}" data-fidx="${i}">
              <span class="fk">${f.n}</span>
              <span class="fn">${f.name}</span>
              <span class="fa">${f.units.filter(u => u.t !== 'TEC').length} jedn.</span>
            </button>`).join('')}
        </div>
      </div>
      <div style="border-top: 1px solid var(--line-soft); padding-top: 16px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--muted);">
        ${selected ? `VYBRÁNO: ${selected.n.replace('&amp;','&')} - ${selected.units.length} jednotek` : '-'}
      </div>
    `;

    info.querySelectorAll('.floor-btn').forEach(b => {
      b.addEventListener('click', () => {
        state.floor = parseInt(b.dataset.fidx);
        renderBuilding();
      });
    });
  }

  function init() {
    // Tab switching
    document.querySelectorAll('.btab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.btab').forEach(x => x.setAttribute('aria-selected', 'false'));
        t.setAttribute('aria-selected', 'true');
        state.bldg = t.dataset.bldg;
        state.floor = null;
        renderBuilding();
      });
    });
    // Size filter
    document.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
        c.setAttribute('aria-pressed', 'true');
        state.sizeFilter = c.dataset.size;
        renderBuilding();
      });
    });
    renderBuilding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
