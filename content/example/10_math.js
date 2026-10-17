/* ===== 10_math.js : course math and the endless-drill generators =====
   Files named 1*_*.js must not touch the DOM: scripts/gencheck.py loads them in Node to replay the generators.
   The engine's lib.js is already loaded (mean, median, sd, fx, ri, distinctPop, buildOpts, S, R ...). */

/* least squares fit of y on x: slope = Sxy / Sxx, intercept = ybar - slope * xbar */
function fitLine(pts) {
  const xb = mean(pts.map(p => p[0])), yb = mean(pts.map(p => p[1]));
  const sxy = sum(pts.map(p => (p[0] - xb) * (p[1] - yb))), sxx = sum(pts.map(p => (p[0] - xb) * (p[0] - xb)));
  return { xb, yb, sxy, sxx, b: sxy / sxx, a: yb - sxy / sxx * xb };
}
const resid = (pts, f) => pts.map(p => p[1] - (f.a + f.b * p[0]));

/* ---------- generators: G(kind, topic, weight, fn) ----------
   fn returns { q, opts, why, chk }. chk holds the raw numbers so checks.py can recompute the answer. */
G('newmean', 'A', 2, () => {
  for (;;) {
    const n = ri(4, 6), p = distinctPop(n, 1, 20), y = ri(21, 60), np = p.concat([y]), ans = mean(np);
    const opts = buildOpts(S(ans), [
      [S(mean(p)), 'That is the old mean. The new number changes it.'],
      [S((sum(p) + y) / n, 3), 'You added the new number but still divided by the old count. There are $' + (n + 1) + '$ numbers now.'],
      [S(median(np)), 'That is the new median, not the new mean.']
    ]);
    if (!opts) continue;
    return { topic: 'A', q: R`The list $${p.join(', ')}$ gets one more number, $${y}$. What is the new mean?`, opts,
      why: R`New total $${sum(p)} + ${y} = ${sum(p) + y}$, divided by the new count $${n + 1}$: $${fx(ans, 3)}$.`, chk: { kind: 'newmean', p, y } };
  }
});

G('slope', 'B', 2, () => {
  for (;;) {
    const pts = [1, 2, 3, 4].map(x => [x, ri(1, 12)]), f = fitLine(pts);
    if (Math.abs(f.b) < 1e-9) continue;
    const opts = buildOpts(S(f.b), [
      [S(-f.b), 'Sign flipped. Check whether the points go up or down as $x$ grows.'],
      [S(f.a), 'That is the intercept $a$, not the slope.'],
      [S(f.sxy / pts.length), 'You divided $S_{xy}$ by $N$. The slope divides by $S_{xx}$.']
    ]);
    if (!opts) continue;
    return { topic: 'B', q: R`Points $${pts.map(p => '(' + p[0] + ', ' + p[1] + ')').join(',\ ')}$. What is the least squares slope?`, opts,
      why: R`$\bar x = ${fx(f.xb)}$, $\bar y = ${fx(f.yb)}$, $S_{xy} = ${fx(f.sxy)}$, $S_{xx} = ${fx(f.sxx)}$, so $b = ${fx(f.sxy)}/${fx(f.sxx)} = ${fx(f.b, 3)}$.`, chk: { kind: 'slope', pts } };
  }
});

/* ---------- topic C: independent events ---------- */
G('atleast', 'C', 2, () => {
  for (;;) {
    const b = pick([2, 3, 4, 5, 6, 8, 10]), a = ri(1, b - 1), n = ri(2, 5), p = a / b, none = Math.pow(1 - p, n), ans = 1 - none;
    const opts = buildOpts(S(ans), [
      [S(n * p), 'You added $p$ once per try. Tries can succeed together, so adding counts those twice' + (n * p > 1 ? ', and here it even goes past 1' : '') + '. Go through "none".'],
      [S(none), 'That is the chance of no success at all. Subtract it from 1.'],
      [S(Math.pow(p, n)), 'That is every try succeeding, not at least one.']
    ]);
    if (!opts) continue;
    return { topic: 'C', q: R`Each try succeeds with probability $${a}/${b}$, independently of the others. In $${n}$ tries, what is the probability of at least one success?`, opts,
      why: R`$P(\text{none}) = \left(\frac{${b - a}}{${b}}\right)^{${n}} = ${fx(none, 4)}$, so $P(\text{at least one}) = 1 - ${fx(none, 4)} = ${fx(ans, 3)}$ (to 3 places).`, chk: { kind: 'atleast', a, b, n } };
  }
});

G('orrule', 'C', 2, () => {
  for (;;) {
    const a = ri(1, 9), b = ri(1, 9), pa = a / 10, pb = b / 10, both = pa * pb, ans = pa + pb - both;
    const opts = buildOpts(S(ans), [
      [S(pa + pb), 'You added without taking off the overlap. Both can happen, and plain adding counts that twice' + (pa + pb > 1 ? ' (the result is past 1)' : '') + '.'],
      [S(both), R`That is $P(A \text{ and } B)$. The question asks for "or".`],
      [S(1 - both), 'That is "not both".']
    ]);
    if (!opts) continue;
    return { topic: 'C', q: R`$A$ and $B$ are independent, with $P(A) = ${fx(pa)}$ and $P(B) = ${fx(pb)}$. What is $P(A \text{ or } B)$?`, opts,
      why: R`$P(A \text{ or } B) = ${fx(pa)} + ${fx(pb)} - ${fx(pa)} \times ${fx(pb)} = ${fx(pa + pb)} - ${fx(both)} = ${fx(ans)}$.`, chk: { kind: 'orrule', a, b } };
  }
});
