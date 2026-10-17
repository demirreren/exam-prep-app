/* ===== core.js : state, storage, math rendering, plots, shell, problem + drill engines + plan + cheat sheet =====
   Everything course-specific comes from CONFIG (content/<course>/00_config.js). */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- storage (works with storage blocked) ---------- */
const KEY = CONFIG.storageKey;
const ST = { done: {}, redo: {}, read: {}, blk: {}, pos: {}, dright: {}, missed: [], endless: { n: 0, right: 0 }, tab: 'plan', lesson: CONFIG.lessons[0][0], pf: { tag: 'must', topic: 'all' } };
try { const raw = localStorage.getItem(KEY); if (raw) Object.assign(ST, JSON.parse(raw)); } catch (e) { /* storage blocked: run in memory */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { /* ignore */ } }

/* ---------- math ---------- */
function kt(t, disp) {
  if (!window.katex) return '<code>' + esc(t) + '</code>';
  try { return katex.renderToString(t, { displayMode: disp, throwOnError: false, strict: false, trust: false }); }
  catch (e) { return '<code>' + esc(t) + '</code>'; }
}
function tex(s) { return String(s).replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => kt(t, true)).replace(/\$([^$]+?)\$/g, (m, t) => kt(t, false)); }
function setH(el, html) { el.innerHTML = tex(html); return el; }
function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) setH(e, html); return e; }

/* ---------- registries ---------- */
const TOPICS = {}, TSHORT = {};
CONFIG.topics.forEach(([k, name, short]) => { TOPICS[k] = name; TSHORT[k] = short || name; });
const LORDER = CONFIG.lessons.map(l => l[0]), LNAME = {};
CONFIG.lessons.forEach(([k, name]) => { LNAME[k] = name; });
const PROBLEMS = [], PBY = {}, LESSONS = {}, DRILL = [], WIDGETS = {}, FIGS = {}, WALKS = {}, PLAIN = {};
function W(w) { WALKS[w.id] = w; }
function P(p) { PROBLEMS.push(p); PBY[p.id] = p; }
function L(l) { LESSONS[l.id] = l; }
function hashStr(s) { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0; return x.toString(36); }
function D(topic, q, opts, why) { DRILL.push({ id: 'd' + hashStr(q), topic, q, opts: opts.map((o, i) => ({ h: o, ok: i === 0 })), why }); }

