/* ===== lib.js : number formatting, descriptive statistics, seedable randomness, drill-option builder, generator registry =====
   Shared by the app and by the Node test harness. Nothing here touches the DOM. */
const R = String.raw;

/* ---------- formatting ---------- */
function rnd(x, d = 4) { const p = Math.pow(10, d); const v = Math.round((x + Number.EPSILON * Math.sign(x)) * p) / p; return Object.is(v, -0) ? 0 : v; }
function fx(x, d = 4) { let s = rnd(x, d).toFixed(d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; }
function par(x, d = 4) { return x < 0 ? '(' + fx(x, d) + ')' : fx(x, d); }
function vec(a, d = 4) { return '(' + a.map(v => fx(v, d)).join(',\\ ') + ')'; }
function col(a, d = 4) { return R`\begin{pmatrix}` + a.map(v => (typeof v === 'number' ? fx(v, d) : v)).join(R`\\`) + R`\end{pmatrix}`; }
function mat(H, d = 4) { return R`\begin{pmatrix}` + H.map(r => r.map(v => (typeof v === 'number' ? fx(v, d) : v)).join('&')).join(R`\\`) + R`\end{pmatrix}`; }
/* polynomial from [[coef, 'x^2'], ...] */
function poly(terms, d = 4) {
  let s = '';
  terms.forEach(([c, sym]) => {
    if (Math.abs(c) < 1e-12) return;
    const mag = Math.abs(c), one = Math.abs(mag - 1) < 1e-12 && sym !== '';
    const body = (one ? '' : fx(mag, d)) + sym;
    s += s === '' ? (c < 0 ? '-' : '') + body : (c < 0 ? ' - ' : ' + ') + body;
  });
  return s === '' ? '0' : s;
}
/* a line of substituted arithmetic: sum of coef*(value) */
function subst(pairs, d = 4) {
  let s = '';
  pairs.forEach(([c, v, isConst]) => {
    if (Math.abs(c) < 1e-12) return;
    const body = isConst ? fx(Math.abs(c), d) : fx(Math.abs(c), d) + '(' + fx(v, d) + ')';
    s += s === '' ? (c < 0 ? '-' : '') + body : (c < 0 ? ' - ' : ' + ') + body;
  });
  return s === '' ? '0' : s;
}
function prods(pairs, d = 4) {
  let s = '';
  pairs.forEach(([c, v, isConst]) => {
    if (Math.abs(c) < 1e-12) return;
    const val = isConst ? c : c * v;
    s += s === '' ? fx(val, d) : (val < 0 ? ' - ' + fx(-val, d) : ' + ' + fx(val, d));
  });
  return s === '' ? '0' : s;
}

/* ---------- attributes ---------- */
const sum = a => a.reduce((s, v) => s + v, 0);
const sorted = a => a.slice().sort((x, y) => x - y);
const mean = a => sum(a) / a.length;
function median(a) { const s = sorted(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function variance(a, d = 0) { const m = mean(a); return sum(a.map(v => (v - m) * (v - m))) / (a.length - d); }
const sd = (a, d = 0) => Math.sqrt(variance(a, d));
const ostat = (a, k) => sorted(a)[k - 1];
const quant = (a, p) => sorted(a)[Math.ceil(a.length * p - 1e-9) - 1];           /* lecture: Q_y(p) = y_(Np) */
const iqr = a => quant(a, 0.75) - quant(a, 0.25);
const range = a => Math.max(...a) - Math.min(...a);
function mad(a) { const m = median(a); return median(a.map(v => Math.abs(v - m))); }
const cv = a => sd(a) / mean(a);
function skewM(a) { const m = mean(a); return (sum(a.map(v => Math.pow(v - m, 3))) / a.length) / Math.pow(sd(a), 3); }
const skew2 = a => 3 * (mean(a) - median(a)) / sd(a);
function bowley(a) { const q1 = quant(a, .25), q2 = quant(a, .5), q3 = quant(a, .75); return ((q3 + q1) / 2 - q2) / ((q3 - q1) / 2); }
function trimmed(a, g) { const s = sorted(a); return mean(s.slice(g, s.length - g)); }
const clamp = (y, lo, hi) => Math.max(lo, Math.min(hi, y));

/* ---------- random numbers (seedable so the test harness can replay) ---------- */
let _rng = Math.random;
function setRng(f) { _rng = f; }
function seeded(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ri = (a, b) => a + Math.floor(_rng() * (b - a + 1));
const pick = a => a[Math.floor(_rng() * a.length)];
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(_rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function distinctPop(n, lo, hi) { const s = new Set(); while (s.size < n) s.add(ri(lo, hi)); return shuffle(Array.from(s)); }

/* Build an option list: correct first, then distractors with the mistake they represent.
   Any distractor whose displayed text collides with another option is dropped. Returns null if fewer than 3 options survive. */
function buildOpts(correct, distractors) {
  const seen = new Set([correct]), opts = [{ h: correct, ok: true }];
  distractors.forEach(([h, why]) => { if (!seen.has(h)) { seen.add(h); opts.push({ h, ok: false, why }); } });
  return opts.length >= 3 ? opts.slice(0, 4) : null;
}
const V = (a, d = 3) => '$' + vec(a, d) + '$';
const S = (x, d = 3) => '$' + fx(x, d) + '$';


/* ---------- generator registry ----------
   Content registers endless-drill generators with G(kind, topic, weight, fn).
   fn() returns { q, opts: [{h, ok, why?}], why, chk: {kind, ...numbers the verifier needs} }. */
const GEN = {}, GEN_TOPIC = {}, GEN_WEIGHTS = [];
function G(kind, topic, weight, fn) { GEN[kind] = fn; GEN_TOPIC[kind] = topic; GEN_WEIGHTS.push([kind, weight]); }

if (typeof module !== 'undefined') module.exports = { R, rnd, fx, par, vec, col, mat, poly, subst, prods, sum, sorted, mean, median, variance, sd, ostat, quant, iqr, range, mad, cv, skewM, skew2, bowley, trimmed, clamp, setRng, seeded, ri, pick, shuffle, distinctPop, buildOpts, V, S, GEN, GEN_TOPIC, GEN_WEIGHTS, G };
