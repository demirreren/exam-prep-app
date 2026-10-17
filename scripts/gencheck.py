"""Cross-check the endless drill generators.

1. Runs the content's generators in Node (engine/lib.js plus every content file named 1*_*.js, which must be DOM-free)
   with a fixed seed and dumps N questions per generator.
2. Recomputes every answer in Python from the numbers the generator stored in `chk`, using the content's own
   checks.py: recompute(kind, chk) -> the correct option text.
3. Also checks option hygiene: no duplicates, exactly one correct, no broken text, balanced $.

    python3 scripts/gencheck.py content/example [N]
"""
import sys, json, re, subprocess, pathlib, importlib.util, collections

S = pathlib.Path(__file__).resolve().parent.parent

DUMP = r"""
const vm = require('vm'), fs = require('fs');
const [engine, files, N, out] = [process.argv[2], JSON.parse(process.argv[3]), +process.argv[4], process.argv[5]];
let code = fs.readFileSync(engine, 'utf8').replace(/if \(typeof module[^\n]*/, '');
for (const f of files) code += '\n' + fs.readFileSync(f, 'utf8');
const ctx = { console, Math, Object, Array, Number, String, JSON, Set, Map, Date, Symbol, isFinite, parseFloat, parseInt };
vm.createContext(ctx);
vm.runInContext(code + '\nthis.__x = { GEN, GEN_TOPIC, GEN_WEIGHTS, setRng, seeded };', ctx);
const X = ctx.__x; X.setRng(X.seeded(20261017));
const res = [];
for (const k of Object.keys(X.GEN)) for (let i = 0; i < N; i++) { const q = X.GEN[k](); res.push({ gen: k, topic: X.GEN_TOPIC[k], q: q.q, opts: q.opts, why: q.why, chk: q.chk }); }
fs.writeFileSync(out, JSON.stringify(res)); console.log('dumped', res.length, 'questions from', Object.keys(X.GEN).length, 'generators');
"""


def main(content, N=1000):
    d = S / content
    pure = sorted(str(p) for p in d.glob('1*_*.js'))
    dump = S / 'build' / f'{d.name}-gen.json'; dump.parent.mkdir(exist_ok=True)
    script = S / 'build' / '_gendump.js'; script.write_text(DUMP)
    subprocess.run(['node', str(script), str(S / 'engine' / 'lib.js'), json.dumps(pure), str(N), str(dump)], check=True)
    spec = importlib.util.spec_from_file_location('checks', d / 'checks.py'); checks = importlib.util.module_from_spec(spec); spec.loader.exec_module(checks)
    data = json.load(open(dump))
    bad = collections.Counter(); n = collections.Counter(); examples = []
    for it in data:
        n[it['gen']] += 1
        texts = [o['h'] for o in it['opts']]; oks = [o for o in it['opts'] if o['ok']]
        probs = []
        if len(set(texts)) != len(texts): probs.append('duplicate options')
        if len(oks) != 1: probs.append('not exactly one correct option')
        if len(texts) < 3: probs.append('fewer than 3 options')
        blob = it['q'] + ' '.join(texts) + it['why'] + ' '.join(o.get('why', '') or '' for o in it['opts'])
        if re.search(r'undefined|NaN|Infinity|\[object', blob): probs.append('broken text')
        if blob.count('$') % 2: probs.append('unbalanced $')
        try:
            exp = checks.recompute(it['chk']['kind'], it['chk'])
            if oks and oks[0]['h'] != exp: probs.append(f'answer mismatch: shown {oks[0]["h"]!r}, recomputed {exp!r}')
        except KeyError:
            probs.append('no recompute() rule for kind ' + it['chk'].get('kind', '?'))
        for p in probs:
            bad[it['gen'] + ': ' + p.split(':')[0]] += 1
            if len(examples) < 10: examples.append((it['gen'], p, it['q'][:90]))
    for k in sorted(n): print(f'{k:12s} {n[k]:5d} generated')
    print('bad:', dict(bad) or 0)
    for e in examples: print('  ', e)
    return sum(bad.values())


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('usage: gencheck.py content/<course> [N]')
    sys.exit(1 if main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 1000) else 0)
