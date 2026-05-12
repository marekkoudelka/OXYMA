/* ============ INTERACTIVE FLOOR PLAN ============
 * Single H-shaped floor across Arc · Chroma · Beam.
 * Units selectable; selected units fill with building color and overlay
 * a realistic fitout. Adjacent selected units merge into a single cluster
 * whose layout adapts (benches, meeting rooms, private offices, lounge).
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';

  // 1 m = 20 vb units
  const units = [
    { id: 'A1', bldg: 'arc',    code: '1.01', area: 290, desc: 'Severní expozice, panoramatický výhled na park.',           x: 20,   y: 20,  w: 280, h: 414 },
    { id: 'A2', bldg: 'arc',    code: '1.02', area: 290, desc: 'Severní expozice s napojením na jádro Arc.',                x: 300,  y: 20,  w: 280, h: 414 },
    { id: 'A3', bldg: 'arc',    code: '1.03', area: 249, desc: 'Jižní expozice, orientace do vnitrobloku.',                 x: 20,   y: 434, w: 280, h: 356 },
    { id: 'A4', bldg: 'arc',    code: '1.04', area: 249, desc: 'Jižní expozice s návazností na Chroma.',                    x: 300,  y: 434, w: 280, h: 356 },
    { id: 'C1', bldg: 'chroma', code: 'C.01', area: 215, desc: 'Kompaktní kancelář u centrálního jádra.',                   x: 580,  y: 100, w: 414, h: 208 },
    { id: 'C2', bldg: 'chroma', code: 'C.02', area: 215, desc: 'Kompaktní kancelář u centrálního jádra.',                   x: 994,  y: 100, w: 414, h: 208 },
    { id: 'C3', bldg: 'chroma', code: 'C.03', area: 415, desc: 'Velká variabilní open-space plocha.',                       x: 580,  y: 308, w: 414, h: 402 },
    { id: 'C4', bldg: 'chroma', code: 'C.04', area: 415, desc: 'Velká variabilní open-space plocha.',                       x: 994,  y: 308, w: 414, h: 402 },
    { id: 'B1', bldg: 'beam',   code: '3.01', area: 290, desc: 'Severní expozice s napojením na jádro Beam.',               x: 1408, y: 20,  w: 280, h: 414 },
    { id: 'B2', bldg: 'beam',   code: '3.02', area: 290, desc: 'Severní expozice, panoramatický výhled.',                   x: 1688, y: 20,  w: 280, h: 414 },
    { id: 'B3', bldg: 'beam',   code: '3.03', area: 249, desc: 'Jižní expozice, dispozice vhodná pro labs.',                x: 1408, y: 434, w: 280, h: 356 },
    { id: 'B4', bldg: 'beam',   code: '3.04', area: 249, desc: 'Jižní expozice s návazností na Chroma.',                    x: 1688, y: 434, w: 280, h: 356 },
  ];

  const buildings = {
    arc:    { label: 'Arc',    char: 'Oblouk',   accent: '#C8102E' },
    chroma: { label: 'Chroma', char: 'Spektrum', accent: '#F2A900' },
    beam:   { label: 'Beam',   char: 'Paprsek',  accent: '#E37222' },
  };

  const svg = document.querySelector('#planner .planner-svg');
  if (!svg) return;
  const unitsG = svg.querySelector('#planner-units');
  const fitG   = (function(){ const g = document.createElementNS(NS, 'g'); g.id = 'planner-fitout'; g.setAttribute('pointer-events','none'); svg.appendChild(g); return g; })();
  const totalEl = document.getElementById('planner-total');
  const countEl = document.getElementById('planner-count');
  const hoverBldg = document.getElementById('planner-hover-bldg');
  const hoverUnit = document.getElementById('planner-hover-unit');
  const hoverArea = document.getElementById('planner-hover-area');
  const hoverDesc = document.getElementById('planner-hover-desc');
  const tableBody = document.getElementById('planner-table-body');
  const clearBtn  = document.getElementById('planner-clear');
  const selected = new Set();

  function mk(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function info(id) { return units.find(u => u.id === id) || null; }

  // Build base unit shapes (color + click target + labels)
  units.forEach(u => {
    const g = mk('g', { class: 'unit', 'data-id': u.id, 'data-bldg': u.bldg });
    g.appendChild(mk('rect', { class: 'unit-back', x: u.x, y: u.y, width: u.w, height: u.h, fill: buildings[u.bldg].accent }));
    g.appendChild(mk('rect', { class: 'unit-hit',  x: u.x, y: u.y, width: u.w, height: u.h, fill: 'transparent' }));
    const lab = mk('g', { class: 'unit-label', transform: `translate(${u.x + u.w/2}, ${u.y + u.h/2})`, 'pointer-events': 'none' });
    const c = mk('text', { class: 'unit-code', 'text-anchor': 'middle', y: -14 }); c.textContent = u.code; lab.appendChild(c);
    const a = mk('text', { class: 'unit-area', 'text-anchor': 'middle', y: 22  }); a.textContent = u.area + ' m²'; lab.appendChild(a);
    g.appendChild(lab);
    unitsG.appendChild(g);
  });

  // ---------- Cluster detection ----------
  // Two units are adjacent if they share an edge (horizontally or vertically).
  function adjacent(a, b) {
    const ax2 = a.x + a.w, ay2 = a.y + a.h, bx2 = b.x + b.w, by2 = b.y + b.h;
    const horizTouch = (Math.abs(ax2 - b.x) < 1 || Math.abs(bx2 - a.x) < 1)
                    && !(ay2 <= b.y + 1 || by2 <= a.y + 1);
    const vertTouch  = (Math.abs(ay2 - b.y) < 1 || Math.abs(by2 - a.y) < 1)
                    && !(ax2 <= b.x + 1 || bx2 <= a.x + 1);
    return horizTouch || vertTouch;
  }
  function buildClusters() {
    const sel = [...selected].map(id => info(id)).filter(Boolean);
    const visited = new Set();
    const clusters = [];
    for (const u of sel) {
      if (visited.has(u.id)) continue;
      const stack = [u], group = [];
      while (stack.length) {
        const cur = stack.pop();
        if (visited.has(cur.id)) continue;
        visited.add(cur.id);
        group.push(cur);
        for (const v of sel) {
          if (!visited.has(v.id) && adjacent(cur, v)) stack.push(v);
        }
      }
      clusters.push(group);
    }
    return clusters;
  }

  // ---------- Furniture primitives ----------
  // All dims in vb (20 vb = 1 m)
  const DESK_L = 32, DESK_D = 16;      // 1.6 × 0.8 m
  const SPINE  = 4;
  const CHAIR_W = 16, CHAIR_D = 11;    // 0.8 × 0.55 m
  const CHAIR_GAP = 3;
  const DESK_PITCH = DESK_L + 6;
  const ROW_DEPTH = CHAIR_D + CHAIR_GAP + DESK_D + SPINE + DESK_D + CHAIR_GAP + CHAIR_D;
  const AISLE = 30;                    // 1.5 m
  const ROW_PITCH = ROW_DEPTH + AISLE;

  function drawBench(g, ox, oy, perSide, dir) {
    if (dir === 'h') {
      const benchW = perSide * DESK_PITCH - 6;
      for (let i = 0; i < perSide; i++) {
        const x = ox + i * DESK_PITCH + (DESK_L - CHAIR_W) / 2;
        g.appendChild(mk('rect', { class: 'fo-chair', x, y: oy, width: CHAIR_W, height: CHAIR_D, rx: 3 }));
      }
      const yD1 = oy + CHAIR_D + CHAIR_GAP;
      for (let i = 0; i < perSide; i++) {
        g.appendChild(mk('rect', { class: 'fo-desk', x: ox + i * DESK_PITCH, y: yD1, width: DESK_L, height: DESK_D }));
      }
      g.appendChild(mk('line', { class: 'fo-spine', x1: ox, y1: yD1 + DESK_D + SPINE/2, x2: ox + benchW, y2: yD1 + DESK_D + SPINE/2 }));
      const yD2 = yD1 + DESK_D + SPINE;
      for (let i = 0; i < perSide; i++) {
        g.appendChild(mk('rect', { class: 'fo-desk', x: ox + i * DESK_PITCH, y: yD2, width: DESK_L, height: DESK_D }));
      }
      const yC2 = yD2 + DESK_D + CHAIR_GAP;
      for (let i = 0; i < perSide; i++) {
        const x = ox + i * DESK_PITCH + (DESK_L - CHAIR_W) / 2;
        g.appendChild(mk('rect', { class: 'fo-chair', x, y: yC2, width: CHAIR_W, height: CHAIR_D, rx: 3 }));
      }
    } else {
      const benchH = perSide * DESK_PITCH - 6;
      for (let i = 0; i < perSide; i++) {
        const y = oy + i * DESK_PITCH + (DESK_L - CHAIR_W) / 2;
        g.appendChild(mk('rect', { class: 'fo-chair', x: ox, y, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
      }
      const xD1 = ox + CHAIR_D + CHAIR_GAP;
      for (let i = 0; i < perSide; i++) {
        g.appendChild(mk('rect', { class: 'fo-desk', x: xD1, y: oy + i * DESK_PITCH, width: DESK_D, height: DESK_L }));
      }
      g.appendChild(mk('line', { class: 'fo-spine', x1: xD1 + DESK_D + SPINE/2, y1: oy, x2: xD1 + DESK_D + SPINE/2, y2: oy + benchH }));
      const xD2 = xD1 + DESK_D + SPINE;
      for (let i = 0; i < perSide; i++) {
        g.appendChild(mk('rect', { class: 'fo-desk', x: xD2, y: oy + i * DESK_PITCH, width: DESK_D, height: DESK_L }));
      }
      const xC2 = xD2 + DESK_D + CHAIR_GAP;
      for (let i = 0; i < perSide; i++) {
        const y = oy + i * DESK_PITCH + (DESK_L - CHAIR_W) / 2;
        g.appendChild(mk('rect', { class: 'fo-chair', x: xC2, y, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
      }
    }
  }

  function drawMeeting(g, r, seats) {
    // r = {x,y,w,h}; conference table centred, chairs around
    g.appendChild(mk('rect', { class: 'fo-room', x: r.x + 2, y: r.y + 2, width: r.w - 4, height: r.h - 4, rx: 1 }));
    const horiz = r.w >= r.h;
    const tw = horiz ? Math.min(r.w - 50, 90) : Math.min(r.w - 36, 40);
    const th = horiz ? Math.min(r.h - 36, 40) : Math.min(r.h - 50, 90);
    const tx = r.x + (r.w - tw) / 2, ty = r.y + (r.h - th) / 2;
    g.appendChild(mk('rect', { class: 'fo-table', x: tx, y: ty, width: tw, height: th, rx: 5 }));
    const perLong = Math.max(2, Math.floor((horiz ? tw : th) / 22));
    if (horiz) {
      for (let i = 0; i < perLong; i++) {
        const cx = tx + ((i + 0.5) * tw) / perLong - CHAIR_W / 2;
        g.appendChild(mk('rect', { class: 'fo-chair', x: cx, y: ty - CHAIR_D - 2, width: CHAIR_W, height: CHAIR_D, rx: 3 }));
        g.appendChild(mk('rect', { class: 'fo-chair', x: cx, y: ty + th + 2,     width: CHAIR_W, height: CHAIR_D, rx: 3 }));
      }
      const ey = ty + th / 2 - CHAIR_W / 2;
      g.appendChild(mk('rect', { class: 'fo-chair', x: tx - CHAIR_D - 2, y: ey, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
      g.appendChild(mk('rect', { class: 'fo-chair', x: tx + tw + 2,      y: ey, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
    } else {
      for (let i = 0; i < perLong; i++) {
        const cy = ty + ((i + 0.5) * th) / perLong - CHAIR_W / 2;
        g.appendChild(mk('rect', { class: 'fo-chair', x: tx - CHAIR_D - 2, y: cy, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
        g.appendChild(mk('rect', { class: 'fo-chair', x: tx + tw + 2,      y: cy, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
      }
      const ex = tx + tw / 2 - CHAIR_W / 2;
      g.appendChild(mk('rect', { class: 'fo-chair', x: ex, y: ty - CHAIR_D - 2, width: CHAIR_W, height: CHAIR_D, rx: 3 }));
      g.appendChild(mk('rect', { class: 'fo-chair', x: ex, y: ty + th + 2,     width: CHAIR_W, height: CHAIR_D, rx: 3 }));
    }
  }

  function drawPrivateOffice(g, r) {
    // Small private office: 1-2 desks + chairs
    g.appendChild(mk('rect', { class: 'fo-room', x: r.x + 2, y: r.y + 2, width: r.w - 4, height: r.h - 4, rx: 1 }));
    const horiz = r.w >= r.h;
    if (horiz) {
      const dy = r.y + (r.h - DESK_D) / 2 - 6;
      const dx = r.x + (r.w - DESK_L) / 2;
      g.appendChild(mk('rect', { class: 'fo-desk', x: dx, y: dy, width: DESK_L, height: DESK_D }));
      g.appendChild(mk('rect', { class: 'fo-chair', x: dx + (DESK_L - CHAIR_W)/2, y: dy + DESK_D + 2, width: CHAIR_W, height: CHAIR_D, rx: 3 }));
    } else {
      const dx = r.x + (r.w - DESK_D) / 2 - 6;
      const dy = r.y + (r.h - DESK_L) / 2;
      g.appendChild(mk('rect', { class: 'fo-desk', x: dx, y: dy, width: DESK_D, height: DESK_L }));
      g.appendChild(mk('rect', { class: 'fo-chair', x: dx + DESK_D + 2, y: dy + (DESK_L - CHAIR_W)/2, width: CHAIR_D, height: CHAIR_W, rx: 3 }));
    }
  }

  function drawLounge(g, r) {
    // Lounge: sofa pieces + low table
    g.appendChild(mk('rect', { class: 'fo-room', x: r.x + 2, y: r.y + 2, width: r.w - 4, height: r.h - 4, rx: 1 }));
    const tw = Math.min(r.w * 0.35, 38), th = Math.min(r.h * 0.35, 26);
    const tx = r.x + (r.w - tw) / 2, ty = r.y + (r.h - th) / 2;
    g.appendChild(mk('rect', { class: 'fo-table', x: tx, y: ty, width: tw, height: th, rx: 4 }));
    // Two sofas
    g.appendChild(mk('rect', { class: 'fo-chair', x: tx - 8, y: ty - 18, width: tw + 16, height: 12, rx: 4 }));
    g.appendChild(mk('rect', { class: 'fo-chair', x: tx - 8, y: ty + th + 6, width: tw + 16, height: 12, rx: 4 }));
  }

  function fillBenches(g, region) {
    let { x: bx, y: by, w: bw, h: bh } = region;
    const horiz = bw >= bh;
    let rows, perSide;
    if (horiz) {
      rows = Math.max(1, Math.floor(bh / ROW_PITCH));
      perSide = Math.max(2, Math.floor(bw / DESK_PITCH));
    } else {
      rows = Math.max(1, Math.floor(bw / ROW_PITCH));
      perSide = Math.max(2, Math.floor(bh / DESK_PITCH));
    }
    if (horiz) {
      const totH = rows * ROW_PITCH - AISLE;
      const startY = by + (bh - totH) / 2;
      const benchW = perSide * DESK_PITCH - 6;
      const startX = bx + (bw - benchW) / 2;
      for (let r = 0; r < rows; r++) drawBench(g, startX, startY + r * ROW_PITCH, perSide, 'h');
    } else {
      const totW = rows * ROW_PITCH - AISLE;
      const startX = bx + (bw - totW) / 2;
      const benchH = perSide * DESK_PITCH - 6;
      const startY = by + (bh - benchH) / 2;
      for (let r = 0; r < rows; r++) drawBench(g, startX + r * ROW_PITCH, startY, perSide, 'v');
    }
  }

  // ---------- Cluster fitout ----------
  function buildClusterFitout(cluster) {
    // Cluster bbox (with shared interior walls removed by union)
    const minX = Math.min(...cluster.map(u => u.x));
    const minY = Math.min(...cluster.map(u => u.y));
    const maxX = Math.max(...cluster.map(u => u.x + u.w));
    const maxY = Math.max(...cluster.map(u => u.y + u.h));
    const totalArea = cluster.reduce((s, u) => s + u.area, 0);
    const M = 28;
    const region = { x: minX + M, y: minY + M, w: (maxX - minX) - 2 * M, h: (maxY - minY) - 2 * M };
    const horiz = region.w >= region.h;

    const g = mk('g', { class: 'fitout-cluster' });

    // Desks first; rooms only as a small share of larger spaces.
    const rooms = [];
    if (totalArea >= 1200) {
      rooms.push({ kind: 'mtg',     ratio: 0.10 });
      rooms.push({ kind: 'mtg',     ratio: 0.08 });
      rooms.push({ kind: 'private', ratio: 0.05 });
    } else if (totalArea >= 800) {
      rooms.push({ kind: 'mtg',     ratio: 0.11 });
      rooms.push({ kind: 'private', ratio: 0.06 });
    } else if (totalArea >= 500) {
      rooms.push({ kind: 'mtg',     ratio: 0.13 });
    }
    // < 500 m²: jen stoly

    // Carve rooms from one end of the region — alternating along the long axis
    let bench = { ...region };
    if (horiz) {
      let cursor = bench.x + bench.w;
      rooms.forEach(rm => {
        const rw = Math.min(bench.w * rm.ratio * 1.2, 130);
        const rh = Math.min(bench.h * 0.55, rm.kind === 'mtg' ? 120 : 78);
        const r = { x: cursor - rw, y: bench.y + (bench.h - rh) / 2, w: rw, h: rh };
        if (rm.kind === 'mtg') drawMeeting(g, r);
        else drawPrivateOffice(g, r);
        cursor -= (rw + 16);
      });
      bench.w = cursor - bench.x - 6;
    } else {
      let cursor = bench.y + bench.h;
      rooms.forEach(rm => {
        const rh = Math.min(bench.h * rm.ratio * 1.2, 120);
        const rw = Math.min(bench.w * 0.55, rm.kind === 'mtg' ? 130 : 86);
        const r = { x: bench.x + (bench.w - rw) / 2, y: cursor - rh, w: rw, h: rh };
        if (rm.kind === 'mtg') drawMeeting(g, r);
        else drawPrivateOffice(g, r);
        cursor -= (rh + 16);
      });
      bench.h = cursor - bench.y - 6;
    }

    if (bench.w > DESK_PITCH * 2 && bench.h > ROW_PITCH) fillBenches(g, bench);
    return g;
  }

  // ---------- Render ----------
  function render() {
    // Table + totals
    let total = 0;
    tableBody.innerHTML = '';
    if (selected.size === 0) {
      const tr = document.createElement('tr');
      tr.className = 'empty';
      tr.innerHTML = '<td colspan="3">Zatím nic nevybráno.</td>';
      tableBody.appendChild(tr);
    } else {
      [...selected].map(id => info(id)).filter(Boolean)
        .sort((a, b) => a.code.localeCompare(b.code))
        .forEach(u => {
          total += u.area;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td><span class="sel-dot" style="background:${buildings[u.bldg].accent}"></span>${u.code}</td><td>${buildings[u.bldg].label}</td><td class="num">${u.area}</td>`;
          tableBody.appendChild(tr);
        });
    }
    totalEl.textContent = total.toLocaleString('cs-CZ');
    countEl.textContent = selected.size === 0
      ? 'Žádná jednotka nevybrána'
      : `${selected.size} ${selected.size === 1 ? 'jednotka' : selected.size < 5 ? 'jednotky' : 'jednotek'}`;

    // Selected state on rects
    unitsG.querySelectorAll('.unit').forEach(g => {
      g.classList.toggle('selected', selected.has(g.dataset.id));
    });

    // Rebuild fitouts — per individual unit, no merging
    fitG.innerHTML = '';
    if (selected.size === 0) return;
    [...selected].map(id => info(id)).filter(Boolean).forEach(u => {
      fitG.appendChild(buildClusterFitout([u]));
    });
  }

  function showHover(u) {
    if (!u) {
      hoverBldg.innerHTML = '—';
      hoverUnit.textContent = 'Najeďte na jednotku';
      hoverArea.textContent = '— m²';
      hoverDesc.innerHTML = '&nbsp;';
      return;
    }
    const b = buildings[u.bldg];
    hoverBldg.innerHTML = `<span class="hover-dot" style="background:${b.accent}"></span> ${b.label} — ${b.char}`;
    hoverUnit.textContent = `Jednotka ${u.code}`;
    hoverArea.textContent = `${u.area} m²`;
    hoverDesc.textContent = u.desc;
  }

  unitsG.addEventListener('mouseover', (e) => {
    const g = e.target.closest('.unit'); if (!g) return;
    showHover(info(g.dataset.id)); g.classList.add('hovered');
  });
  unitsG.addEventListener('mouseout', (e) => {
    const g = e.target.closest('.unit'); if (!g) return;
    g.classList.remove('hovered');
  });
  unitsG.addEventListener('click', (e) => {
    const g = e.target.closest('.unit'); if (!g) return;
    const id = g.dataset.id;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    render();
  });
  clearBtn.addEventListener('click', () => { selected.clear(); render(); });

  render();
})();