/* ---------- svg plot helper ---------- */
function Plot(o) {
  const m = Object.assign({ l: 30, r: 10, t: 10, b: 24 }, o.m || {}), W = o.w || 320, H = o.h || 190;
  const sx = v => m.l + (v - o.x[0]) / (o.x[1] - o.x[0]) * (W - m.l - m.r), sy = v => H - m.b - (v - o.y[0]) / (o.y[1] - o.y[0]) * (H - m.t - m.b);
  let s = '';
  const n = v => Math.round(v * 10) / 10, cid = 'cp' + (++Plot.n);
  const api = {
    sx, sy, W, H, m, cid,
    frame() { s += `<rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" class="ax f-none"/>`; return api; },
    zero() { if (o.y[0] < 0 && o.y[1] > 0) s += `<line x1="${m.l}" x2="${W - m.r}" y1="${n(sy(0))}" y2="${n(sy(0))}" class="grid"/>`; if (o.x[0] < 0 && o.x[1] > 0) s += `<line y1="${m.t}" y2="${H - m.b}" x1="${n(sx(0))}" x2="${n(sx(0))}" class="grid"/>`; return api; },
    xt(ticks, fmt) { ticks.forEach(t => { s += `<line x1="${n(sx(t))}" x2="${n(sx(t))}" y1="${H - m.b}" y2="${H - m.b + 3}" class="ax"/><text x="${n(sx(t))}" y="${H - m.b + 13}" text-anchor="middle">${fmt ? fmt(t) : t}</text>`; }); return api; },
    yt(ticks, fmt) { ticks.forEach(t => { s += `<line x1="${m.l - 3}" x2="${m.l}" y1="${n(sy(t))}" y2="${n(sy(t))}" class="ax"/><text x="${m.l - 5}" y="${n(sy(t)) + 3}" text-anchor="end">${fmt ? fmt(t) : t}</text>`; }); return api; },
    xl(t) { s += `<text x="${(m.l + W - m.r) / 2}" y="${H - 2}" text-anchor="middle">${t}</text>`; return api; },
    yl(t) { s += `<text transform="translate(9 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle">${t}</text>`; return api; },
    line(pts, cls, extra) { s += `<polyline clip-path="url(#${cid})" class="ln ${cls || 'c-ink'}" ${extra || ''} points="${pts.map(p => n(sx(p[0])) + ',' + n(sy(p[1]))).join(' ')}"/>`; return api; },
    fn(f, cls, extra, N = 120) { const pts = []; for (let i = 0; i <= N; i++) { const x = o.x[0] + (o.x[1] - o.x[0]) * i / N, y = f(x); if (isFinite(y)) pts.push([x, clamp(y, o.y[0] - (o.y[1] - o.y[0]), o.y[1] + (o.y[1] - o.y[0]))]); } return api.line(pts, cls, extra); },
    dots(pts, cls, r) { pts.forEach(p => { s += `<circle cx="${n(sx(p[0]))}" cy="${n(sy(p[1]))}" r="${r || 2.6}" class="pt ${cls || ''}"/>`; }); return api; },
    text(x, y, t, cls, anchor) { s += `<text x="${n(sx(x))}" y="${n(sy(y))}" class="${cls || ''}" text-anchor="${anchor || 'start'}">${t}</text>`; return api; },
    vline(x, cls, extra) { s += `<line x1="${n(sx(x))}" x2="${n(sx(x))}" y1="${m.t}" y2="${H - m.b}" class="${cls || 'grid'}" ${extra || ''}/>`; return api; },
    raw(t) { s += t; return api; },
    svg(label, cls) { return `<svg viewBox="0 0 ${W} ${H}" class="plot ${cls || ''}" role="img" aria-label="${esc(label || 'plot')}"><clipPath id="${cid}"><rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}"/></clipPath>${s}</svg>`; }
  };
  return api;
}
Plot.n = 0;
const ysub = (k, base = 'y') => `${base}<tspan dy="3" font-size="8">(${k})</tspan><tspan dy="-3"> </tspan>`;

/* ---------- shell ---------- */
const EXAM = new Date(CONFIG.examStart).getTime(), EXAM_END = new Date(CONFIG.examEnd).getTime();
function tick() {
  const el = $('#count'); if (!el) return; const now = Date.now(), ms = EXAM - now;
  if (now > EXAM_END) el.innerHTML = CONFIG.examShort + ' is done'; else if (ms <= 0) el.innerHTML = '<b>' + CONFIG.examShort + ' is on now</b>';
  else if (ms > 72 * 3600000) el.innerHTML = `<b>${Math.floor(ms / 86400000)} days</b> to ${CONFIG.examWhen}`;
  else { const hh = Math.floor(ms / 3600000), mm = Math.floor(ms % 3600000 / 60000); el.innerHTML = `<b>${hh} h ${String(mm).padStart(2, '0')} min</b> to ${CONFIG.examWhen}`; }
}
const TABS = [['plan', 'Plan'], ['learn', 'Learn'], ['problems', 'Problems'], ['drill', 'Drill'], ['sheet', '<span class="wide">Cheat </span>sheet']];
function go(tab, keepScroll) {
  ST.tab = tab; save();
  $$('.tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false'));
  const m = $('#main'); m.innerHTML = '';
  ({ plan: renderPlan, learn: renderLearn, problems: renderProblems, drill: renderDrill, sheet: renderSheet })[tab](m);
  if (!keepScroll) window.scrollTo(0, 0);
  try { history.replaceState(null, '', '#' + tab); } catch (e) { /* ignore */ }
}
function scrollToEl(el) { if (!el) return; const y = el.getBoundingClientRect().top + window.scrollY - ($('.bar').offsetHeight + 10); window.scrollTo({ top: y, behavior: 'auto' }); }
function openLesson(id) { ST.lesson = id; go('learn'); }
function openProblem(id) {
  const p = PBY[id]; ST.pf = { tag: 'all', topic: p.topic }; go('problems');
  const row = $('#prow-' + id); if (row) { if (!row.classList.contains('open')) row.querySelector('.ph').click(); scrollToEl(row); }
}

