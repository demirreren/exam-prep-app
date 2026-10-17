/* ===== 50_plan_sheet.js : the study plan, exam strategy, and cheat sheet rows =====
   PLAN.blocks: { id, title, min, why, lesson?, probs?: [ids], manual?: true, pre?: html, links?: [[label, fn]] }
   SHEET: [{ page, title, rows: [[key, html], ...], print?: fn }]. page numbers index CONFIG.sheet.pages. */

const PLAN = {
  headline: 'Your plan from now until the exam',
  howto: '<b>New to this? That is fine.</b><ol><li>Each block starts with a <b>lesson</b>. Lessons go one small step at a time with pictures you can play with.</li><li>Then do the <b>problems</b> under it. Each step stays hidden until you ask, so try it on paper first.</li><li>Press <b>Got it</b> or <b>Redo later</b> at the end of each problem. The Start button always jumps to the next thing you have not done.</li></ol>',
  lede: 'Sized to about 4 hours. The topic with the most marks comes first. One past paper is held back for a timed run.',
  logistics: 'Friday March 14, 2:00 to 3:20pm. Long answer, 80 minutes, about 30 marks. One page of notes allowed, one side. Bring a calculator.',
  blocks: [
    { id: 'a', title: 'Centre and spread', min: 60, why: 'First because it is 11 of the 30 marks and every later topic uses the mean.', lesson: 'A', probs: ['A-summ', 'A-outlier', 'A-nminus1'] },
    { id: 'b', title: 'Fitting a line', min: 60, why: 'Second because the recipe is mechanical once you can compute a mean.', lesson: 'B', probs: ['B-fit', 'B-resid'] },
    { id: 'c', title: 'Independent events', min: 40, why: 'Third because it is 8 marks and the whole topic is three rules and one grid.', lesson: 'C', probs: ['C-and', 'C-atleast'] },
    { id: 'sheet', title: 'Build your cheat sheet', min: 20, why: 'After both topics, so you know what you actually forget.', manual: true, pre: 'Save and print the sheet from the Cheat sheet tab. Use Quiz me once. Write your own notes in the margins.' },
    { id: 'timed', title: 'Timed run: last year\'s paper, cold', min: 40, why: 'The real test of the plan.', manual: true, pre: 'Set a timer for 80 minutes. Paper, pen, calculator and your sheet only. Mark it against the key afterwards.', links: [['Drill: a mixed round', () => go('drill')]] }
  ]
};

const STRATEGY = R`<h3>Exam strategy</h3>
<ul>
<li><b>Write the formula, then the numbers, then the result.</b> The keys give a mark for each.</li>
<li><b>Always write the sentence.</b> "The median is resistant to outliers." "The residuals sum to zero, so the arithmetic checks."</li>
<li><b>Sort before you find a median.</b> Most lost marks on Q1 were unsorted lists.</li>
<li><b>"At least one" means go through "none".</b> One line of working instead of a list of cases.</li>
<li><b>80 minutes for 30 marks</b> is under 3 minutes a mark. Move on and come back.</li>
</ul>`;

const SHEET = [
  { page: 1, title: 'Centre and spread', rows: [
    ['Mean', R`$\bar y = \frac1N\sum_u y_u$. Total $=$ count $\times$ mean.`],
    ['Median', R`Sort first. Odd $N$: the middle value. Even $N$: average the middle two.`],
    ['SD', R`$SD = \sqrt{\frac1N\sum_u (y_u - \bar y)^2}$. Course uses $N$. Deviations sum to 0 (check).`],
    ['EXAMPLE', R`$4, 6, 7, 8, 10$: mean 7, median 7, squares $9 + 1 + 0 + 1 + 9 = 20$, $SD = \sqrt{20/5} = 2$.`],
    ['Outliers', 'The mean follows every value. The median only follows the middle. One typo of 37: mean 7 to 12, median 7 to 7.5. Report the median.'],
    ['Sentence', '"The median is resistant to outliers; the mean is not."']
  ] },
  { page: 1, title: 'Fitting a line', rows: [
    ['DO THIS', R`1. $\bar x$, $\bar y$. 2. Table: $x - \bar x$, $y - \bar y$, product, $(x - \bar x)^2$. 3. $b = S_{xy}/S_{xx}$. 4. $a = \bar y - b\bar x$. 5. Write $\hat y = a + bx$.`],
    ['EXAMPLE', R`$(1,2)$, $(2,4)$, $(3,5)$, $(4,8)$, $(5,6)$: $\bar x = 3$, $\bar y = 5$, $S_{xy} = 12$, $S_{xx} = 10$, $b = 1.2$, $a = 1.4$.`],
    ['Residuals', R`$r_u = y_u - (a + bx_u)$. Actual minus predicted. They sum to 0. Largest $|r_u|$ = worst-fit point.`],
    ['Signs', R`$b$ has the sign of $S_{xy}$. Line always passes through $(\bar x, \bar y)$.`]
  ] },
  { page: 1, title: 'Independent events', rows: [
    ['Independent', R`Knowing one happened does not change the chance of the other. Test: does $P(A \text{ and } B)$ equal $P(A)\,P(B)$?`],
    ['AND', R`$P(A \text{ and } B) = P(A)\,P(B)$. Independent events only.`],
    ['OR', R`$P(A \text{ or } B) = P(A) + P(B) - P(A)\,P(B)$. Add, then take off the overlap once.`],
    ['At least one', R`$1 - P(\text{none}) = 1 - (1 - p)^n$. Never add $p$ $n$ times.`],
    ['EXAMPLE', R`Coin and die: and $= \frac1{12}$, or $= \frac7{12}$, neither $= \frac5{12}$. Three rolls, at least one six: $1 - (5/6)^3 = 91/216 = 0.421$.`],
    ['Sentence', '"The events are independent, so the probabilities multiply."']
  ] },
  { page: 1, title: 'Common mistakes', rows: [
    ['', 'Median from an unsorted list. Dividing by the old count after adding a number. Slope upside down. Predicted minus actual for a residual. Adding probabilities for "at least one". Forgetting the overlap in "or".']
  ] }
];
