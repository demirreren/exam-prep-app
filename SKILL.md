---
name: exam-prep-app
description: Build a self-contained study web app for one exam from the course's own materials (slides, tutorials, past papers, keys): plan, lessons, past problems step by step, drills, cheat sheet. Use when someone wants to cram a whole course into a site rather than be tutored in chat.
---

# Exam prep app

Turn a pile of course material into one shareable study site for one exam. The person studies in the site, not in chat. Chat is for answering questions about what is on their screen. The engine, harness and an example course are at github.com/demirreren/exam-prep-app (clone it; write a new `content/<course>` folder; run the harness).

## 0. Collect before building

Ask for, or find in the project:
- every lecture file, tutorial, and assignment that is in scope
- every past exam and answer key you can get
- the syllabus or exam notice: date, length, format, marks, what aids are allowed (cheat sheet size matters)
- the scope cutoff, in the prof's words ("up to and including 2.3.2b"). If it is secondhand, mark the affected problems with `scope: 1` so it can be flipped later

Do not start building until you have read the past papers. They decide the topic weights.

## 1. Write the spec first

One short document, kept with the content:
- topics A, B, C... with expected marks per topic, taken from past papers
- the five tabs and what "done" means for each
- style rules: short plain sentences, written like a student explaining to a friend, no hype words, nothing personal about the person (they will share the link)
- "if anything conflicts with what the prof said, the prof wins"
- "verify every number in code and flag errors in the answer keys"

## 2. The five tabs

1. **Plan**: time blocks with a Start/Continue button and progress, ordered by marks per hour
2. **Learn**: one lesson per topic as short screens (one idea each, Back/Next, a check-yourself question every few screens). Dense notes collapsed underneath
3. **Problems**: every past exam question, the lecture examples, a few fresh ones. Steps revealed one at a time, with a "pick the next move" question where a wrong choice is common. Tag must do / extra / low
4. **Drill**: 50+ fixed quick questions plus endless generators. Distractors are the real mistakes, each with a one-line why
5. **Cheat sheet**: fits exactly the allowed size, organised by question type ("Asked like" then DO THIS steps then formulas and a worked example), with a Quiz-me toggle

## 3. Build order

Ship the three heaviest topics with all five tabs working first, publish, then fill the rest and republish to the same link. Progress lives in localStorage, so republishing wipes nothing.

## 4. Verify, then verify differently

- `checks.py`: recompute every number in every worked solution with exact fractions. `scripts/verify.py` must print no FAIL
- `scripts/gencheck.py`: replay every generator with a fixed seed and recompute each answer independently. Zero bad
- Compare every worked answer to the official key. When they disagree, work it a third way. If the key is wrong, say so inside the problem in the `note` box with the exact slip
- Two review passes by a reviewer that has not seen the build

## 5. Test like a user

`scripts/smoke.py` then `scripts/full.py` at 1100px light and 400px dark. They fail on `undefined`, `NaN`, raw `$`, KaTeX errors, anything wider than the viewport, text loose inside a flex container, a problem that never reaches its answer, a check-yourself question with no correct option, a widget control that throws.

`scripts/makepdf.py`: the cheat sheet to PDF, largest font that fits, page count asserted.

## 6. The beginner pass

After v1, assume the reader knows nothing. Rewrite every lesson as hand-holding screens with a picture or widget per idea, one small concrete list reused everywhere, and one worked example with real numbers per concept. This pass is where most of the value is.

## 7. Chat mode while they study

When they ask about a screen, answer with the exact numbers on that screen, in the same tiny example the lesson uses. Short. No new notation. If the answer is good, offer to put it on that screen and republish.

## Pitfalls seen

- Content referencing problems not yet written: the engine guards lookups, but the plan will show gaps
- Inline math inside flex containers breaks onto its own line: wrap prose in `.prose`
- Invisible KaTeX struts intercept taps on buttons: the stylesheet sets `pointer-events: none` on them
- Cheat sheets built from tables look impressive and read badly at 6pt. Prose with a few key tables wins
- Only tag a problem "must" when a past paper asked it or the lecture flagged it
