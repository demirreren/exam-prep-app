"""Start a new course folder from the example.

    python3 scripts/new_course.py <name>        # copies content/example to content/<name>

Rewrites storageKey, title, brand and brandSmall in 00_config.js so the new course does not share saved progress
with the example. Everything else is left for you to edit (see CONTENT.md).
"""
import re, shutil, sys, pathlib

S = pathlib.Path(__file__).resolve().parent.parent


def main(name):
    if not re.fullmatch(r'[a-z0-9][a-z0-9_-]*', name):
        sys.exit('name must be lowercase letters, digits, - or _ (it becomes a folder and a file name)')
    src, dst = S / 'content' / 'example', S / 'content' / name
    if dst.exists(): sys.exit(f'{dst} already exists')
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns('__pycache__'))
    cfg = dst / '00_config.js'; s = cfg.read_text()
    pretty = name.replace('-', ' ').replace('_', ' ')
    subs = {'storageKey': f'{name}-v1', 'title': f'{pretty.title()} Prep', 'brand': pretty.upper(), 'brandSmall': 'Exam prep'}
    for k, v in subs.items():
        s, n = re.subn(rf"(\b{k}\s*:\s*)'[^']*'", lambda m: m.group(1) + repr(v), s, count=1)
        if not n: sys.exit(f'could not find {k} in {cfg}')
    s = re.sub(r"filename:\s*'[^']*'", f"filename: '{name}-cheat-sheet.pdf'", s, count=1)
    cfg.write_text(s)
    print(f'created {dst.relative_to(S)}')
    for k, v in subs.items(): print(f'  {k} = {v!r}')
    print(f'next: edit the files in content/{name}, then\n  python3 scripts/build.py content/{name}\n  python3 scripts/verify.py content/{name}')


if __name__ == '__main__':
    if len(sys.argv) != 2: sys.exit('usage: new_course.py <name>')
    main(sys.argv[1])
