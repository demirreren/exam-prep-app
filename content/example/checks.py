"""Independent recomputation for the example course. Exact fractions everywhere.

checks()           -> [(name, ok, detail)]   every number that appears in a worked solution
recompute(kind, c) -> the correct option text  for each endless-drill generator kind
"""
from fractions import Fraction as F
import math


def fmt(x, d=3):
    """Match the engine's fx(): round to d places, strip trailing zeros, wrap in $ like S() does."""
    v = round(float(x) + (1e-12 if x > 0 else -1e-12 if x < 0 else 0), d)
    s = f'{v:.{d}f}'.rstrip('0').rstrip('.')
    return '$' + ('0' if s in ('-0', '') else s) + '$'


def mean(p): return sum(F(x) for x in p) / len(p)
def median(p):
    s = sorted(F(x) for x in p); n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2
def sd(p, ddof=0):
    m = mean(p); return math.sqrt(sum((F(x) - m) ** 2 for x in p) / (len(p) - ddof))
def fit(pts):
    xb, yb = mean([p[0] for p in pts]), mean([p[1] for p in pts])
    sxy = sum((F(x) - xb) * (F(y) - yb) for x, y in pts); sxx = sum((F(x) - xb) ** 2 for x, y in pts)
    b = sxy / sxx; return b, yb - b * xb


def checks():
    out = []
    p = [4, 8, 6, 10, 7]
    out.append(('A-summ mean', mean(p) == 7, mean(p)))
    out.append(('A-summ median', median(p) == 7, median(p)))
    out.append(('A-summ SD with N', abs(sd(p) - 2) < 1e-12, sd(p)))
    out.append(('A-nminus1 SD with N-1', abs(sd(p, 1) - math.sqrt(5)) < 1e-12, sd(p, 1)))
    q = p + [37]
    out.append(('A-outlier new mean', mean(q) == 12, mean(q)))
    out.append(('A-outlier new median', median(q) == F(15, 2), median(q)))
    pts = [(1, 2), (2, 4), (3, 5), (4, 8), (5, 6)]
    b, a = fit(pts)
    out.append(('B-fit slope', b == F(6, 5), b))
    out.append(('B-fit intercept', a == F(7, 5), a))
    r = [F(y) - (a + b * x) for x, y in pts]
    out.append(('B-resid values', r == [F(-3, 5), F(1, 5), 0, F(9, 5), F(-7, 5)], [float(v) for v in r]))
    out.append(('B-resid sum to zero', sum(r) == 0, sum(r)))
    # topic C: one fair coin and one fair die
    ph, p6 = F(1, 2), F(1, 6)
    out.append(('C-and both', ph * p6 == F(1, 12), ph * p6))
    out.append(('C-and or', ph + p6 - ph * p6 == F(7, 12), ph + p6 - ph * p6))
    out.append(('C-and or as fractions', F(6, 12) + F(2, 12) - F(1, 12) == F(7, 12), None))
    out.append(('C-and or by counting cells', F(6 + 2 - 1, 12) == F(7, 12), 6 + 2 - 1))
    out.append(('C-and neither', (1 - ph) * (1 - p6) == F(5, 12), (1 - ph) * (1 - p6)))
    out.append(('C-and or plus neither is 1', F(7, 12) + F(5, 12) == 1, None))
    none3 = (1 - p6) ** 3
    out.append(('C-atleast no six in 3', none3 == F(125, 216), none3))
    out.append(('C-atleast answer', 1 - none3 == F(91, 216), 1 - none3))
    out.append(('C-atleast 3 places', f'{float(1 - none3):.3f}' == '0.421', float(1 - none3)))
    out.append(('C-atleast adding gives 1/2', 3 * p6 == F(1, 2), 3 * p6))
    out.append(('C-atleast six rolls added gives 1', 6 * p6 == 1, 6 * p6))
    out.append(('C-check 0.4 x 0.5', F(4, 10) * F(5, 10) == F(2, 10), F(4, 10) * F(5, 10)))
    out.append(('C-check 0.3 is not 0.2', F(3, 10) != F(2, 10), None))
    out.append(('C-check pass given bike', F(3, 10) / F(4, 10) == F(3, 4), F(3, 10) / F(4, 10)))
    # lesson C screens and notes
    out.append(('C-lesson 12 outcomes', 2 * 6 == 12, None))
    out.append(('C-lesson tails and even', ph * F(3, 6) == F(1, 4), ph * F(3, 6)))
    out.append(('C-lesson 1 - neither', 1 - F(5, 12) == F(7, 12), None))
    out.append(('C-notes 0.2 x 0.5', F(2, 10) * F(5, 10) == F(1, 10), None))
    out.append(('C-notes 1 - 0.7^3', 1 - F(7, 10) ** 3 == F(657, 1000) and F(7, 10) ** 3 == F(343, 1000), 1 - F(7, 10) ** 3))
    return out


def recompute(kind, c):
    if kind == 'newmean': return fmt(mean(c['p'] + [c['y']]))
    if kind == 'slope': return fmt(fit(c['pts'])[0])
    if kind == 'atleast': return fmt(1 - (1 - F(c['a'], c['b'])) ** c['n'])
    if kind == 'orrule':
        pa, pb = F(c['a'], 10), F(c['b'], 10); return fmt(pa + pb - pa * pb)
    raise KeyError(kind)
