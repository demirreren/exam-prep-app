/* ===== 20_problems.js : past exam questions and lecture examples, one step at a time =====
   P({ id, topic, tag: 'must' | 'extra' | 'low', name, src, marks?, q, note?, fig?, scope?, steps: [{t, h, pick?}], ans })
   A step with `pick` asks the reader to choose the next move before revealing it: { q, opts: [[text, isRight, whyNot?], ...] }.
   PLAIN[id] is the one-sentence plain-words version shown above the question. */

const SCORES = [4, 8, 6, 10, 7];

P({ id: 'A-summ', topic: 'A', tag: 'must', name: 'Mean, median and SD of a small list', src: 'Past midterm Q1', marks: '6 total. 1 each for the sort, the median, the mean. 3 for the SD with working.',
  q: R`Five quiz scores: $${SCORES.join(', ')}$. Find the median, the mean, and the standard deviation (the course uses $N$ in the denominator).`,
  steps: [
    { t: 'Sort the list', h: R`$4, 6, 7, 8, 10$. Sorting first makes the median easy and catches copying mistakes.` },
    { t: 'Median', pick: { q: 'Five numbers. Which position is the median?', opts: [['the 3rd', true, 'Odd count, so the single middle value.'], ['the average of the 2nd and 3rd', false, 'That is the rule for an even count.'], ['the 2nd', false, 'Count from both ends: two below, two above.']] }, h: R`The middle of five sorted numbers is the 3rd: median $= 7$.` },
    { t: 'Mean', h: R`$\bar y = \dfrac{4 + 6 + 7 + 8 + 10}{5} = \dfrac{35}{5} = 7$.` },
    { t: 'Deviations and their squares', h: R`<div class="tblwrap"><table class="tbl"><tr><th>$y$</th><td class="n">4</td><td class="n">6</td><td class="n">7</td><td class="n">8</td><td class="n">10</td></tr><tr><th>$y - \bar y$</th><td class="n">-3</td><td class="n">-1</td><td class="n">0</td><td class="n">1</td><td class="n">3</td></tr><tr><th>$(y - \bar y)^2$</th><td class="n">9</td><td class="n">1</td><td class="n">0</td><td class="n">1</td><td class="n">9</td></tr></table></div> The squares add to $20$.` },
    { t: 'SD', h: R`$SD = \sqrt{\dfrac{20}{5}} = \sqrt{4} = 2$. Write the formula, the substituted numbers, and the result. The key gives a mark for each.` }
  ], ans: R`Median $7$, mean $7$, $SD = 2$.` });

P({ id: 'A-outlier', topic: 'A', tag: 'must', name: 'One outlier: what moves and what does not', src: 'Past midterm Q2', marks: '5 total. 2 for the new mean, 2 for the new median, 1 for the sentence.',
  q: R`The list $${SCORES.join(', ')}$ gets a sixth score of $37$ (a typo for 7). Find the new mean and the new median, and say in one sentence which summary you would report and why.`,
  steps: [
    { t: 'New mean', h: R`Old total $35$, new total $35 + 37 = 72$, new count $6$. $\bar y = 72/6 = 12$. It jumped from $7$ to $12$.` },
    { t: 'New median', pick: { q: 'Six numbers now. How do you find the median?', opts: [['average the 3rd and 4th sorted values', true, 'Even count, so the middle two.'], ['take the 3rd sorted value', false, 'That rule is for an odd count.'], ['take the 4th sorted value', false, 'With six numbers there is no single middle. Average the 3rd and 4th.']] }, h: R`Sorted: $4, 6, 7, 8, 10, 37$. Median $= \frac{7 + 8}{2} = 7.5$. It moved from $7$ to $7.5$.` },
    { t: 'The sentence', h: R`Report the median. One wrong entry moved the mean by $5$ but the median by only $0.5$, so the median is resistant to outliers and the mean is not.` }
  ], ans: R`Mean $12$ (was $7$), median $7.5$ (was $7$). Report the median: it barely moved, the mean chased the outlier.` });