/* ---------- problem engine ---------- */
function status(id) { return ST.redo[id] ? 'redo' : ST.done[id] ? 'done' : ''; }
function mountProblem(host, p, onChange) {
  const q = typeof p.q === 'function' ? p.q() : p.q;
  const built = typeof p.steps === 'function' ? p.steps() : { steps: p.steps, ans: p.ans };
  const steps = built.steps, ans = built.ans || p.ans;
  host.innerHTML = '';
  if (PLAIN[p.id]) host.appendChild(h('div', 'plain', PLAIN[p.id]));
  if (p.scope) host.appendChild(h('div', 'warn', CONFIG.scopeWarning));
  const qEl = h('div', 'pq prose', q); host.appendChild(qEl);
  if (p.fig) { const f = h('div', '', ''); f.innerHTML = tex(FIGS[p.fig]()); qEl.appendChild(f); }
  if (p.marks) host.appendChild(h('div', 'marks', 'Marks in the key: ' + p.marks));
  if (p.note) host.appendChild(h('div', 'flag', p.note));
  const top = h('div', 'row', ''); const all = h('button', 'linkbtn', 'Reveal everything'); top.appendChild(all); host.appendChild(top);
  const list = h('div', '', ''); list.style.cssText = 'display:flex;flex-direction:column;gap:8px;min-width:0'; host.appendChild(list);
  const end = h('div', '', ''); end.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:0'; host.appendChild(end);
  let shown = 0;
  function reveal(i) {
    const st = steps[i], box = list.children[i], sb = box.querySelector('.sb');
    setH(sb, '<div class="prose">' + st.h + '</div>'); box.dataset.open = '1'; box.querySelector('.sh span').textContent = '';
    if (i + 1 > shown) shown = i + 1;
    if (shown < steps.length) addStep(shown); else finish();
  }
  function addStep(i) {
    if (list.children[i]) return;
    const st = steps[i], box = h('div', 'step', '');
    box.innerHTML = `<div class="sh"><b>Step ${i + 1}. ${esc(st.t)}</b><span>Work it out on paper first</span></div><div class="sb"></div>`;
    const sb = box.querySelector('.sb');
    if (st.pick) {
      const pk = h('div', 'pick', ''); pk.appendChild(h('div', '', st.pick.q));
      const opts = h('div', 'opts', ''); const hint = h('div', 'hint', '');
      st.pick.opts.forEach(o => {
        const b = h('button', 'opt', o[0]); b.type = 'button';
        b.onclick = () => { if (o[1]) { b.classList.add('yes'); reveal(i); } else { b.classList.add('no'); setH(hint, o[2] || 'Not that one. Try again.'); } };
        opts.appendChild(b);
      });
      pk.appendChild(opts); pk.appendChild(hint);
      const sm = h('button', 'linkbtn', 'Show me'); sm.type = 'button'; sm.onclick = () => reveal(i); pk.appendChild(sm);
      sb.appendChild(pk);
    } else {
      const b = h('button', 'btn sm quiet', 'Reveal step ' + (i + 1)); b.type = 'button'; b.onclick = () => reveal(i); sb.appendChild(b);
    }
    list.appendChild(box);
  }
  function finish() {
    if (end.children.length) return;
    end.appendChild(h('div', 'ans', ans));
    const r = h('div', 'row', '');
    const g = h('button', 'btn sm good', 'Got it'), rd = h('button', 'btn sm warnb', 'Redo later'), hd = h('button', 'linkbtn', 'Hide the steps and try again');
    g.onclick = () => { ST.done[p.id] = 1; delete ST.redo[p.id]; save(); mark(); if (onChange) onChange(); };
    rd.onclick = () => { ST.redo[p.id] = 1; save(); mark(); if (onChange) onChange(); };
    hd.onclick = () => mountProblem(host, p, onChange);
    const lab = h('span', 'marks', ''); r.appendChild(g); r.appendChild(rd); r.appendChild(hd); r.appendChild(lab); end.appendChild(r);
    function mark() { lab.textContent = status(p.id) === 'done' ? 'Marked done' : status(p.id) === 'redo' ? 'In your redo pile' : ''; }
    mark();
  }
  all.onclick = () => { for (let i = 0; i < steps.length; i++) { addStep(i); const box = list.children[i]; setH(box.querySelector('.sb'), '<div class="prose">' + steps[i].h + '</div>'); box.querySelector('.sh span').textContent = ''; } shown = steps.length; finish(); };
  addStep(0);
}
function problemRow(p, onChange) {
  const row = h('div', 'prow', ''); row.id = 'prow-' + p.id;
  const tagName = { must: 'Must do', extra: 'Extra', low: 'Low priority' }[p.tag];
  row.innerHTML = `<button class="ph" type="button" aria-expanded="false"><span class="dot ${status(p.id)}"></span><span class="nm"></span><span class="src">${esc(p.src)}</span><span class="tag ${p.tag}">${tagName}</span></button>`;
  setH(row.querySelector('.nm'), p.name);
  const head = row.querySelector('.ph'); let body = null;
  head.onclick = () => {
    if (body) { body.remove(); body = null; row.classList.remove('open'); head.setAttribute('aria-expanded', 'false'); return; }
    body = h('div', 'pbody', ''); row.appendChild(body); row.classList.add('open'); head.setAttribute('aria-expanded', 'true');
    mountProblem(body, p, () => { row.querySelector('.dot').className = 'dot ' + status(p.id); if (onChange) onChange(); });
  };
  return row;
}
function renderProblems(m) {
  const v = h('div', 'view', ''); m.appendChild(v);
  v.appendChild(h('h1', 'h-page', 'Problems'));
  v.appendChild(h('p', 'lede', CONFIG.problemsLede));
  const f1 = h('div', 'chips', ''), f2 = h('div', 'chips', ''); v.appendChild(f1); v.appendChild(f2);
  const out = h('div', '', ''); out.style.cssText = 'display:flex;flex-direction:column;gap:14px;min-width:0'; v.appendChild(out);
  function chips() {
    f1.innerHTML = ''; f2.innerHTML = '';
    [['must', 'Must do'], ['all', 'Everything'], ['redo', 'Redo pile']].forEach(([k, n]) => { const c = h('button', 'chip', n + (k === 'redo' ? ' (' + Object.keys(ST.redo).length + ')' : '')); c.setAttribute('aria-pressed', ST.pf.tag === k); c.onclick = () => { ST.pf.tag = k; save(); chips(); list(); }; f1.appendChild(c); });
    [['all', 'All topics']].concat(Object.keys(TOPICS).map(k => [k, k + ' ' + TSHORT[k]])).forEach(([k, n]) => { const c = h('button', 'chip', n); c.setAttribute('aria-pressed', ST.pf.topic === k); c.onclick = () => { ST.pf.topic = k; save(); chips(); list(); }; f2.appendChild(c); });
  }
  function list() {
    out.innerHTML = ''; let n = 0;
    Object.keys(TOPICS).forEach(t => {
      if (ST.pf.topic !== 'all' && ST.pf.topic !== t) return;
      const ps = PROBLEMS.filter(p => p.topic === t && (ST.pf.tag === 'all' || (ST.pf.tag === 'must' && p.tag === 'must') || (ST.pf.tag === 'redo' && ST.redo[p.id])));
      if (!ps.length) return; n += ps.length;
      const g = h('div', 'grp', ''); g.appendChild(h('h2', '', t + '. ' + TOPICS[t]));
      ps.forEach(p => g.appendChild(problemRow(p, () => { if (ST.pf.tag === 'redo') chips(); else f1.lastChild.textContent = 'Redo pile (' + Object.keys(ST.redo).length + ')'; })));
      out.appendChild(g);
    });
    if (!n) out.appendChild(h('p', 'lede', ST.pf.tag === 'redo' ? 'Your redo pile is empty. Press "Redo later" at the end of a problem to put it here.' : 'Nothing matches this filter.'));
  }
  chips(); list();
}

