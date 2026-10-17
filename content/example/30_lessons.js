/* ===== 30_lessons.js : step-by-step walkthroughs, their figures and widgets, dense notes, and the symbol decoder =====
   W({ id, screens: [{ h, b?, fig?, w?, after?, box?, boxTitle?, q? }], done? })   one screen at a time
   L({ id, cards: [{ h?, b?, fig?, w?, after? }], checks?: [[q, a]], next?: [ids], doOne?: id })   the dense notes under the walkthrough
   fig names a FIGS entry (a function returning HTML/SVG). w names a WIDGETS entry (a function that fills an element). */

/* ---------- figures ---------- */
Object.assign(FIGS, {
  scoresLine: () => NL({ lo: 2, hi: 12, ticks: [2, 4, 6, 8, 10, 12], pts: SCORES.map(x => ({ x })), marks: [{ x: 7, lab: 'mean = 7', cls: 'c-ls' }], h: 92, y0: 50, label: 'Five dots at 4, 6, 7, 8 and 10 with the mean marked at 7' }),
  deviations: () => { const m = 7, W = 340, sx = v => 14 + (v - 2) / 10 * (W - 28); let s = ''; sorted(SCORES).forEach((x, i) => { const yy = 22 + i * 15; s += `<line x1="${sx(m)}" x2="${sx(x)}" y1="${yy}" y2="${yy}" class="ln c-hub" style="stroke-width:3"/><circle cx="${sx(x)}" cy="${yy}" r="4.5" class="f-ink"/><text x="${sx(x) + (x >= m ? 9 : -9)}" y="${yy + 4}" text-anchor="${x >= m ? 'start' : 'end'}">${x - m === 0 ? '0' : (x - m > 0 ? '+' : '') + (x - m)}</text>`; }); s += `<line x1="${sx(m)}" x2="${sx(m)}" y1="10" y2="96" class="ln c-ls" style="stroke-width:2"/><text x="${sx(m)}" y="110" text-anchor="middle" class="lb">mean 7</text>`; return `<svg viewBox="0 0 ${W} 116" class="plot" role="img" aria-label="Each number's distance from the mean drawn as a bar">${s}</svg>`; },
  linePts: () => { const f = fitLine(PTS), p = Plot({ w: 320, h: 200, x: [0, 6], y: [0, 10] }).frame().xt([0, 2, 4, 6]).yt([0, 5, 10]).xl('hours studied').yl('score'); p.line([[0, f.a], [6, f.a + 6 * f.b]], 'c-acc'); PTS.forEach(q => p.raw(`<line x1="${p.sx(q[0])}" x2="${p.sx(q[0])}" y1="${p.sy(q[1])}" y2="${p.sy(f.a + f.b * q[0])}" class="ln c-hub" style="stroke-width:2.5"/>`)); p.dots(PTS, '', 3.5); return p.svg('Five points, the least squares line, and a bar from each point to the line') + '<div class="legend"><span class="t-acc"><i></i>the fitted line</span><span class="t-hub"><i></i>residuals</span></div>'; }
});

