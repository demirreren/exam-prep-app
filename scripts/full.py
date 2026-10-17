"""Full click-through at 1100px light and 400px dark.

Opens every lesson screen, works every widget (every select option, slider position and button), answers every
check-yourself question, reveals every step of every problem (wrong pick first, then right), answers the whole fixed
drill set (some on purpose wrong, then clears the missed pile), runs 150 endless questions, toggles the cheat sheet
quiz, presses the PDF button, and presses the plan's Start button. Fails on anything BAD/OVER finds along the way.

    python3 scripts/full.py content/example
"""
import asyncio, sys, json, random
from playwright.async_api import async_playwright
from harness import setup, BAD, OVER, SHOTS

problems = []


async def check(page, tag, where):
    bad = await page.evaluate(BAD); o = await page.evaluate(OVER)
    if bad or o['out']: problems.append((tag, where, bad, o['out']))


async def work_widgets(page, tag, name):
    for sel in await page.locator('.wg select').all():
        for o in await sel.locator('option').all():
            await sel.select_option(await o.get_attribute('value'))
            for btn in await page.locator('.wg button').all():
                for _ in range(3):
                    if await btn.is_enabled(): await btn.click()
            await check(page, tag, f'{name} widget select')
    for sl in await page.locator('.wg input[type=range]').all():
        for fr in [0, 0.1, 0.5, 0.9, 1]:
            await sl.evaluate("(e, f) => { const v = +e.min + f * (+e.max - +e.min); e.value = v; e.dispatchEvent(new Event('input')); }", fr)
        await check(page, tag, f'{name} slider')
    for btn in await page.locator('.wg button').all():
        for _ in range(4):
            if await btn.is_enabled(): await btn.click()