/* ---------- lessons ---------- */
function renderNotes(l, cards) {
  l.cards.forEach((c, i) => {
    const el = h('section', 'card' + (i === 0 ? ' hero' : ''), '');
    if (c.h) el.appendChild(h('h3', '', c.h));
    if (c.fig) { const f = h('div', '', ''); f.innerHTML = tex(FIGS[c.fig]()); el.appendChild(f); }
    if (c.b) el.appendChild(h('div', 'prose', c.b));
    if (c.w) { const w = h('div', 'wg', ''); el.appendChild(w); WIDGETS[c.w](w); }
    if (c.after) el.appendChild(h('div', 'prose', c.after));
    cards.appendChild(el);
  });
  if (l.checks) {
    const el = h('section', 'card', ''); el.appendChild(h('h3', '', 'Quick checks'));
    l.checks.forEach(([q, a]) => { const d = h('div', 'qc', ''); d.appendChild(h('div', '', q)); const b = h('button', 'linkbtn', 'Show answer'); const ad = h('div', 'a', a); ad.hidden = true; b.onclick = () => { ad.hidden = !ad.hidden; b.textContent = ad.hidden ? 'Show answer' : 'Hide answer'; }; d.appendChild(b); d.appendChild(ad); el.appendChild(d); });
    cards.appendChild(el);
  }
  const el = h('section', 'card', ''); el.appendChild(h('h3', '', 'Do these next'));
  const items = h('div', 'items', ''); (l.next || []).filter(id => PBY[id]).forEach(id => items.appendChild(itemRow(id))); el.appendChild(items);
  cards.appendChild(el);
}
function itemRow(id) {
  const p = PBY[id]; const b = h('button', 'item', ''); b.type = 'button';
  b.innerHTML = `<span class="dot ${status(id)}"></span><span class="nm"></span><span class="src">${esc(p.src)}</span>`;
  setH(b.querySelector('.nm'), p.name); b.onclick = () => openProblem(id); return b;
}

