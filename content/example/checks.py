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
    return out


def recompute(kind, c):
    if kind == 'newmean': return fmt(mean(c['p'] + [c['y']]))
    if kind == 'slope': return fmt(fit(c['pts'])[0])
    raise KeyError(kind)
