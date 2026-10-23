// Web preview of the OEE dashboard. Same measures as analysis/oee_measures.dax,
// computed over the weekly aggregate written by analysis/build_case_studies.py.
(() => {
  const data = window.OEE_DATA;
  const root = document.getElementById('dashboard');
  if (!data || !root) return;
  root.hidden = false;

  const TARGET = 0.75;
  const SHIFTS = ['A', 'B', 'C'];
  const machines = Object.fromEntries(data.machines.map((m) => [m.machine, m]));
  const toObjects = ({ columns, rows }) => rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
  const production = toObjects(data.production);
  const downtime = toObjects(data.downtime);
  const weeks = [...new Set(production.map((r) => r.week))].sort();
  const state = { line: 'all', machine: 'all', shift: 'all' };
  const $ = (selector) => root.querySelector(selector);
  const pct = (v, digits = 1) => `${(100 * v).toFixed(digits)}%`;
  const num = new Intl.NumberFormat('en-US');

  const matches = (r, ignore = []) =>
    (ignore.includes('line') || state.line === 'all' || machines[r.machine].line === state.line) &&
    (ignore.includes('machine') || state.machine === 'all' || r.machine === state.machine) &&
    (ignore.includes('shift') || state.shift === 'all' || r.shift === state.shift);

  function measures(rows) {
    const s = { planned: 0, run: 0, ideal: 0, total: 0, good: 0, scrap: 0, target: 0 };
    for (const r of rows) {
      s.planned += r.planned_min; s.run += r.run_min; s.total += r.total_count; s.good += r.good_count;
      s.scrap += r.scrap_count; s.target += r.target_good;
      s.ideal += r.total_count * machines[r.machine].ideal_cycle_s / 60;
    }
    const a = s.run / s.planned, p = s.ideal / s.run, q = s.good / s.total;
    return { ...s, a, p, q, oee: a * p * q, scrapRate: s.scrap / s.total };
  }

  // Tooltip shared by every visual
  const tip = document.createElement('div');
  tip.className = 'dash-tip';
  tip.hidden = true;
  document.body.append(tip);
  root.addEventListener('pointermove', (event) => {
    const target = event.target.closest('[data-tip]');
    if (!target) { tip.hidden = true; return; }
    tip.innerHTML = target.dataset.tip;
    tip.hidden = false;
    tip.style.left = `${Math.min(event.clientX + 14, innerWidth - tip.offsetWidth - 8)}px`;
    tip.style.top = `${event.clientY - tip.offsetHeight - 12}px`;
  });
  root.addEventListener('pointerleave', () => { tip.hidden = true; });

  // Filters: plant > line > machine drill-down, plus shift
  const lineSelect = $('#f-line'), machineSelect = $('#f-machine'), shiftSelect = $('#f-shift');
  function fillMachines() {
    const options = data.machines.filter((m) => state.line === 'all' || m.line === state.line);
    machineSelect.innerHTML = '<option value="all">All machines</option>' +
      options.map((m) => `<option value="${m.machine}">${m.machine} · ${m.line}</option>`).join('');
    if (!options.some((m) => m.machine === state.machine)) state.machine = 'all';
    machineSelect.value = state.machine;
  }
  lineSelect.addEventListener('change', () => { state.line = lineSelect.value; fillMachines(); render(); });
  machineSelect.addEventListener('change', () => { state.machine = machineSelect.value; render(); });
  shiftSelect.addEventListener('change', () => { state.shift = shiftSelect.value; render(); });
  $('#f-reset').addEventListener('click', () => {
    Object.assign(state, { line: 'all', machine: 'all', shift: 'all' });
    lineSelect.value = shiftSelect.value = 'all';
    fillMachines();
    render();
  });

  function renderTiles(m) {
    const gap = m.oee - TARGET;
    const tiles = [
      ['OEE', pct(m.oee), `${gap >= 0 ? '+' : '−'}${(100 * Math.abs(gap)).toFixed(1)} pts vs 75% target`],
      ['Availability', pct(m.a), 'Run time ÷ planned time'],
      ['Performance', pct(m.p), 'Ideal time ÷ run time'],
      ['Quality · FPY', pct(m.q), 'Good ÷ total count'],
      ['Scrap rate', pct(m.scrapRate, 2), `${num.format(m.scrap)} parts`],
      ['Good vs target', pct(m.good / m.target, 0), `${num.format(m.good)} of ${num.format(m.target)}`],
    ];
    $('#d-tiles').innerHTML = tiles.map(([label, value, sub]) =>
      `<div class="dash-tile"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`).join('');
  }

  function renderTrend(rows) {
    const series = weeks.map((week) => ({ week, ...measures(rows.filter((r) => r.week === week)) }));
    // Drawn at the container's pixel width so text stays at its real size.
    const W = Math.max(280, $('#d-trend').clientWidth), H = 220, L = 40, R = 76, T = 12, B = 26;
    const values = series.map((s) => s.oee).concat(TARGET);
    const lo = Math.floor(Math.min(...values) * 20 - .5) / 20, hi = Math.ceil(Math.max(...values) * 20 + .5) / 20;
    const x = (i) => L + (i * (W - L - R)) / (series.length - 1);
    const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
    let grid = '';
    for (let v = lo; v <= hi + 1e-9; v += .05) {
      grid += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 100)}%</text>`;
    }
    const step = (W - L - R) / (series.length - 1);
    const marks = series.map((s, i) => `
      <g data-tip="<b>${s.week}</b><br>OEE ${pct(s.oee)}<br>A ${pct(s.a)} · P ${pct(s.p)} · Q ${pct(s.q)}">
        <rect class="hit" x="${x(i) - step / 2}" y="${T}" width="${step}" height="${H - T - B}"/>
        <circle class="dot" cx="${x(i)}" cy="${y(s.oee)}" r="4.5"/>
        ${i % (W < 420 ? 3 : 2) === 0 ? `<text class="axis" x="${x(i)}" y="${H - 6}" text-anchor="middle">${s.week}</text>` : ''}
      </g>`).join('');
    const range = series.map((s) => s.oee);
    $('#d-trend').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly OEE, ${series[0].week} to ${series.at(-1).week}, between ${pct(Math.min(...range))} and ${pct(Math.max(...range))}, against a 75% target. Values are in the table below.">
      ${grid}
      <line class="target" x1="${L}" x2="${W - R}" y1="${y(TARGET)}" y2="${y(TARGET)}"/>
      <text class="axis" x="${W - R + 6}" y="${y(TARGET) + 4}">Target 75%</text>
      <polyline class="series" points="${series.map((s, i) => `${x(i)},${y(s.oee)}`).join(' ')}"/>${marks}
    </svg>`;
    $('#d-trend-table').innerHTML = series.map((s) =>
      `<tr><th scope="row">${s.week}</th><td class="num">${pct(s.oee)}</td><td class="num">${pct(s.a)}</td><td class="num">${pct(s.p)}</td><td class="num">${pct(s.q)}</td></tr>`).join('');
  }

  function renderPareto() {
    const byReason = {};
    for (const r of downtime) if (matches(r)) byReason[r.reason] = (byReason[r.reason] || 0) + r.minutes;
    const sorted = Object.entries(byReason).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [, v]) => sum + v, 0);
    const max = sorted[0]?.[1] || 1;
    $('#d-pareto').innerHTML = sorted.length ? sorted.map(([reason, minutes]) => `
      <div class="bar-row" data-tip="<b>${reason}</b><br>${num.format(minutes)} min · ${pct(minutes / total)} of downtime">
        <span>${reason}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${(100 * minutes) / max}%"></span></span>
        <span class="bar-value">${num.format(minutes)} min · ${pct(minutes / total, 0)}</span>
      </div>`).join('') : '<p class="muted">No downtime recorded for this selection.</p>';
  }

  function renderMachines() {
    const visible = data.machines.filter((m) => state.line === 'all' || m.line === state.line);
    $('#d-machines').innerHTML = visible.map(({ machine, line }) => {
      const m = measures(production.filter((r) => r.machine === machine && matches(r, ['machine', 'line'])));
      return `<button type="button" class="bar-row" aria-pressed="${state.machine === machine}" data-machine="${machine}"
          aria-label="${machine}, ${line}: OEE ${pct(m.oee)}. Filter the dashboard to this machine."
          data-tip="<b>${machine} · ${line}</b><br>OEE ${pct(m.oee)}<br>A ${pct(m.a)} · P ${pct(m.p)} · Q ${pct(m.q)}">
        <span>${machine} <small>· ${line}</small></span>
        <span class="bar-track"><span class="bar-fill" style="width:${100 * m.oee}%"></span><span class="bar-target" style="left:${100 * TARGET}%"></span></span>
        <span class="bar-value">${pct(m.oee)}</span>
      </button>`;
    }).join('');
  }
  $('#d-machines').addEventListener('click', (event) => {
    const button = event.target.closest('[data-machine]');
    if (!button) return;
    const machine = button.dataset.machine;
    state.machine = state.machine === machine ? 'all' : machine;
    if (state.machine !== 'all') state.line = lineSelect.value = machines[machine].line;
    fillMachines();
    render();
    $(`[data-machine="${machine}"]`)?.focus();
  });

  function renderHeat() {
    const visible = data.machines.filter((m) => state.line === 'all' || m.line === state.line);
    const cells = visible.map(({ machine }) => SHIFTS.map((shift) =>
      measures(production.filter((r) => r.machine === machine && r.shift === shift)).scrapRate));
    const flat = cells.flat(), lo = Math.min(...flat), hi = Math.max(...flat);
    const light = [244, 227, 215], dark = [122, 56, 20];   // one hue, light to dark
    const ramp = (t) => light.map((v, i) => Math.round(v + (dark[i] - v) * t));
    // Pick the higher-contrast foreground for every shade, including filtered views.
    const foreground = (rgb) => {
      const linear = rgb.map((v) => {
        const channel = v / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
      const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
      return luminance > .179 ? '#000' : '#fff';
    };
    $('#d-heat').innerHTML = `<thead><tr><th scope="col">Machine</th>${SHIFTS.map((s) => `<th scope="col">Shift ${s}</th>`).join('')}</tr></thead><tbody>` +
      visible.map(({ machine }, i) => `<tr><th scope="row">${machine}</th>${cells[i].map((v, j) => {
        const t = hi > lo ? (v - lo) / (hi - lo) : 0;
        const rgb = ramp(t);
        return `<td style="background:rgb(${rgb.join(',')});color:${foreground(rgb)}" data-tip="<b>${machine} · Shift ${SHIFTS[j]}</b><br>Scrap ${pct(v, 2)}">${pct(v, 1)}</td>`;
      }).join('')}</tr>`).join('') + '</tbody>';
  }

  function render() {
    const rows = production.filter((r) => matches(r));
    const path = ['Plant 1', state.line === 'all' ? 'All lines' : state.line];
    if (state.machine !== 'all') path.push(state.machine);
    $('#d-path').textContent = `${path.join(' › ')} · ${state.shift === 'all' ? 'All shifts' : `Shift ${state.shift}`} · ${weeks[0]}–${weeks.at(-1)}`;
    renderTiles(measures(rows));
    renderTrend(rows);
    renderPareto();
    renderMachines();
    renderHeat();
  }

  fillMachines();
  render();
  let width = $('#d-trend').clientWidth;
  new ResizeObserver(() => {
    if ($('#d-trend').clientWidth === width) return;
    width = $('#d-trend').clientWidth;
    renderTrend(production.filter((r) => matches(r)));
  }).observe($('#d-trend'));
})();
