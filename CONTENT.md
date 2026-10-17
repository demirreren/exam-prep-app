# Writing content

All content is plain JavaScript that calls a few registration functions. Math goes inside `$...$` (inline) or `$$...$$` (display) and is rendered with KaTeX. Write strings that contain backslashes with `R` (an alias for `String.raw`) so you do not have to double them: `` R`$\bar y = \frac1N\sum y_u$` ``.

Everything from the engine is available: `mean, median, sd, sorted, sum, fx` (format a number), `S(x)` (format as inline math), `ri(a, b)` (random integer), `distinctPop(n, lo, hi)`, `buildOpts`, `Plot`, `NL`, `lsFit`, `scatter`, `mini`.

## `CONFIG` (00_config.js)

| field | meaning |
|---|---|
| `storageKey` | localStorage key for progress. Change it to reset everyone |
| `title`, `brand`, `brandSmall` | browser tab, header |
| `examStart`, `examEnd` | ISO timestamps with offset. Drive the countdown |
| `examShort`, `examWhen`, `examLong` | "The midterm", "Fri 2pm", the line on the Plan tab |
| `scopeWarning` | HTML shown above a problem with `scope: 1` |
| `problemsLede`, `drillLede` | intro lines on those tabs |
| `topics` | `[[key, name, shortName], ...]` |
| `lessons` | `[[key, name], ...]` in the order they should be read. Each key needs a `W` and an `L` |
| `sheet.pages` | one label per printed side. `makepdf.py` asserts the PDF has this many pages |
| `sheet.title`, `sheet.lede`, `sheet.filename` | header on the printed sheet, intro on the tab, download name |

## Problems: `P({...})`

```js
P({ id: 'A-summ', topic: 'A', tag: 'must', name: '...', src: 'Past midterm Q1', marks: '6 total ...',
  q: R`...the question...`,
  note: R`optional red box, e.g. "the key has a slip here"`,
  fig: 'figName',          // optional, a FIGS entry drawn under the question
  scope: 1,                // optional, shows CONFIG.scopeWarning
  steps: [
    { t: 'Step title', h: R`what this step does` },
    { t: 'Step title', pick: { q: 'Which move next?', opts: [['right', true, 'why'], ['wrong', false, 'why not']] }, h: R`...` }
  ],
  ans: R`the final answer in one or two lines` });
PLAIN['A-summ'] = 'one plain-words sentence shown above the question';
```

`tag` is `must`, `extra` or `low`. The Plan and the lesson end screens only link to problems by id, so the id is the contract.

## Lessons: `W({...})` and `L({...})`

A walkthrough is a list of screens shown one at a time:

```js
W({ id: 'A', screens: [
  { h: 'Heading', b: R`<p>html</p>`, fig: 'figName', w: 'widgetName', after: R`<p>html under the figure</p>`,
    box: R`$$...$$<p>...</p>`, boxTitle: 'How the exam writes it',
    q: { q: 'Check yourself?', opts: [['right', true, 'why'], ['wrong', false, 'why not']] } }
], done: '<p>shown on the finish screen</p>' });
```

`L` holds the dense notes under the walkthrough and the links at the end:

```js
L({ id: 'A', cards: [{ h: 'Title', b: R`...`, fig: 'x', w: 'y' }], checks: [[question, answer]], doOne: 'A-summ', next: ['A-outlier'] });
```

`doOne` is the problem embedded on the finish screen. `next` lists the problems to do after.

## Figures and widgets

`FIGS.name = () => 'html or svg'`. `WIDGETS.name = el => { ...fill el... }`. Widgets get a `div.wg`; use `$('#id', el)` to find controls inside it. The click-through test works every `select` option, every `input[type=range]` position and every `button` inside `.wg`, so make them all safe to press repeatedly.

`Plot({w, h, x: [lo, hi], y: [lo, hi]})` returns a chainable SVG builder: `.frame().xt([...]).yt([...]).xl('label').fn(x => ..., 'c-acc').dots(pts, 'hot', 4).svg('alt text')`. `NL({lo, hi, ticks, pts: [{x, cls, r}], marks: [{x, lab, cls}]})` draws a number line.

## Symbols

`SYMBOLS.push(['Group title', [[R`$y_u$`, 'meaning'], ...]])`. Shown by the "What do the symbols mean?" button.

## Drill: `D(topic, question, options, why)`

The first option is correct. Options are shuffled when shown. Make the wrong ones real mistakes.

## Generators: `G(kind, topic, weight, fn)`

```js
G('newmean', 'A', 2, () => {
  for (;;) {
    const p = distinctPop(5, 1, 20), y = ri(21, 60), ans = mean(p.concat([y]));
    const opts = buildOpts(S(ans), [[S(mean(p)), 'why this is wrong'], ...]);   // null if texts collide: loop and redraw
    if (!opts) continue;
    return { topic: 'A', q: R`...`, opts, why: R`...`, chk: { kind: 'newmean', p, y } };
  }
});
```

`chk` must hold the raw numbers. `checks.py`'s `recompute(kind, chk)` returns the correct option text from them, and `gencheck.py` compares. Weight 0 keeps a generator defined but never drawn.

## Plan and sheet

`PLAN = { headline, howto, lede, logistics, blocks: [...] }`. A block: `{ id, title, min, why, lesson: 'A', probs: ['A-summ'] }` or a manual one: `{ id, title, min, why, manual: true, pre: 'html', links: [['label', () => go('drill')]] }`.

`SHEET = [{ page: 1, title, rows: [[key, html], ...], print?: function () { ...returns extra html for print only... } }]`. Rows with an empty key print as plain lines. On the Cheat Sheet tab, the right column of each row is what "Quiz me" hides.

`STRATEGY` is HTML shown at the top of the Cheat Sheet tab.

## Style rules that held up

- Short plain sentences. Write like a student explaining to a friend.
- One small concrete example reused everywhere (five numbers, five points).
- One idea per lesson screen. A picture or a widget on most of them.
- Every case on its own line as "value if condition". No semicolon lists.
- Ready-made sentences for the marks that are given for a sentence ("Since the SC is bounded ...").
- Nothing personal in the content. People share the link.
