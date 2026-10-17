/* ===== figs.js : small drawing helpers shared by content figures (line fits, scatterplots, mini curve icons) ===== */
function rnorm(r) { const u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function lsFit(pts, w) { w = w || pts.map(() => 1); const sw = sum(w), xb = sum(pts.map((p, i) => w[i] * p[0])) / sw, yb = sum(pts.map((p, i) => w[i] * p[1])) / sw; const b = sum(pts.map((p, i) => w[i] * (p[0] - xb) * (p[1] - yb))) / sum(pts.map((p, i) => w[i] * (p[0] - xb) * (p[0] - xb))); return { a: yb - b * xb, b }; }
function irlsFit(pts, wfn, iters = 60) { let f = lsFit(pts); for (let i = 0; i < iters; i++) { const w = pts.map(p => wfn(p[1] - f.a - f.b * p[0])); f = lsFit(pts, w); } return f; }
const hubw = (r, k) => Math.abs(r) <= k ? 1 : k / Math.abs(r);
const huberFit = (pts, k) => irlsFit(pts, r => hubw(r, k));
const ladFit = pts => irlsFit(pts, r => 1 / Math.max(Math.abs(r), 1e-4), 200);

function scatter(pts, xr, yr, xt, yt, title, extra) {
  const p = Plot({ w: 300, h: 210, x: xr, y: yr, m: { l: 38, r: 8, t: title ? 20 : 8, b: 24 } }).frame().xt(xt).yt(yt).dots(pts.filter(q => q[0] >= xr[0] && q[0] <= xr[1] && q[1] >= yr[0] && q[1] <= yr[1]), '', 2.3);
  if (title) p.raw(`<text x="150" y="13" text-anchor="middle" class="lb">${title}</text>`);
  if (extra) extra(p);
  return p.svg(title || 'scatterplot');
}
const mini = d => `<svg class="minisvg" viewBox="0 0 74 44" aria-hidden="true"><line x1="2" x2="72" y1="22" y2="22"/><path d="${d}"/></svg>`;