/* ---------- widgets ---------- */
WIDGETS.outlier = el => {
  el.innerHTML = `<div id="ou-plot"></div><div class="ctl"><label for="ou-y">the sixth score</label><input type="range" id="ou-y" min="0" max="40" step="1" value="7"><button class="btn sm quiet" id="ou-typo" type="button">Make it a typo: 37</button></div><div class="readout" id="ou-out"></div>`;
  const sl = $('#ou-y', el);
  const draw = () => { const y = +sl.value, np = SCORES.concat([y]), m1 = mean(np), d1 = median(np); $('#ou-plot', el).innerHTML = NL({ lo: 0, hi: 41, ticks: [0, 10, 20, 30, 40], pts: SCORES.map(x => ({ x, r: 4 })).concat([{ x: y, cls: 'f-ls', r: 6 }]), marks: [{ x: m1, lab: 'mean ' + fx(m1, 2), cls: 'c-ls', lvl: 1 }, { x: d1, lab: 'median ' + fx(d1, 2), cls: 'c-hub', lvl: 0 }], h: 104, y0: 62, label: 'Five scores and one new score, with the mean and the median marked' }); setH($('#ou-out', el), `<div class="kv"><span>before</span><span>mean 7, median 7</span><span>after adding ${y}</span><span>mean ${fx(m1, 2)}, median ${fx(d1, 2)}</span><span>the mean moved by</span><span>${fx(m1 - 7, 2)}</span><span>the median moved by</span><span>${fx(d1 - 7, 2)}</span></div><div style="margin-top:6px">${y >= 20 ? 'The mean chased the new number. The median hardly noticed.' : 'Slide further out and watch the mean.'}</div>`); };
  sl.oninput = draw; $('#ou-typo', el).onclick = () => { sl.value = 37; draw(); }; draw();
};
WIDGETS.tilt = el => {
  const f0 = fitLine(PTS), sse = (a, b) => sum(PTS.map(q => Math.pow(q[1] - a - b * q[0], 2)));
  el.innerHTML = `<div id="ti-plot"></div><div class="ctl"><label for="ti-b">slope</label><input type="range" id="ti-b" min="0" max="2.4" step="0.1" value="0.5"></div><div class="readout" id="ti-out"></div>`;
  const sl = $('#ti-b', el);
  const draw = () => { const b = +sl.value, a = f0.yb - b * f0.xb, p = Plot({ w: 320, h: 200, x: [0, 6], y: [0, 10] }).frame().xt([0, 2, 4, 6]).yt([0, 5, 10]).xl('hours studied').yl('score'); p.line([[0, a], [6, a + 6 * b]], 'c-ls'); PTS.forEach(q => p.raw(`<line x1="${p.sx(q[0])}" x2="${p.sx(q[0])}" y1="${p.sy(q[1])}" y2="${p.sy(a + b * q[0])}" class="ln c-hub" style="stroke-width:2.5"/>`)); p.dots(PTS, '', 3.5); $('#ti-plot', el).innerHTML = p.svg('A line through the mean point that you can tilt. The bars are the misses.'); setH($('#ti-out', el), `<div class="kv"><span>slope</span><span>${fx(b, 2)}</span><span>total squared miss</span><span>${fx(sse(a, b), 2)}</span></div><div style="margin-top:6px">${Math.abs(b - 1.2) < 0.05 ? '<b>This is the lowest total.</b> Slope 1.2 is the least squares answer.' : 'Tilt until the total squared miss is as small as you can get it.'}</div>`); };
  sl.oninput = draw; draw();
};

/* ---------- symbol decoder (the "What do the symbols mean?" button) ---------- */
SYMBOLS.push(
  ['The list', [[R`$y_u$`, 'One number in the list. $u$ says which one.'], [R`$N$`, 'How many numbers there are.'], [R`$\bar y$`, 'The mean (average).'], [R`$SD$`, 'Standard deviation. The typical distance from the mean.']]],
  ['The line', [[R`$\hat y = a + bx$`, 'The fitted line. $a$ is the height at $x = 0$, $b$ is the slope.'], [R`$S_{xy}$, $S_{xx}$`, 'The two sums in the slope formula: products of deviations, and squared $x$ deviations.'], [R`$r_u$`, 'A residual. Actual $y$ minus the $y$ the line predicts.']]]
);

/* ---------- lesson A ---------- */
W({ id: 'A', screens: [
  { h: 'Five quiz scores', b: R`<p>Everything in this topic uses the same five numbers: $${SCORES.join(', ')}$. The course calls them $y_1$ to $y_5$ and the count $N = 5$.</p>`, fig: 'scoresLine', after: '<p>The dot in the middle, 7, is the mean. Keep this picture in your head for every formula that follows.</p>' },
  { h: 'The mean is the balance point', b: R`<p>Add the numbers and divide by how many: $(4 + 8 + 6 + 10 + 7) / 5 = 35 / 5 = 7$.</p><p>Flip that around and you get a fact used everywhere: <b>total = count × mean</b>. Here $35 = 5 \times 7$.</p>`, box: R`$$\bar y = \frac{1}{N}\sum_{u=1}^{N} y_u$$<p>Read $\sum$ as "add them all up".</p>`, q: { q: 'A list of 8 numbers has mean 5. What is the total?', opts: [['40', true, 'count × mean = 8 × 5.'], ['13', false, 'That is 8 + 5. Multiply, do not add.'], ['0.625', false, 'That is 5 ÷ 8. The total is count × mean.']] } },
  { h: 'The median is the middle one', b: R`<p>Sort first: $4, 6, 7, 8, 10$. The middle is the 3rd, so the median is $7$.</p><p>With an even count there is no single middle, so average the two middle ones.</p>`, q: { q: 'Sorted list 2, 5, 9, 11. What is the median?', opts: [['7', true, 'Average of 5 and 9.'], ['9', false, 'Four numbers have no single middle. Average the 2nd and 3rd.'], ['5', false, 'Same problem. Average 5 and 9.']] } },
  { h: 'Spread: how far from the mean, on average', b: R`<p>Measure each number's distance from the mean.</p>`, fig: 'deviations', after: R`<p>The distances are $-3, -1, 0, 1, 3$. They add to zero (they always do), so square them first: $9, 1, 0, 1, 9$, total $20$. Average that: $20 / 5 = 4$. Square root: $2$. That is the standard deviation.</p>`, box: R`$$SD = \sqrt{\frac{1}{N}\sum_u (y_u - \bar y)^2}$$<p>This course divides by $N$. Some textbooks divide by $N - 1$. Say which one you are using.</p>` },
  { h: 'One wild number', b: '<p>Suppose a sixth score gets typed as 37 instead of 7. Drag the slider and watch which summary follows it.</p>', w: 'outlier', after: '<p>The mean is pulled by every number, so one typo drags it. The median only cares about the middle, so it barely moves. On the exam this is the sentence: "the median is resistant to outliers, the mean is not".</p>' }
], done: '<p>You know the mean, the median, the SD, and which one an outlier can wreck. Try the problem below with the steps hidden first.</p>' });