P({ id: 'A-nminus1', topic: 'A', tag: 'extra', name: 'SD with N versus N minus 1', src: 'Lecture 2 example',
  q: R`For $${SCORES.join(', ')}$, compute the SD with $N - 1$ in the denominator and compare it to the version with $N$.`,
  steps: [
    { t: 'Reuse the sum of squares', h: R`From the previous problem, $\sum (y - \bar y)^2 = 20$.` },
    { t: 'Divide by N minus 1', h: R`$\sqrt{\dfrac{20}{4}} = \sqrt{5} = 2.2361$, against $\sqrt{20/5} = 2$ with $N$.` },
    { t: 'Why the course uses N', h: R`With $N$ the SD is the root of the average squared distance from the mean, which is the plain description of spread. The $N - 1$ version is for estimating a larger population from a sample. On this exam, use $N$ unless the question says otherwise.` }
  ], ans: R`$\sqrt{5} = 2.2361$ with $N - 1$, versus $2$ with $N$. Use $N$ on this exam.` });

const PTS = [[1, 2], [2, 4], [3, 5], [4, 8], [5, 6]];

P({ id: 'B-fit', topic: 'B', tag: 'must', name: 'Fit a line by least squares', src: 'Past midterm Q4', marks: '7 total. 1 for each mean, 2 for the slope, 2 for the intercept, 1 for the equation.',
  q: R`Hours studied $x$ and quiz score $y$ for five students: $${PTS.map(p => '(' + p[0] + ', ' + p[1] + ')').join(',\ ')}$. Find the least squares line $\hat y = a + bx$.`,
  steps: [
    { t: 'The two means', h: R`$\bar x = \dfrac{1 + 2 + 3 + 4 + 5}{5} = 3$ and $\bar y = \dfrac{2 + 4 + 5 + 8 + 6}{5} = 5$.` },
    { t: 'The two sums', h: R`<div class="tblwrap"><table class="tbl"><tr><th>$x - \bar x$</th><td class="n">-2</td><td class="n">-1</td><td class="n">0</td><td class="n">1</td><td class="n">2</td></tr><tr><th>$y - \bar y$</th><td class="n">-3</td><td class="n">-1</td><td class="n">0</td><td class="n">3</td><td class="n">1</td></tr><tr><th>product</th><td class="n">6</td><td class="n">1</td><td class="n">0</td><td class="n">3</td><td class="n">2</td></tr><tr><th>$(x - \bar x)^2$</th><td class="n">4</td><td class="n">1</td><td class="n">0</td><td class="n">1</td><td class="n">4</td></tr></table></div> $S_{xy} = 12$ and $S_{xx} = 10$.` },
    { t: 'Slope', pick: { q: 'Which ratio is the slope?', opts: [[R`$S_{xy} / S_{xx}$`, true, ''], [R`$S_{xx} / S_{xy}$`, false, 'Upside down. The slope is "how y moves per unit of x", so the x spread goes on the bottom.'], [R`$S_{xy} / N$`, false, 'That is the covariance, not the slope.']] }, h: R`$b = \dfrac{12}{10} = 1.2$.` },
    { t: 'Intercept', h: R`The line passes through $(\bar x, \bar y)$, so $a = \bar y - b\bar x = 5 - 1.2 \times 3 = 1.4$.` },
    { t: 'Write the line', h: R`$\hat y = 1.4 + 1.2x$. Each extra hour of study predicts $1.2$ more marks.` }
  ], ans: R`$b = 1.2$, $a = 1.4$, so $\hat y = 1.4 + 1.2x$.` });

