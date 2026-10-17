"""Render the cheat sheet to a PDF with exactly the page count the content asks for.

The sheet is laid out in CSS columns with a fixed page height, so too much content pushes past the right edge instead
of spilling onto a new page. This script binary-searches the font size: the largest size where nothing overflows.
It then writes the PDF, asserts the page count, and saves a PNG of each page to build/shots/.

    python3 scripts/makepdf.py content/example            # writes build/example-sheet.pdf
Then rebuild with --pdf build/example-sheet.pdf so the Save button inside the app has the file.
"""
import asyncio, sys, subprocess, pathlib
from playwright.async_api import async_playwright
from harness import setup, S, SHOTS

FIT = """() => { let fits = true, fill = []; document.querySelectorAll('#printsheet .pg').forEach(pg => {
  const r = pg.getBoundingClientRect(); let maxRight = 0, last = 0;
  pg.querySelectorAll('.it, h2, .shapes, table, li').forEach(e => { for (const q of e.getClientRects()) { if (q.right > maxRight) maxRight = q.right; if (q.bottom > last) last = q.bottom; } });
  if (maxRight > r.right + 2) fits = false; fill.push(Math.round(100 * (last - r.top) / r.height)); });
  return { fits, fill, ke: document.querySelectorAll('#printsheet .katex-error').length }; }"""


async def main(content):
    d = S / content; name = d.name
    async with async_playwright() as pw:
        b, page, errs = await setup(pw, 1100, 800, False, content)
        pages = await page.evaluate('CONFIG.sheet.pages.length')
        await page.evaluate('window.__buildPrintSheet()')
        await page.emulate_media(media='print')
        await page.set_viewport_size({'width': 762, 'height': 1000})
        await page.evaluate("() => { const s = document.createElement('style'); s.id = 'fit-css'; document.head.appendChild(s); }")
        async def at(fs):
            await page.evaluate("(c) => { document.querySelector('#fit-css').textContent = c; }", '@media print{#printsheet{font-size:%.2fpt!important}}' % fs)
            await page.wait_for_timeout(30)
            return await page.evaluate(FIT)
        lo, hi = 4.0, 16.0
        for _ in range(12):
            mid = (lo + hi) / 2
            if (await at(mid))['fits']: lo = mid
            else: hi = mid
        fs = int(lo * 20) / 20; r = await at(fs)
        print(f'font {fs}pt, fits {r["fits"]}, page fill {r["fill"]}%, katex errors {r["ke"]}')
        out = S / 'build' / f'{name}-sheet.pdf'
        await page.pdf(path=str(out), prefer_css_page_size=True, print_background=True)
        await b.close()
    info = subprocess.run(['pdfinfo', str(out)], capture_output=True, text=True).stdout
    got = int([l for l in info.splitlines() if l.startswith('Pages')][0].split()[-1])
    print(f'{out}: {got} page(s), wanted {pages}')
    subprocess.run(['pdftoppm', '-r', '110', '-png', str(out), str(SHOTS / f'{name}-sheet')], stderr=subprocess.DEVNULL)
    return 0 if got == pages and r['ke'] == 0 else 1


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('usage: makepdf.py content/<course>')
    sys.exit(asyncio.run(main(sys.argv[1])))
