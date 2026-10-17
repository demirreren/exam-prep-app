/* ===== 40_drill.js : fixed quick-recall questions =====
   D(topic, question, [options], why). The FIRST option is the correct one. Options are shuffled when shown.
   Make the wrong options real mistakes (sign flipped, divided by the wrong count), not nonsense. */

D('A', 'The mean of a list is', ['the total divided by the count', 'the middle value after sorting', 'the most common value', 'the largest minus the smallest'], 'Total ÷ count. Flip it around: total = count × mean.');
D('A', 'Six sorted numbers. The median is', ['the average of the 3rd and 4th', 'the 3rd', 'the 4th', 'the average of all six'], 'Even count, so average the two middle values.');
D('A', R`The deviations $y_u - \bar y$ always add to`, ['0', R`$N$`, R`$\bar y$`, 'the SD'], 'Positive and negative distances from the mean cancel exactly. That is why the SD squares them first.');
D('A', R`The SD in this course divides the squared deviations by`, [R`$N$`, R`$N - 1$`, R`$N + 1$`, R`$\sqrt N$`], R`$SD = \sqrt{\frac1N\sum(y_u - \bar y)^2}$. The $N - 1$ version is for estimating a population from a sample.`);
D('A', 'One huge typo is added to a list. Which summary moves least?', ['the median', 'the mean', 'the total', 'they move the same'], 'The median only depends on the middle values. The mean is pulled by every value.');
D('A', 'A list of 4 numbers has mean 9. Its total is', ['36', '13', '2.25', '9'], 'Total = count × mean = 4 × 9.');
D('B', 'The least squares slope is', [R`$S_{xy} / S_{xx}$`, R`$S_{xx} / S_{xy}$`, R`$S_{xy} / N$`, R`$\bar y / \bar x$`], 'Products of deviations over squared x deviations.');
D('B', 'The least squares line always passes through', [R`$(\bar x, \bar y)$`, 'the origin', 'the first data point', 'the point with the largest residual'], R`That is where the intercept formula $a = \bar y - b\bar x$ comes from.`);
D('B', 'A residual is', ['actual y minus predicted y', 'predicted y minus actual y', 'x minus its mean', 'the slope times x'], R`$r_u = y_u - \hat y_u$. Positive means the point sits above the line.`);
D('B', 'Least squares residuals add up to', ['0', 'the slope', R`$N$`, 'the SD of y'], 'Always zero. A nonzero total means an arithmetic slip somewhere.');
D('B', R`$S_{xy}$ is negative. The line`, ['slopes down', 'slopes up', 'is flat', 'cannot be fitted'], R`The slope has the sign of $S_{xy}$, since $S_{xx}$ is never negative.`);
D('B', 'The point the line fits worst is the one with', ['the largest residual in size', 'the largest x', 'the largest y', 'the smallest residual'], 'Look at |residual|, not at the raw coordinates.');
D('C', 'Two events are independent when', ['knowing one happened does not change the chance of the other', 'they cannot both happen', 'they have the same probability', 'one causes the other'], 'Independent is about information, not overlap. Events that cannot both happen are called disjoint, which is a different idea.');
D('C', R`$A$ and $B$ are independent. $P(A \text{ and } B)$ is`, [R`$P(A)\,P(B)$`, R`$P(A) + P(B)$`, R`$P(A) + P(B) - P(A)\,P(B)$`, R`$1 - P(A)\,P(B)$`], 'Multiply for "and". The other two formulas are "or" and "not both".');
D('C', R`$A$ and $B$ are independent. $P(A \text{ or } B)$ is`, [R`$P(A) + P(B) - P(A)\,P(B)$`, R`$P(A) + P(B)$`, R`$P(A)\,P(B)$`, R`$1 - P(A) - P(B)$`], 'Add, then take off the overlap once. Plain adding counts the overlap twice.');
D('C', 'The quickest way to "at least one" is', [R`$1 - P(\text{none})$`, 'add the single probabilities', 'multiply the single probabilities', R`$P(\text{exactly one})$`], 'The opposite of "at least one" is "none", and "none" is a single multiplication.');
D('C', R`A fair coin and a fair die. $P(\text{heads and a six})$ is`, [R`$1/12$`, R`$2/3$`, R`$1/8$`, R`$7/12$`], R`$\frac12 \times \frac16 = \frac1{12}$, one cell of the 2 by 6 grid. $7/12$ is "heads or a six".`);
D('C', 'Two cards drawn from a deck without putting the first one back. The two draws are', ['not independent', 'independent', 'independent only if the first card is an ace', 'disjoint'], 'The first card is gone, so the chances for the second draw change.');