P({ id: 'B-resid', topic: 'B', tag: 'must', name: 'Residuals and the worst-fit point', src: 'Past midterm Q5', marks: '4 total. 2 for the residuals, 1 for the check, 1 for naming the point.',
  q: R`Using $\hat y = 1.4 + 1.2x$ from the previous question, find the five residuals, check that they add to zero, and say which student the line fits worst.`,
  steps: [
    { t: 'Residual means actual minus predicted', h: R`$r = y - \hat y$. Positive means the point sits above the line.` },
    { t: 'Compute all five', h: R`<div class="tblwrap"><table class="tbl"><tr><th>$x$</th><td class="n">1</td><td class="n">2</td><td class="n">3</td><td class="n">4</td><td class="n">5</td></tr><tr><th>$\hat y$</th><td class="n">2.6</td><td class="n">3.8</td><td class="n">5</td><td class="n">6.2</td><td class="n">7.4</td></tr><tr><th>$y$</th><td class="n">2</td><td class="n">4</td><td class="n">5</td><td class="n">8</td><td class="n">6</td></tr><tr><th>$r$</th><td class="n">-0.6</td><td class="n">0.2</td><td class="n">0</td><td class="n">1.8</td><td class="n">-1.4</td></tr></table></div>` },
    { t: 'Check', h: R`$-0.6 + 0.2 + 0 + 1.8 - 1.4 = 0$. Least squares residuals always sum to zero, so a nonzero total means an arithmetic slip.` },
    { t: 'Worst fit', h: R`The student at $x = 4$ has the biggest residual, $1.8$. They scored $8$ when the line predicted $6.2$.` }
  ], ans: R`Residuals $-0.6, 0.2, 0, 1.8, -1.4$. They sum to $0$. The worst fit is $x = 4$ (residual $1.8$).` });

P({ id: 'B-weighted', topic: 'B', tag: 'low', name: 'Weighted least squares (past the reported cutoff)', src: 'Lecture 6, not yet covered in class', scope: 1,
  q: R`If each point has a weight $w_u$, how do the slope and intercept formulas change?`,
  steps: [
    { t: 'Weighted means', h: R`$\bar x_w = \dfrac{\sum w_u x_u}{\sum w_u}$ and the same for $\bar y_w$.` },
    { t: 'Weighted sums', h: R`$b = \dfrac{\sum w_u (x_u - \bar x_w)(y_u - \bar y_w)}{\sum w_u (x_u - \bar x_w)^2}$, then $a = \bar y_w - b\bar x_w$. Every sum gets a $w_u$ inside it, nothing else changes.` }
  ], ans: R`Put a $w_u$ inside every sum and use the weighted means. Same shape of formula.` });

Object.assign(PLAIN, {
  'A-summ': 'Sort five numbers, find the middle one and the average, then measure how spread out they are.',
  'A-outlier': 'Add one wild number to the list and watch the mean jump while the median barely moves.',
  'B-fit': 'Draw the best straight line through five points using the two-sums recipe.',
  'B-resid': 'Measure how far each point sits from the line, and find the point the line misses most.'
});

/* ---------- topic C: independent events. The running example is one fair coin and one fair die. ---------- */
P({ id: 'C-and', topic: 'C', tag: 'must', name: 'Coin and die: and, or, neither', src: 'Past midterm Q3', marks: '4 total. 1 for each of the three probabilities, 1 for the check.',
  q: R`Flip a fair coin and roll a fair die. Find $P(\text{heads and a six})$, $P(\text{heads or a six})$ and $P(\text{neither})$. Check that the last two add to $1$.`,
  fig: 'grid',
  steps: [
    { t: 'Are they independent?', h: R`The coin cannot change what the die shows. The chance of a six is $1/6$ whether the coin landed heads or tails. So the two events are independent, and "and" means multiply.` },
    { t: 'And', pick: { q: 'Independent events. What do you do with the two probabilities for "and"?', opts: [['multiply them', true, 'Half of the outcomes have heads, and a sixth of those have a six.'], ['add them', false, 'Adding is for "or", and even then you take off the overlap.'], ['average them', false, 'Averaging is never a probability rule.']] }, h: R`$P(\text{heads and six}) = \frac12 \times \frac16 = \frac1{12}$. In the grid, that is the one cell H6 out of $12$.` },
    { t: 'Or', h: R`Add the two, then take off the overlap once: $\frac12 + \frac16 - \frac1{12} = \frac6{12} + \frac2{12} - \frac1{12} = \frac7{12}$. In the grid: the heads row has $6$ cells, the six column has $2$, and H6 is in both, so $6 + 2 - 1 = 7$ cells.` },
    { t: 'Neither', h: R`Tails and not a six: $\frac12 \times \frac56 = \frac5{12}$. The five cells T1 to T5.` },
    { t: 'Check', h: R`$\frac7{12} + \frac5{12} = 1$. "At least one of them" and "neither" cover every cell exactly once, so they must add to $1$. Write that sentence for the mark.` }
  ], ans: R`$P(\text{and}) = \frac1{12}$, $P(\text{or}) = \frac7{12}$, $P(\text{neither}) = \frac5{12}$, and $\frac7{12} + \frac5{12} = 1$.` });