/* ---------- drill ---------- */
let DR = null;
function renderDrill(m) {
  const v = h('div', 'view', ''); m.appendChild(v);
  v.appendChild(h('h1', 'h-page', 'Drill'));
  v.appendChild(h('p', 'lede', CONFIG.drillLede));
  const fixedTotal = DRILL.length, rightN = DRILL.filter(d => ST.dright[d.id]).length;
  const cfg = h('div', '', ''); cfg.style.cssText = 'display:flex;flex-direction:column;gap:10px'; v.appendChild(cfg);
  const stage = h('div', '', ''); stage.style.cssText = 'display:flex;flex-direction:column;gap:12px;min-width:0'; v.appendChild(stage);
  let mode = 'set', topic = 'all';
  function draw() {
    cfg.innerHTML = '';
    const r1 = h('div', 'chips', '');
    [['set', `Question set (${rightN}/${fixedTotal} right)`], ['endless', 'Endless, random numbers'], ['missed', `Missed pile (${ST.missed.length})`]].forEach(([k, n]) => { const c = h('button', 'chip', n); c.setAttribute('aria-pressed', mode === k); c.onclick = () => { mode = k; draw(); }; r1.appendChild(c); });
    cfg.appendChild(r1);
    if (mode !== 'missed') { const r2 = h('div', 'chips', ''); [['all', 'All topics']].concat(Object.keys(TOPICS).map(k => [k, k + ' ' + TSHORT[k]])).forEach(([k, n]) => { const c = h('button', 'chip', n); c.setAttribute('aria-pressed', topic === k); c.onclick = () => { topic = k; draw(); }; r2.appendChild(c); }); cfg.appendChild(r2); }
    const st = h('button', 'btn', mode === 'endless' ? 'Start endless drill' : 'Start a round'); st.id = 'drill-start'; st.onclick = start; const rr = h('div', 'row', ''); rr.appendChild(st); cfg.appendChild(rr);
    stage.innerHTML = '';
    if (mode === 'endless') stage.appendChild(h('p', 'lede', `Endless so far: ${ST.endless.right} right out of ${ST.endless.n}. Every question is built from fresh random numbers and the answer is computed, not stored.`));
  }
  function start() {
    let queue = [];
    if (mode === 'set') { const pool = shuffle(DRILL.filter(d => topic === 'all' ? !d.scope : d.topic === topic)); queue = pool.filter(d => !ST.dright[d.id]).concat(pool.filter(d => ST.dright[d.id])).slice(0, 12); }
    else if (mode === 'missed') queue = shuffle(ST.missed.map(x => typeof x === 'string' ? DRILL.find(d => d.id === x) : x).filter(Boolean)).slice(0, 12);
    if (mode !== 'endless' && !queue.length) { stage.innerHTML = ''; stage.appendChild(h('p', 'lede', mode === 'missed' ? 'Nothing in the missed pile. Anything you get wrong lands here and stays until you get it right.' : 'No questions for this topic.')); return; }
    DR = { mode, topic, queue, i: 0, right: 0, n: 0, wrong: [] }; cfg.hidden = true; ask();
  }
  function nextGen() {
    const ws = GEN_WEIGHTS.filter(([k, w]) => w > 0 && (DR.topic === 'all' || GEN_TOPIC[k] === DR.topic));
    if (!ws.length) return null;
    let tot = ws.reduce((s, w) => s + w[1], 0), r = Math.random() * tot; for (const [k, w] of ws) { if ((r -= w) <= 0) { const g = GEN[k](); g.id = 'g' + Date.now() + Math.floor(Math.random() * 1e4); return g; } }
    const g0 = GEN[ws[0][0]](); g0.id = 'g' + Date.now() + Math.floor(Math.random() * 1e4); return g0;
  }
  function ask() {
    stage.innerHTML = '';
    const q = DR.mode === 'endless' ? nextGen() : DR.queue[DR.i];
    if (!q) { stage.appendChild(h('p', 'lede', 'There is no random-number generator for this topic. Pick another topic or use the question set.')); const b = h('button', 'btn quiet', 'Back'); b.onclick = () => { cfg.hidden = false; draw(); }; stage.appendChild(b); return; }
    const box = h('div', 'dq', '');
    box.appendChild(h('div', 'row', `<span class="tag topic">${q.topic} ${TSHORT[q.topic]}</span><span class="marks">${DR.mode === 'endless' ? 'Question ' + (DR.n + 1) + ', ' + DR.right + ' right so far' : 'Question ' + (DR.i + 1) + ' of ' + DR.queue.length}</span>`));
    box.appendChild(h('div', 'q', q.q));
    const opts = h('div', 'dopts', ''); const order = shuffle(q.opts); const fb = h('div', '', ''); window.__dq = q; window.__dorder = order;
    order.forEach(o => {
      const b = h('button', 'dopt', o.h); b.type = 'button';
      b.onclick = () => {
        $$('.dopt', opts).forEach((x, j) => { x.disabled = true; if (order[j].ok) x.classList.add('yes'); });
        DR.n++; const isGen = q.id[0] === 'g';
        if (o.ok) { DR.right++; if (isGen) { ST.endless.right++; ST.endless.n++; } else ST.dright[q.id] = 1; ST.missed = ST.missed.filter(x => (typeof x === 'string' ? x : x.id) !== q.id); fb.className = 'fb ok'; setH(fb, '<b>Right.</b>' + q.why); }
        else { b.classList.add('no'); DR.wrong.push(q); if (isGen) ST.endless.n++; else delete ST.dright[q.id]; if (!ST.missed.some(x => (typeof x === 'string' ? x : x.id) === q.id)) ST.missed.push(isGen ? { id: q.id, topic: q.topic, q: q.q, opts: q.opts, why: q.why } : q.id); if (ST.missed.length > 60) ST.missed.shift(); fb.className = 'fb bad'; setH(fb, '<b>Not quite.</b>' + (o.why ? o.why + ' ' : '') + q.why); }
        save();
        const nx = h('button', 'btn', DR.mode !== 'endless' && DR.i + 1 >= DR.queue.length ? 'See score' : 'Next'); nx.id = 'drill-next'; nx.onclick = () => { DR.i++; if (DR.mode !== 'endless' && DR.i >= DR.queue.length) score(); else ask(); };
        const r = h('div', 'row', ''); r.appendChild(nx);
        if (DR.mode === 'endless') { const e = h('button', 'btn quiet', 'End drill'); e.onclick = score; r.appendChild(e); }
        box.appendChild(r);
      };
      opts.appendChild(b);
    });
    box.appendChild(opts); box.appendChild(fb); stage.appendChild(box);
  }
  function score() {
    stage.innerHTML = ''; const box = h('div', 'dq', '');
    box.appendChild(h('h2', 'h-sec', `${DR.right} out of ${DR.n} right`));
    box.appendChild(h('p', '', DR.wrong.length ? 'These went into your missed pile. They stay there until you get them right.' : 'Clean round.'));
    if (DR.wrong.length) { const ul = h('ul', '', ''); DR.wrong.forEach(q => ul.appendChild(h('li', '', q.q))); box.appendChild(ul); }
    const again = h('button', 'btn', 'Another round'); again.onclick = () => { cfg.hidden = false; go('drill'); };
    const r = h('div', 'row', ''); r.appendChild(again); box.appendChild(r); stage.appendChild(box);
  }
  draw();
}

