"""Shared Playwright setup plus the two page checks every test runs.

BAD  looks for text that should never reach a reader: undefined, NaN, raw $ (unrendered math), KaTeX errors,
     and prose sitting loose inside a flex container (which makes inline math break onto its own line).
OVER looks for anything wider than the viewport.
"""
import pathlib, sys
from playwright.async_api import async_playwright  # noqa: F401 (re-exported)

S = pathlib.Path(__file__).resolve().parent.parent
KJS = (S / 'node_modules/katex/dist/katex.min.js').read_text()
SHOTS = S / 'build' / 'shots'; SHOTS.mkdir(parents=True, exist_ok=True)


def preview_for(content):
    name = pathlib.Path(content).name
    p = S / 'build' / f'{name}-preview.html'
    if not p.exists(): sys.exit(f'{p} not found. Run scripts/build.py {content} first.')
    return p


async def setup(pw, w, h, dark, content):
    b = await pw.chromium.launch()
    ctx = await b.new_context(viewport={'width': w, 'height': h}, color_scheme='dark' if dark else 'light', device_scale_factor=1)
    page = await ctx.new_page()
    errs = []
    page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    async def route(r):
        u = r.request.url
        if 'katex.min.js' in u: await r.fulfill(body=KJS, content_type='application/javascript')   # offline: serve KaTeX from node_modules
        elif u.startswith('file:'): await r.continue_()
        else: await r.abort()                                                                      # fonts etc. are not needed for the checks
    await page.route('**/*', route)
    await page.goto('file://' + str(preview_for(content)))
    try: await page.wait_for_selector('.tab', timeout=8000)
    except Exception:
        sys.exit('the page did not boot. Errors: ' + '; '.join(errs[:5]))
    return b, page, errs


BAD = "() => { const t = document.querySelector('#main').innerText; const bad = []; for (const w of ['undefined', 'NaN', '$$', '\\\\frac', '\\\\begin', '[object', 'Infinity']) if (t.includes(w)) bad.push(w + ' @ ' + t.substr(Math.max(0, t.indexOf(w) - 60), 140).replace(/\\n/g, ' ')); const ke = document.querySelectorAll('#main .katex-error').length; if (ke) bad.push('katex-error x' + ke + ': ' + document.querySelector('#main .katex-error').getAttribute('title')); document.querySelectorAll('#main *').forEach(e => { const cs = getComputedStyle(e); if ((cs.display === 'flex' || cs.display === 'inline-flex') && e.children.length && Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) bad.push('loose text in flex container ' + e.tagName + '.' + e.className + ': ' + e.textContent.trim().slice(0, 50)); }); const dollars = (t.match(/\\$/g) || []).length; if (dollars) bad.push('raw $ x' + dollars + ' @ ' + t.substr(Math.max(0, t.indexOf('$') - 60), 140)); return bad; }"
OVER = "() => { const W = window.innerWidth, out = []; document.querySelectorAll('header *, main *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.right > W + 1 && !e.closest('.tblwrap,.katex-display,.tabs,.lchips,.readout,svg,.katex')) out.push(e.tagName + '.' + e.className + ' ' + Math.round(r.right)); }); return {sw: out.length ? W + 1 : W, cw: W, out: out.slice(0, 5)}; }"
