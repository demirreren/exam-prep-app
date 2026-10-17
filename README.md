# exam-prep-app

Turn a folder of course material into one study web app for one exam. Five tabs: a study plan, step-by-step lessons, every past exam question with the steps hidden until you ask, a drill with endless generated questions, and a cheat sheet that fits exactly the size the exam allows.

One HTML file. Works offline. Progress saved in the browser. Built from a content folder, so one engine serves any course.

It comes with a verification harness, because a study app that is wrong is worse than no study app. Every number in every worked solution is recomputed independently with exact fractions. Every generated drill question is recomputed too. A headless browser clicks through every screen, every step and every widget at desktop and phone sizes and fails on anything a reader should never see.

I built the first version of this in about eight hours before a stats midterm, with Claude writing the code and me sending screenshots back as bug reports. The verification step caught three mistakes in the official answer keys. This repo is the engine and the harness, with a small made-up course as the example. The real course content belongs to the prof, so it is not here.

## Try it

```
npm install                                  # KaTeX, inlined into the page at build time
pip install -r requirements.txt && playwright install chromium
python3 scripts/build.py content/example     # writes build/example.html and build/example-preview.html
```

Open `build/example-preview.html` in a browser. Then run the harness:

```
python3 scripts/verify.py content/example    # recompute every number in the worked solutions
python3 scripts/gencheck.py content/example  # replay the drill generators, recompute 1000 answers each
python3 scripts/smoke.py content/example     # each tab at 1100px light and 400px dark
python3 scripts/full.py content/example      # click through everything
python3 scripts/makepdf.py content/example   # cheat sheet to PDF, largest font that fits, assert the page count
python3 scripts/build.py content/example --pdf build/example-sheet.pdf   # embed the PDF so the Save button works
```

`npm test` runs all of them. `pdfinfo` and `pdftoppm` (poppler) are needed for the PDF check.

## Make your own course

Copy `content/example` to `content/<course>` and edit. The files load in name order, so keep the prefixes:

| file | what goes in it |
|---|---|
| `00_config.js` | exam date, topic names, lesson order, cheat sheet size, the strings the engine shows |
| `1*_*.js` | course math and the drill generators. Must not touch the DOM: the harness runs these in Node |
| `20_problems.js` | past exam questions and lecture examples as `P({...})`, plus `PLAIN[id]` one-liners |
| `30_lessons.js` | walkthroughs `W({...})`, dense notes `L({...})`, figures, widgets, the symbol decoder |
| `40_drill.js` | fixed quick-recall questions `D(...)` |
| `50_plan_sheet.js` | `PLAN`, `STRATEGY`, `SHEET` |
| `checks.py` | `checks()` recomputes the worked solutions, `recompute(kind, chk)` recomputes a generated answer |

[CONTENT.md](CONTENT.md) documents every field. The example course is short on purpose: two topics, six problems, two generators, twelve drills, one page of cheat sheet. It is there to show the shape, and to keep the harness honest.

## What the harness checks

- `verify.py`: whatever `checks.py` asserts. The point is that the person writing the content writes the check in a different language, from the raw numbers, with exact arithmetic, and compares against the official key. When they disagree, the check is where you find out which one is wrong.
- `gencheck.py`: for each generator, dumps N questions with a fixed seed, then recomputes every answer in Python from the numbers stored in `chk`. Also: no duplicate options, exactly one correct, no `undefined`, balanced `$`.
- `smoke.py` and `full.py`: the words `undefined`, `NaN`, `Infinity`, `[object`, a raw `$` (math that did not render), a KaTeX error, any element wider than the viewport, and prose sitting loose inside a flex container (which makes inline math break onto its own line). `full.py` also makes sure every problem reaches its answer, every check-yourself question has a correct option, every fixed drill question is seen, the missed pile empties, and every widget control works.
- `makepdf.py`: the cheat sheet uses CSS columns with a fixed page height, so too much content pushes past the right edge instead of adding a page. The script binary-searches the font size to the largest that fits, writes the PDF, and asserts the page count matches `CONFIG.sheet.pages`.

## How it was used

The way that worked, written up as a skill in [SKILL.md](SKILL.md):

1. Put every lecture, tutorial, past paper and answer key where the model can read them. Get the exam format and the scope cutoff in the prof's words.
2. Write a one-page spec: topics with marks per topic from the past papers, the five tabs, style rules, "verify every number in code and flag errors in the keys", "the prof wins".
3. Ship the heaviest three topics with all five tabs first. Use it. Send screenshots back.
4. Verify, then verify a different way. Then have a reviewer who did not see the build read it.
5. Assume the reader knows nothing and rewrite every lesson as hand-holding screens with one small concrete example reused everywhere. Keep the dense version as a collapsible.
6. While studying, ask about the screen in front of you. Put good answers back into the app.

## Publishing

`build/<course>.html` is self-contained apart from the KaTeX script tag (cdnjs) and the Google Fonts link. Host it anywhere, or publish it as an artifact. Republishing to the same URL does not wipe anyone's progress: progress lives in each reader's browser under `CONFIG.storageKey`.

## License

MIT. The example course content is made up.
