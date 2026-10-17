"""Four clean screenshots for sharing: a lesson screen, a problem with one step revealed, a drill question answered,
and the cheat sheet page. Retina scale, web fonts loaded (so this one needs a network connection).

    python3 scripts/makepdf.py content/example     # first, so the sheet PDF exists
    python3 scripts/shots.py content/example       # writes build/shots/share-*.png
"""
import asyncio, sys, subprocess, pathlib
from playwright.async_api import async_playwright
from harness import preview_for, KJS, S, SHOTS


async def main(content):
    name = pathlib.Path(content).name
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1100, 'height': 760}, device_scale_factor=2, color_scheme='light')
        page = await ctx.new_page()
        async def route(r):
            if 'katex.min.js' in r.request.url: await r.fulfill(body=KJS, content_type='application/javascript')
            else: await r.continue_()
        await page.route('**/*', route)
        await page.goto('file://' + str(preview_for(content)))
        await page.wait_for_selector('.tab')
        await page.evaluate('document.fonts.ready')
        await page.wait_for_timeout(400)

        # 1. the last lesson, a few screens in, where there is usually a figure
        await page.click('.tab[data-tab=learn]')
        chips = page.locator('main .chips .chip'); await chips.nth(await chips.count() - 1).click()
        for _ in range(3):
            if await page.locator('#w-next').is_visible(): await page.click('#w-next')
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SHOTS / 'share-learn.png'))

        # 2. the first problem with its first step revealed
        await page.click('.tab[data-tab=problems]')
        await page.locator('.chip', has_text='Everything').click()
        row = page.locator('.prow').first; await row.locator('.ph').click()
        step = row.locator('.step').first
        if await step.locator('.pick').count(): await step.locator('.linkbtn', has_text='Show me').click()
        else: await step.locator('button', has_text='Reveal step').click()
        await page.wait_for_timeout(300)
        await row.screenshot(path=str(SHOTS / 'share-problem.png'))

        # 3. one drill question, answered right, with the explanation showing
        await page.click('.tab[data-tab=drill]')
        await page.locator('.chip', has_text='Question set').click(); await page.click('#drill-start')
        ok = await page.evaluate('window.__dorder.findIndex(o => o.ok)')
        await page.locator('.dopt').nth(ok).click()
        await page.wait_for_timeout(300)
        await page.locator('.dq').screenshot(path=str(SHOTS / 'share-drill.png'))
        await b.close()

    # 4. the cheat sheet page from the PDF makepdf.py wrote
    pdf = S / 'build' / f'{name}-sheet.pdf'
    if pdf.exists(): subprocess.run(['pdftoppm', '-r', '200', '-png', '-singlefile', str(pdf), str(SHOTS / 'share-sheet')], check=True)
    else: print(f'{pdf} not found, run makepdf.py first for the sheet shot')
    for f in sorted(SHOTS.glob('share-*.png')): print(f.relative_to(S))


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('usage: shots.py content/<course>')
    asyncio.run(main(sys.argv[1]))