P({ id: 'C-atleast', topic: 'C', tag: 'must', name: 'At least one six in three rolls', src: 'Past midterm Q6', marks: '4 total. 1 for naming the complement, 2 for the arithmetic, 1 for the sentence.',
  q: R`A fair die is rolled three times. What is the probability of at least one six? Give a fraction and a decimal to three places.`,
  steps: [
    { t: 'Go through the opposite', pick: { q: 'What is the opposite of "at least one six"?', opts: [['no six at all', true, 'Either there are no sixes or there is at least one. Nothing else.'], ['exactly one six', false, '"At least one" includes two sixes and three sixes too.'], ['three sixes', false, 'Two sixes is also "at least one". The opposite has to leave nothing out.']] }, h: R`$P(\text{at least one six}) = 1 - P(\text{no six})$.` },
    { t: 'No six on one roll', h: R`$P(\text{not a six}) = 1 - \frac16 = \frac56$.` },
    { t: 'No six on three independent rolls', h: R`The rolls do not affect each other, so multiply: $\left(\frac56\right)^3 = \frac{125}{216}$.` },
    { t: 'Subtract from 1', h: R`$1 - \frac{125}{216} = \frac{91}{216} = 0.421$ (to three places).` },
    { t: 'Why not add three sixths', h: R`$\frac16 + \frac16 + \frac16 = \frac12$ is too big. Two rolls can both show a six, and adding counts those outcomes twice. Six rolls would give $6 \times \frac16 = 1$, a certainty, which is clearly wrong.` }
  ], ans: R`$1 - (5/6)^3 = \frac{91}{216} \approx 0.421$.` });

P({ id: 'C-check', topic: 'C', tag: 'extra', name: 'Testing whether two events are independent', src: 'Lecture 5 example',
  q: R`In a class survey, $40\%$ of students have a bike, $50\%$ have a bus pass, and $20\%$ have both. Are "has a bike" and "has a bus pass" independent? What if $30\%$ had both?`,
  steps: [
    { t: 'The test', h: R`Two events are independent exactly when $P(A \text{ and } B) = P(A)\,P(B)$. So multiply the two single probabilities and compare with the "both" number.` },
    { t: 'Multiply', h: R`$0.4 \times 0.5 = 0.2$. The survey says $20\%$ have both. They match, so the two are independent. Knowing someone has a bike tells you nothing about the bus pass.` },
    { t: 'The other case', h: R`$0.3 \ne 0.2$, so with $30\%$ they are not independent. Among bike owners, $0.3 / 0.4 = 0.75$ have a pass, against $0.5$ overall. Having a bike goes with having a pass.` }
  ], ans: R`At $20\%$: independent ($0.4 \times 0.5 = 0.2$). At $30\%$: not independent ($0.3 \ne 0.2$).` });

Object.assign(PLAIN, {
  'C-and': 'Count cells in a 2 by 6 grid to get "and", "or" and "neither" for a coin and a die.',
  'C-atleast': 'Find the chance of no sixes at all, then flip it around.',
  'C-check': 'Multiply two percentages and see whether the result matches the "both" percentage.'
});