/* ---------- plan ---------- */
function renderPlan(m) {
  const v = h('div', 'view', ''); m.appendChild(v);
  const must = PROBLEMS.filter(p => p.tag === 'must'), mustDone = must.filter(p => ST.done[p.id]).length, readN = Object.keys(LESSONS).filter(k => ST.read[k]).length;
  const dr = DRILL.filter(d => ST.dright[d.id]).length, redoN = Object.keys(ST.redo).length;
  v.appendChild(h('div', 'eyebrow', CONFIG.examLong));
  v.appendChild(h('h1', 'h-page', PLAN.headline));
  v.appendChild(h('p', 'lede', PLAN.lede));
  v.appendChild(h('div', 'howto', PLAN.howto));
  const cta = h('button', 'btn', (mustDone || readN) ? 'Continue' : 'Start'); cta.id = 'plan-cta';
  const ctaNote = h('span', 'marks', ''); const r = h('div', 'row', ''); r.appendChild(cta); r.appendChild(ctaNote); v.appendChild(r);
  const stats = h('div', 'stats', `<div class="stat"><b>${mustDone}/${must.length}</b><span>must-do problems done</span></div><div class="stat"><b>${readN}/${Object.keys(LESSONS).length}</b><span>lessons read</span></div><div class="stat"><b>${dr}/${DRILL.length}</b><span>drill questions right</span></div><div class="stat"><b>${redoN}</b><span>in the redo pile</span></div>`); v.appendChild(stats);
  const totalItems = must.length + Object.keys(LESSONS).length, pct = Math.round(100 * (mustDone + readN) / totalItems);
  v.appendChild(h('div', 'prog', `<i style="width:${pct}%"></i>`));
  let next = null;
  const wrap = h('div', '', ''); v.appendChild(wrap);
  PLAN.blocks.forEach((b, i) => {
    const el = h('div', 'block', '');
    el.innerHTML = `<div class="num">${i + 1}</div><div class="bh"><h3></h3><span class="min">${b.min} min</span></div><div class="body"><p class="why"></p></div>`;
    setH(el.querySelector('h3'), b.title); setH(el.querySelector('.why'), b.why);
    const body = el.querySelector('.body');
    if (b.pre) body.appendChild(h('div', 'tmpl', b.pre));
    const items = h('div', 'items', '');
    if (b.lesson && LESSONS[b.lesson]) { const lb = h('button', 'item', `<span class="dot ${ST.read[b.lesson] ? 'done' : ''}"></span><span class="nm">Lesson: ${LNAME[b.lesson]} (step-by-step walkthrough)</span><span class="src">start here</span>`); lb.onclick = () => openLesson(b.lesson); items.appendChild(lb); if (!next && !ST.read[b.lesson]) next = { n: 'the lesson "' + LNAME[b.lesson] + '"', f: () => openLesson(b.lesson) }; }
    if (b.lesson && !LESSONS[b.lesson]) items.appendChild(h('div', 'marks', 'This lesson and its problems are being added. Check back shortly.'));
    (b.probs || []).filter(id => PBY[id]).forEach(id => { items.appendChild(itemRow(id)); if (!next && !ST.done[id]) next = { n: PBY[id].name, f: () => openProblem(id) }; });
    (b.links || []).forEach(([n, f]) => { const lb = h('button', 'item', `<span class="dot"></span><span class="nm">${n}</span>`); lb.onclick = f; items.appendChild(lb); });
    body.appendChild(items);
    if (b.manual) { const cb = h('button', 'btn sm ' + (ST.blk[b.id] ? 'good' : 'quiet'), ST.blk[b.id] ? 'Block done ✓' : 'Mark block done'); cb.style.marginTop = '8px'; cb.onclick = () => { ST.blk[b.id] = ST.blk[b.id] ? 0 : 1; save(); go('plan', true); }; body.appendChild(cb); if (!next && !ST.blk[b.id] && !(b.probs || []).length) next = { n: b.title, f: () => scrollToEl(el) }; }
    wrap.appendChild(el);
  });
  v.appendChild(h('p', 'logi', PLAN.logistics));
  if (next) { setH(ctaNote, 'Next up: ' + next.n); cta.onclick = next.f; } else { ctaNote.textContent = 'Everything on the plan is done.'; cta.onclick = () => go('drill'); }
}