async def run(pw, w, h, dark, content, shots):
    b, page, errs = await setup(pw, w, h, dark, content); tag = f'{w}{"d" if dark else "l"}'
    # ---------- lessons ----------
    await page.click('.tab[data-tab=learn]')
    nl = await page.locator('main .chips .chip').count(); nscreens = 0
    for i in range(nl):
        await page.locator('main .chips .chip').nth(i).click(); await page.wait_for_timeout(60)
        name = f'lesson{i + 1}'
        if await page.locator('#w-back').is_enabled(): await page.locator('.wnav .linkbtn').click()
        for guard in range(60):
            nscreens += 1
            await work_widgets(page, tag, name)
            for k, ob in enumerate(await page.locator('.miniq .opt').all()):
                try: await ob.click(timeout=3000)
                except Exception:
                    problems.append((tag, f'{name} screen {guard + 1}', f'option {k} not clickable (something is covering it)', [])); await ob.evaluate('e => e.click()')
            if await page.locator('.miniq').count() and not await page.locator('.miniq .opt.yes').count(): problems.append((tag, name, 'check-yourself question has no correct option', []))
            await check(page, tag, f'{name} screen {guard + 1}')
            if shots and guard in (0, 3): await page.screenshot(path=str(SHOTS / f'{tag}-L{i + 1}-s{guard + 1}.png'), full_page=True)
            nx = page.locator('#w-next')
            if await nx.is_hidden(): break
            await nx.click()
        ra = page.locator('.scr .linkbtn', has_text='Reveal everything')
        if await ra.count(): await ra.first.click()
        await check(page, tag, f'{name} end screen')
        await page.click('#notes-toggle')
        await work_widgets(page, tag, name + ' notes')
        for bt in await page.locator('.qc .linkbtn').all(): await bt.click()
        await check(page, tag, f'{name} notes')
    await page.click('#symbtn'); await page.wait_for_timeout(50)
    symbad = await page.evaluate("() => { const p = document.querySelector('#sympanel'); return [p.hidden, p.querySelectorAll('.katex-error').length, p.innerText.includes('$')]; }")
    if symbad != [False, 0, False]: problems.append((tag, 'symbols panel', str(symbad), []))
    await page.click('#symbtn')
    # ---------- problems ----------
    await page.click('.tab[data-tab=problems]')
    await page.locator('.chip', has_text='Everything').click()
    await page.locator('.chip', has_text='All topics').click()
    n = await page.locator('.prow').count(); nsteps = 0
    for i in range(n):
        row = page.locator('.prow').nth(i); await row.locator('.ph').click()
        pid = await row.get_attribute('id')
        for guard in range(40):
            if await row.locator('.ans').count(): break
            j = await row.locator('.step').count() - 1
            step = row.locator('.step').nth(j)
            if await step.locator('.pick').count():
                for k in range(8):
                    c = await step.locator('.opt').count()
                    if c == 0: break
                    if k < c: await step.locator('.opt').nth(k).click()
                    else: await step.locator('.linkbtn', has_text='Show me').click()
            else:
                await step.locator('button', has_text='Reveal step').click()
            nsteps += 1
        else:
            problems.append((tag, pid, 'never reached the answer', []))
        await check(page, tag, pid)
        if i % 3 == 0: await row.locator('button', has_text='Got it').click()
        elif i % 3 == 1: await row.locator('button', has_text='Redo later').click()
        if i == 0 and shots: await row.screenshot(path=str(SHOTS / f'{tag}-problem.png'))
        await row.locator('.ph').click()
    for i in range(min(3, n)):
        row = page.locator('.prow').nth(i); await row.locator('.ph').click(); await row.locator('.linkbtn', has_text='Reveal everything').click()
        if not await row.locator('.ans').count(): problems.append((tag, 'reveal-all', 'no answer', []))
        await row.locator('button', has_text='Hide the steps').click(); await row.locator('.ph').click()
    await page.locator('.chip', has_text='Redo pile').click(); await check(page, tag, 'redo pile')
    await page.locator('.chip', has_text='Must do').click(); await check(page, tag, 'must filter')
    # ---------- drill: fixed set ----------
    await page.click('.tab[data-tab=drill]')
    total = await page.evaluate("DRILL.filter(d => !d.scope).length"); seen = set(); rounds = 0
    while len(seen) < total and rounds < 30:
        rounds += 1
        await page.locator('.chip', has_text='Question set').click(); await page.click('#drill-start')
        while await page.locator('.dopt').count():
            q = await page.evaluate('({id: window.__dq.id, n: window.__dq.opts.length, okIdx: window.__dorder.findIndex(o => o.ok), texts: window.__dorder.map(o => o.h)})')
            if len(set(q['texts'])) != len(q['texts']): problems.append((tag, 'drill ' + q['id'], 'duplicate options', []))
            first = q['id'] not in seen; seen.add(q['id'])
            idx = q['okIdx'] if not (first and rounds == 1 and len(seen) % 4 == 0) else (q['okIdx'] + 1) % q['n']
            await page.locator('.dopt').nth(idx).click()
            await check(page, tag, 'drill ' + q['id'])
            await page.click('#drill-next')
        await check(page, tag, 'drill score'); await page.locator('button', has_text='Another round').click()
    if len(seen) < total: problems.append((tag, 'drill', f'only saw {len(seen)}/{total}', []))
    for _ in range(6):
        await page.locator('.chip', has_text='Missed pile').click(); await page.click('#drill-start')
        if not await page.locator('.dopt').count(): break
        while await page.locator('.dopt').count():
            ok = await page.evaluate('window.__dorder.findIndex(o => o.ok)'); await page.locator('.dopt').nth(ok).click(); await page.click('#drill-next')
        await page.locator('button', has_text='Another round').click()
    left = await page.evaluate('ST.missed.length')
    if left: problems.append((tag, 'missed pile', f'{left} left after clearing', []))
    # ---------- drill: endless ----------
    kinds = {}
    if await page.evaluate('GEN_WEIGHTS.some(w => w[1] > 0)'):
        await page.locator('.chip', has_text='Endless').click(); await page.click('#drill-start')
        for k in range(150):
            q = await page.evaluate('({kind: window.__dq.chk.kind, texts: window.__dorder.map(o => o.h), nok: window.__dorder.filter(o => o.ok).length})')
            kinds[q['kind']] = kinds.get(q['kind'], 0) + 1
            if len(set(q['texts'])) != len(q['texts']) or q['nok'] != 1: problems.append((tag, 'endless', 'bad options ' + json.dumps(q), []))
            await page.locator('.dopt').nth(random.randrange(len(q['texts']))).click()
            await check(page, tag, 'endless ' + q['kind'])
            await page.click('#drill-next')
    # ---------- sheet and plan ----------
    await page.click('.tab[data-tab=sheet]'); await check(page, tag, 'sheet')
    await page.click('#sheet-quiz'); await page.locator('td.v').first.click(); await page.click('#sheet-quiz'); await page.click('#sheet-pdf'); await page.wait_for_timeout(200)
    await check(page, tag, 'sheet after buttons')
    if shots: await page.screenshot(path=str(SHOTS / f'{tag}-sheet.png'), full_page=True)
    await page.click('.tab[data-tab=plan]'); await check(page, tag, 'plan')
    await page.click('#plan-cta'); await check(page, tag, 'plan cta')
    errs2 = [e for e in errs if 'ERR_FAILED' not in e]
    if errs2: problems.append((tag, 'console', errs2[:5], []))
    print(tag, f'lessons {nl} ({nscreens} screens), problems {n}, steps clicked {nsteps}, fixed drill {len(seen)}/{total} in {rounds} rounds, endless kinds {kinds}')
    await b.close()


async def main(content):
    async with async_playwright() as pw:
        await run(pw, 1100, 800, False, content, True)
        await run(pw, 400, 800, True, content, False)
    print('PROBLEMS:', len(problems))
    for p in problems[:40]: print('  ', p)
    return len(problems)


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('usage: full.py content/<course>')
    sys.exit(1 if asyncio.run(main(sys.argv[1])) else 0)