L({ id: 'A', cards: [
  { h: 'Centre', b: R`Mean $\bar y = \frac1N\sum y_u$. Median: sort, take the middle (odd $N$) or average the middle two (even $N$).` },
  { h: 'Spread', b: R`$SD = \sqrt{\frac1N\sum(y_u - \bar y)^2}$. Deviations always sum to zero, which is a quick check on the arithmetic.` },
  { h: 'Outliers', b: 'The mean moves with every value. The median moves only if the middle changes. Report the median when there is a wild value.' }
], checks: [[R`List 3, 3, 9. Mean and median?`, R`Mean 5, median 3.`], ['Why square the deviations before averaging?', 'Because they sum to zero as they are. Squaring stops the negatives cancelling the positives.']], doOne: 'A-summ', next: ['A-outlier', 'A-nminus1'] });

/* ---------- lesson B ---------- */
W({ id: 'B', screens: [
  { h: 'Five students, one line', b: R`<p>Hours studied against quiz score: $${PTS.map(p => '(' + p[0] + ', ' + p[1] + ')').join(',\ ')}$. The dots roughly go up. We want the one straight line that fits them best.</p>`, fig: 'linePts', after: '<p>The orange bars are the misses, one per point. "Best" means the squares of those bars add up to the smallest possible total. That is what least squares means.</p>' },
  { h: 'Tilt it yourself', b: '<p>The line always passes through the mean point (3, 5). Tilt it and watch the total squared miss.</p>', w: 'tilt' },
  { h: 'The recipe', b: R`<ol><li>Find $\bar x$ and $\bar y$.</li><li>$S_{xy} = \sum (x_u - \bar x)(y_u - \bar y)$ and $S_{xx} = \sum (x_u - \bar x)^2$. A table with one row per point is the safest way.</li><li>Slope $b = S_{xy} / S_{xx}$.</li><li>Intercept $a = \bar y - b\bar x$.</li></ol>`, box: R`$$b = \frac{S_{xy}}{S_{xx}} \qquad a = \bar y - b\,\bar x$$<p>Here $S_{xy} = 12$, $S_{xx} = 10$, so $b = 1.2$ and $a = 5 - 1.2 \times 3 = 1.4$.</p>`, q: { q: 'Which sum goes on the bottom of the slope?', opts: [[R`$S_{xx}$`, true, 'The spread of x. Slope is "y per unit of x".'], [R`$S_{xy}$`, false, 'That goes on top.'], [R`$N$`, false, 'Dividing by N gives the covariance, not the slope.']] } },
  { h: 'Residuals: actual minus predicted', b: R`<p>Plug each $x$ into the line to get a prediction, then subtract it from the real $y$. For $x = 4$: predicted $1.4 + 1.2 \times 4 = 6.2$, actual $8$, residual $1.8$.</p><p>Two checks: the residuals add to zero, and the biggest one is the point the line fits worst.</p>` }
], done: '<p>That is the whole topic: two means, two sums, slope, intercept, then residuals. Do the fit problem below with the steps hidden.</p>' });

L({ id: 'B', cards: [
  { h: 'Least squares line', b: R`$b = S_{xy}/S_{xx}$, $a = \bar y - b\bar x$. The line passes through $(\bar x, \bar y)$.` },
  { h: 'Residuals', b: R`$r_u = y_u - (a + bx_u)$. They sum to zero. The largest $|r_u|$ is the worst-fit point.` }
], checks: [[R`$S_{xy} = -6$, $S_{xx} = 3$. Slope?`, R`$-2$. The points go down as $x$ grows.`]], doOne: 'B-fit', next: ['B-resid'] });
