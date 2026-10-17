/* ===== walk_engine.js : one-step-at-a-time lessons, the symbol decoder, and the number-line helper =====
   LORDER and LNAME come from CONFIG.lessons (set up in core.js). SYMBOLS comes from the content. */

function renderLearn(m) {
  const v = h('div', 'view', ''); m.appendChild(v);
  const pickr = h('div', 'chips lchips', ''); v.appendChild(pickr);
  LORDER.forEach((k, i) => { const c = h('button', 'chip', (ST.read[k] ? '✓ ' : '') + (i + 1) + '. ' + LNAME[k]); c.setAttribute('aria-pressed', ST.lesson === k); c.onclick = () => openLesson(k); pickr.appendChild(c); });
  const id = WALKS[ST.lesson] ? ST.lesson : LORDER[0], w = WALKS[id], l = LESSONS[id], n = w.screens.length + 1;
  if (!ST.pos) ST.pos = {};
  let i = Math.min(ST.pos[id] || 0, n - 1);
  const head = h('div', 'whead', ''); v.appendChild(head);
  const stage = h('div', 'wstage', ''); v.appendChild(stage);
  const nav = h('div', 'wnav', ''); v.appendChild(nav);
  const notesWrap = h('div', '', ''); notesWrap.style.cssText = 'margin-top:26px'; v.appendChild(notesWrap);
  const nb = h('button', 'linkbtn', 'Show the exam-level notes for this topic (the dense version)'); nb.id = 'notes-toggle'; notesWrap.appendChild(nb);
  const notes = h('div', 'cards', ''); notes.hidden = true; notes.style.marginTop = '12px'; notesWrap.appendChild(notes);
  nb.onclick = () => { if (!notes.dataset.built) { notes.dataset.built = '1'; renderNotes(l, notes); } notes.hidden = !notes.hidden; nb.textContent = notes.hidden ? 'Show the exam-level notes for this topic (the dense version)' : 'Hide the exam-level notes'; };

  function draw(scroll) {
    ST.pos[id] = i; save();
    head.innerHTML = `<div class="eyebrow">Lesson ${LORDER.indexOf(id) + 1} of ${LORDER.length} · ${esc(LNAME[id])}</div><div class="wprog" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${i + 1}"><i style="width:${Math.round(100 * (i + 1) / n)}%"></i></div><div class="marks">Step ${i + 1} of ${n}</div>`;
    stage.innerHTML = ''; const el = h('section', 'scr', ''); stage.appendChild(el);
    if (i < w.screens.length) {
      const s = w.screens[i];
      el.appendChild(h('h2', '', s.h));
      if (s.b) el.appendChild(h('div', 'prose', s.b));
      if (s.fig) { const f = h('div', 'wfig', ''); f.innerHTML = tex(typeof s.fig === 'function' ? s.fig() : FIGS[s.fig]()); el.appendChild(f); }
      if (s.w) { const wd = h('div', 'wg', ''); el.appendChild(wd); WIDGETS[s.w](wd); }
      if (s.after) el.appendChild(h('div', 'prose', s.after));
      if (s.box) { const bx = h('div', 'exam', ''); bx.appendChild(h('div', 'examtag', s.boxTitle || 'How the exam writes it')); bx.appendChild(h('div', 'prose', s.box)); el.appendChild(bx); }
      if (s.q) {
        const qb = h('div', 'miniq', ''); qb.appendChild(h('div', 'examtag', 'Check yourself')); qb.appendChild(h('div', 'prose', s.q.q));
        const os = h('div', 'opts', ''), fb = h('div', 'mfb', '');
        s.q.opts.forEach(o => { const b = h('button', 'opt', o[0]); b.type = 'button'; b.onclick = () => { $$('.opt', os).forEach(x => x.classList.remove('no')); if (o[1]) { b.classList.add('yes'); fb.className = 'mfb ok'; setH(fb, '<b>Yes.</b> ' + (o[2] || '')); } else { b.classList.add('no'); fb.className = 'mfb bad'; setH(fb, '<b>Not quite.</b> ' + (o[2] || 'Try another one.')); } }; os.appendChild(b); });
        qb.appendChild(os); qb.appendChild(fb); el.appendChild(qb);
      }
    } else {
      ST.read[id] = 1; save(); pickr.children[LORDER.indexOf(id)].textContent = '✓ ' + (LORDER.indexOf(id) + 1) + '. ' + LNAME[id];
      el.appendChild(h('h2', '', 'You finished this lesson'));
      el.appendChild(h('div', 'prose', w.done || 'Now try one problem. The steps stay hidden until you ask for each one, so write your own attempt on paper first.'));
      if (l && l.doOne && PBY[l.doOne]) { const p = PBY[l.doOne]; const box = h('div', 'card', ''); box.appendChild(h('h3', '', p.name)); const host = h('div', '', ''); host.style.cssText = 'display:flex;flex-direction:column;gap:12px;min-width:0'; box.appendChild(host); mountProblem(host, p); el.appendChild(box); }
      if (l && l.next) { el.appendChild(h('h3', '', 'Then do these')); const items = h('div', 'items', ''); [l.doOne].concat(l.next).filter((x, k, a) => PBY[x] && a.indexOf(x) === k && x !== l.doOne).forEach(x => items.appendChild(itemRow(x))); el.appendChild(items); }
      const nx = LORDER[LORDER.indexOf(id) + 1];
      if (nx) { const b = h('button', 'btn ghost', 'Next lesson: ' + LNAME[nx]); b.onclick = () => openLesson(nx); const r = h('div', 'row', ''); r.appendChild(b); el.appendChild(r); }
    }
    nav.innerHTML = '';
    const back = h('button', 'btn quiet', 'Back'); back.id = 'w-back'; back.disabled = i === 0; back.onclick = () => { i--; draw(true); };
    const next = h('button', 'btn', i === w.screens.length - 1 ? 'Finish' : 'Next'); next.id = 'w-next'; next.hidden = i >= n - 1; next.onclick = () => { i++; draw(true); };
    const again = h('button', 'linkbtn', 'Start this lesson over'); again.hidden = i === 0; again.onclick = () => { i = 0; draw(true); };
    nav.appendChild(back); nav.appendChild(next); nav.appendChild(again);
    if (scroll) window.scrollTo(0, 0);
  }
  draw(false);
}