/* ---------- cheat sheet ---------- */
function sheetItemsHTML(sec) { return sec.rows.map(r => `<div class="it">${r[0] ? '<b class="k">' + r[0] + '</b> ' : ''}${r[2] || r[1]}</div>`).join(''); }
function buildPrintSheet() {
  const host = $('#printsheet'); if (host.dataset.built) return; host.dataset.built = '1';
  let html = '';
  const pages = CONFIG.sheet.pages;
  for (let pg = 1; pg <= pages.length; pg++) {
    html += `<div class="pg"><div class="hd"><span><b>${CONFIG.sheet.title}</b> &nbsp;${pages[pg - 1]}</span><span>side ${pg} of ${pages.length}</span></div>`;
    SHEET.filter(s => s.page === pg).forEach(s => { html += `<section><h2>${s.title}</h2>${s.print ? s.print() : sheetItemsHTML(s)}</section>`; });
    html += '</div>';
  }
  host.innerHTML = tex(html);
}
function renderSheet(m) {
  const v = h('div', 'view', ''); m.appendChild(v);
  v.appendChild(h('h1', 'h-page', 'Cheat sheet'));
  v.appendChild(h('p', 'lede', CONFIG.sheet.lede));
  const r = h('div', 'row', ''); const pdf = h('button', 'btn', 'Save the PDF'); pdf.id = 'sheet-pdf'; const qz = h('button', 'btn ghost', 'Quiz me'); qz.id = 'sheet-quiz'; const note = h('span', 'marks', '');
  r.appendChild(pdf); r.appendChild(qz); r.appendChild(note); v.appendChild(r);
  pdf.onclick = async () => {
    note.textContent = '';
    try {
      const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
      if (!dl || !window.SHEET_PDF_B64) throw { code: 'unavailable' };
      const bin = atob(window.SHEET_PDF_B64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      await dl.save({ filename: CONFIG.sheet.filename, data: new Blob([u8]) }); note.textContent = 'Saved. Print it at 100% scale.';
    } catch (e) { note.textContent = e && e.code === 'declined' ? 'Save cancelled.' : e && e.code === 'rate_limited' ? 'A save prompt is already open. Try again in a moment.' : 'Saving a file is not available in this view. Use your browser\'s print command on this tab instead: only the cheat sheet prints.'; }
  };
  const body = h('div', '', ''); body.style.cssText = 'display:flex;flex-direction:column;gap:20px;min-width:0'; v.appendChild(body);
  qz.onclick = () => { const on = body.classList.toggle('quiz'); qz.textContent = on ? 'Stop quiz' : 'Quiz me'; setH(note, on ? 'Right-hand column is hidden. Say the answer, then tap a blurred cell to check.' : ''); if (!on) $$('.shown', body).forEach(x => x.classList.remove('shown')); };
  body.appendChild(h('div', 'card', STRATEGY));
  SHEET.forEach(s => {
    const sec = h('div', 'sheet-sec', ''); sec.appendChild(h('h3', '', `<span>${s.title}</span> <small>side ${s.page} of the sheet</small>`));
    const rows = s.rows.filter(r => r[0]);
    const extra = s.rows.filter(r => !r[0]);
    const t = h('div', 'tblwrap', `<table class="tbl">${rows.map(r => `<tr><td class="k">${r[0]}</td><td class="v">${r[1]}</td></tr>`).join('')}</table>`); sec.appendChild(t);
    extra.forEach(r => sec.appendChild(h('div', '', r[1])));
    body.appendChild(sec);
  });
  body.addEventListener('click', e => { const td = e.target.closest('td.v'); if (td && body.classList.contains('quiz')) td.classList.toggle('shown'); });
  buildPrintSheet();
}
window.__buildPrintSheet = buildPrintSheet;

/* ---------- boot ---------- */
function boot() {
  const bar = $('#tabs'); TABS.forEach(([k, n]) => { const b = h('button', 'tab', n); b.dataset.tab = k; b.setAttribute('role', 'tab'); b.onclick = () => go(k); bar.appendChild(b); });
  $('#symbtn').onclick = toggleSymbols;
  tick(); setInterval(tick, 20000);
  const hsh = (location.hash || '').replace('#', ''); if (TABS.some(t => t[0] === hsh)) ST.tab = hsh;
  go(TABS.some(t => t[0] === ST.tab) ? ST.tab : 'plan');
}
