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