/* ---------- symbol decoder ---------- */
const SYMBOLS = [];   /* content pushes [groupTitle, [[symbol, meaning], ...]] rows into this */
const SYMLABEL = '<span class="wide">What do the </span>symbols<span class="wide"> mean</span>?';
function toggleSymbols() {
  const p = $('#sympanel'); if (!p.dataset.built) { p.dataset.built = '1'; setH(p, '<div class="symin">' + SYMBOLS.map(([t, rows]) => `<div class="symgrp"><h4>${t}</h4>${rows.map(r => `<div class="symrow"><span class="s">${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>`).join('') + '</div>'); }
  p.hidden = !p.hidden; $('#symbtn').setAttribute('aria-expanded', String(!p.hidden)); $('#symbtn').innerHTML = p.hidden ? SYMLABEL : 'Close symbols';
}

/* ---------- small visual helpers ---------- */
/* number line: pts [{x, cls, lab}], marks [{x, lab, cls}] drawn as flags above the line */
function NL(o) {
  const W = o.w || 340, H = o.h || 86, lo = o.lo, hi = o.hi, y0 = o.y0 || 54, sx = v => 14 + (v - lo) / (hi - lo) * (W - 28);
  let s = `<line x1="8" x2="${W - 8}" y1="${y0}" y2="${y0}" class="ax"/>`;
  (o.ticks || []).forEach(t => { s += `<line x1="${sx(t)}" x2="${sx(t)}" y1="${y0}" y2="${y0 + 4}" class="ax"/><text x="${sx(t)}" y="${y0 + 16}" text-anchor="middle">${t}</text>`; });
  const seen = {};
  (o.pts || []).forEach(p => { const key = Math.round(sx(p.x)); seen[key] = (seen[key] || 0) + 1; const cy = y0 - (seen[key] - 1) * 10; s += `<circle cx="${sx(p.x)}" cy="${cy}" r="${p.r || 5}" class="${p.cls || 'f-ink'}"/>` + (p.lab ? `<text x="${sx(p.x)}" y="${y0 + (o.ticks ? 28 : 18)}" text-anchor="middle" class="lb">${p.lab}</text>` : ''); });
  (o.marks || []).forEach((mk, k) => { const yy = y0 - 14 - (mk.lvl || 0) * 14; s += `<line x1="${sx(mk.x)}" x2="${sx(mk.x)}" y1="${y0 - 3}" y2="${yy + 3}" class="ln ${mk.cls}" style="stroke-width:2"/><text x="${clamp(sx(mk.x), 34, W - 34)}" y="${yy}" text-anchor="middle" class="lb" style="fill:currentColor"><tspan class="${mk.cls.replace('c-', 't-')}" fill="currentColor">${mk.lab}</tspan></text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" class="plot nl" role="img" aria-label="${esc(o.label || 'number line')}">${s}</svg>`;
}
