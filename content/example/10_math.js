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
