/* ===== 00_config.js : everything the engine needs to know about this exam =====
   This is the only file the engine reads by name. Every other content file just registers things
   with the DSL (P, W, L, D, G, FIGS, WIDGETS, SYMBOLS, PLAN, STRATEGY, SHEET, PLAIN). */
const CONFIG = {
  storageKey: 'example-stats-midterm-v1',          /* bump this to reset everyone's saved progress */
  title: 'Stats 101 Midterm Prep',                  /* browser tab */
  brand: 'STATS 101', brandSmall: 'Midterm prep',   /* top-left of the header */

  /* countdown in the header, and the line at the top of the Plan tab */
  examStart: '2030-03-14T14:00:00-04:00', examEnd: '2030-03-14T15:20:00-04:00',
  examShort: 'The midterm', examWhen: 'Fri 2pm',
  examLong: 'Stats 101 midterm, Friday March 14, 2:00 to 3:20pm',

  /* shown above any problem whose scope flag is set (material that may be past the cutoff) */
  scopeWarning: '<b>Probably not on this exam.</b> This is from material after the reported cutoff. Leave it until everything else is done.',

  problemsLede: 'Every past exam question and the lecture examples, as pen-and-paper questions. Tap a problem to open it. Each step stays hidden until you ask for it.',
  drillLede: 'Fast recall: definitions, which formula, what comes next. Use it between problems and on the morning of.',

  /* topic key, long name, short name (for chips). Problems and drills carry a topic key. */
  topics: [['A', 'Centre and spread', 'Centre and spread'], ['B', 'Fitting a line', 'Lines'], ['C', 'Independent events', 'Probability']],
  /* lesson order and names. Each key needs a W({id}) walkthrough and an L({id}) notes card set. */
  lessons: [['A', 'Centre and spread'], ['B', 'Fitting a line'], ['C', 'Independent events']],

  sheet: {
    title: 'Stats 101 midterm',
    pages: ['one page, one side'],                  /* one entry per printed side; the PDF must have this many pages */
    lede: 'One letter page, one side. The PDF is exactly one page. Print it at 100% scale and add your own notes in the margins.',
    filename: 'stats101-cheat-sheet.pdf'
  }
};
