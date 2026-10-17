"""Assemble one self-contained HTML file from the engine plus a content folder.

    python3 scripts/build.py content/example                 # writes build/example.html and build/example-preview.html
    python3 scripts/build.py content/example --pdf build/example-sheet.pdf   # also embeds the cheat sheet PDF for the Save button

Load order: content/<course>/00_config.js, the engine, then the other content/<course>/*.js in filename order (prefix them 10_, 20_ ...).
KaTeX CSS and fonts are inlined so the page works offline. KaTeX JS loads from cdnjs.
"""
import re, base64, sys, json, pathlib

S = pathlib.Path(__file__).resolve().parent.parent
ENGINE = ['lib.js', 'core.js', 'figs.js', 'walk_engine.js']
KT = S / 'node_modules' / 'katex' / 'dist'
KEEP = ('KaTeX_Main', 'KaTeX_Math', 'KaTeX_AMS', 'KaTeX_Caligraphic', 'KaTeX_Size')


def content_dir(argv):
    args = [a for a in argv[1:] if not a.startswith('--')]
    if not args: sys.exit('usage: build.py content/<course> [--pdf file.pdf]')
    d = (S / args[0]).resolve() if not pathlib.Path(args[0]).is_absolute() else pathlib.Path(args[0])
    if not (d / '00_config.js').exists(): sys.exit(f'{d} has no 00_config.js')
    return d


def katex_css():
    if not (KT / 'katex.min.css').exists(): sys.exit('run `npm install` first (needs node_modules/katex)')
    css = (KT / 'katex.min.css').read_text()
    def face(m):
        block = m.group(0)
        fam = re.search(r'font-family:"?([A-Za-z0-9_]+)"?', block).group(1)
        if not fam.startswith(KEEP): return ''
        f = re.search(r'url\(fonts/([^)]+\.woff2)\)', block).group(1)
        b64 = base64.b64encode((KT / 'fonts' / f).read_bytes()).decode()
        return re.sub(r'src:[^}]+', f'src:url(data:font/woff2;base64,{b64}) format("woff2")', block)
    return re.sub(r'@font-face\{[^}]+\}', face, css)


def config_of(d):
    """Read the CONFIG literal out of 00_config.js without running it (enough for title and brand)."""
    src = (d / '00_config.js').read_text()
    get = lambda k: (re.search(k + r"\s*:\s*'([^']*)'", src) or re.search(k + r'\s*:\s*"([^"]*)"', src))
    return {k: (get(k).group(1) if get(k) else '') for k in ('title', 'brand', 'brandSmall')}


def build(d, pdf_path=None):
    files = sorted(p for p in d.glob('*.js'))
    js = f'\n/* ---- {d.name}/00_config.js ---- */\n' + (d / '00_config.js').read_text()   # config first: the engine reads it at load time
    for f in ENGINE: js += f'\n/* ---- engine/{f} ---- */\n' + (S / 'engine' / f).read_text()
    for p in files:
        if p.name != '00_config.js': js += f'\n/* ---- {d.name}/{p.name} ---- */\n' + p.read_text()
    assert '</script' not in js.lower(), 'a content file contains </script'
    pdf = base64.b64encode(open(pdf_path, 'rb').read()).decode() if pdf_path else ''
    cfg = config_of(d)
    html = f'''<title>{cfg['title'] or d.name}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<style>{katex_css()}</style>
<style>{(S / 'engine' / 'style.css').read_text()}</style>
<header class="bar"><div class="bar-in"><div class="bar-top"><div class="brand">{cfg['brand']} <small>{cfg['brandSmall']}</small></div><div class="row" style="gap:10px"><button class="symbtn" id="symbtn" type="button" aria-expanded="false"><span class="wide">What do the </span>symbols<span class="wide"> mean</span>?</button><div class="count" id="count"></div></div></div><nav class="tabs" id="tabs" role="tablist" aria-label="Sections"></nav></div><div id="sympanel" hidden></div></header>
<main id="main"></main>
<div id="printsheet" aria-hidden="true"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
<script>window.SHEET_PDF_B64 = "{pdf}";</script>
<script>
{js}
boot();
</script>
'''
    out = S / 'build'; out.mkdir(exist_ok=True)
    page = out / f'{d.name}.html'; page.write_text(html)
    # the preview wrapper adds a doctype and viewport so the file can be opened or tested locally
    sk = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui;background:#fafafa}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
    (out / f'{d.name}-preview.html').write_text(sk + html + '</body></html>')
    print(f'built {page} ({len(html) // 1024} KB; js {len(js) // 1024} KB; pdf {len(pdf) // 1024} KB; {len(files)} content files)')
    return page


if __name__ == '__main__':
    d = content_dir(sys.argv)
    pdf = sys.argv[sys.argv.index('--pdf') + 1] if '--pdf' in sys.argv else None
    build(d, pdf)
