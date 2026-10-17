"""Quick smoke test: open each tab at desktop-light and phone-dark, report bad text, overflow and console errors, save screenshots.

    python3 scripts/smoke.py content/example
"""
import asyncio, sys
from playwright.async_api import async_playwright
from harness import setup, BAD, OVER, SHOTS


async def main(content):
    worst = 0
    async with async_playwright() as pw:
        for (w, h, dark) in [(1100, 800, False), (400, 800, True)]:
            b, page, errs = await setup(pw, w, h, dark, content)
            tag = f'{w}{"d" if dark else "l"}'
            for tab in ['plan', 'learn', 'problems', 'drill', 'sheet']:
                await page.click(f'.tab[data-tab={tab}]')
                await page.wait_for_timeout(150)
                bad = await page.evaluate(BAD); o = await page.evaluate(OVER)
                worst += len(bad) + len(o['out'])
                print(tag, tab, 'bad:', bad, 'overflow:', o['out'])
                await page.screenshot(path=str(SHOTS / f'{tag}-{tab}.png'), full_page=False)
            errs = [e for e in errs if 'ERR_FAILED' not in e]
            worst += len(errs)
            print(tag, 'console errors:', errs[:8])
            await b.close()
    print('PROBLEMS:', worst)
    return worst


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('usage: smoke.py content/<course>')
    sys.exit(1 if asyncio.run(main(sys.argv[1])) else 0)
