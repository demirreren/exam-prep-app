"""Run the content's own numeric checks (content/<course>/checks.py, function checks() -> [(name, ok, detail), ...]).

The idea: every number that appears in a worked solution is recomputed here, independently, with exact fractions
where possible. If the official answer key disagrees, the check documents which one is right.

    python3 scripts/verify.py content/example
"""
import sys, pathlib, importlib.util

S = pathlib.Path(__file__).resolve().parent.parent


def main(content):
    d = S / content
    spec = importlib.util.spec_from_file_location('checks', d / 'checks.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    fails = 0
    for name, ok, detail in m.checks():
        print(('PASS ' if ok else 'FAIL ') + name + (' :: ' + str(detail) if detail else ''))
        fails += 0 if ok else 1
    print(f'{fails} failures')
    return fails


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('usage: verify.py content/<course>')
    sys.exit(1 if main(sys.argv[1]) else 0)
