/**
 * Utkarsh Heritage Festival — the Vedic Quiz.
 *
 * One place that describes the event and its three class groups. The landing
 * page, the group pages, the admin quiz creator and the question banks all read
 * from here, so adding a group or renaming one is a single edit rather than a
 * hunt through the codebase.
 *
 * Each group is its own quiz in the database, distinguished by the lane columns
 * added in V2 (event + group_code + stage). That is what lets all three run at
 * the same time — see setQuizStatus in lib/db.js.
 */

const EVENT = 'utkarsh';

const EVENT_INFO = {
  key: EVENT,
  name: 'Utkarsh',
  tagline: 'An Inter School Cultural Extravaganza',
  competition: 'Vedic Quiz',
  organiser: 'ISKCON Guwahati, Ulubari',
  edition: '2026',
  /* Kept short on purpose: this is read on a phone by a child who is about to
     sit an exam, not by someone browsing. */
  blurb:
    'A quiz on the Bhagavad-gita, the Ramayana and Mahabharata, the Puranas, ' +
    'and the culture and heritage of Bharat. Answered here on your phone, but ' +
    'attempted at the temple, so everyone sits it under the same conditions.',
  rules: [
    'Find your group below — it depends on your class.',
    'Each group gets its own set of questions.',
    'Answer on your own. No notes, no help, no switching apps.',
  ],
};

/**
 * How many rounds each group sits, in order.
 *
 * Round 1's slug is the bare group slug rather than "-r1", so any quiz already
 * created from the earlier single-round setup keeps working and does not need
 * recreating. Rounds are separate quizzes, distinguished by `stage`, which is
 * what lets them be published independently — round 2 stays closed until
 * round 1 is done.
 */
const ROUNDS = [
  { stage: 1, label: 'Round 1', suffix: '', questions: 15 },
  { stage: 2, label: 'Round 2', suffix: '-r2', questions: 15 },
];

const GROUP_DEFS = [
  { code: 'A', classes: 'Class 1 to 4', minClass: 1, maxClass: 4, accent: 'from-amber-400 to-orange-500' },
  { code: 'B', classes: 'Class 5 to 7', minClass: 5, maxClass: 7, accent: 'from-sky-400 to-blue-600' },
  { code: 'C', classes: 'Class 8 to 10', minClass: 8, maxClass: 10, accent: 'from-fuchsia-500 to-rose-600' },
];

/** The three groups, each with its rounds expanded. */
const GROUPS = GROUP_DEFS.map((g) => {
  const base = `utkarsh-2026-${g.code.toLowerCase()}`;
  return {
    ...g,
    label: `Group ${g.code}`,
    slug: base, // round 1 — what the entry page starts
    rounds: ROUNDS.map((r) => ({
      ...r,
      slug: `${base}${r.suffix}`,
      bank: `${base}${r.suffix}`,
      title: `Utkarsh 2026 — Vedic Quiz — Group ${g.code} (${g.classes}) — ${r.label}`,
    })),
  };
});

/** Every round of every group, flattened — what the admin setup creates. */
function allRounds() {
  return GROUPS.flatMap((g) => g.rounds.map((r) => ({ ...r, groupCode: g.code })));
}

/**
 * The round after the one with this slug, within the same group, or null at
 * the end. Used by the done page to offer the next round without sending the
 * student back to re-enter their details.
 */
function nextRound(slug) {
  for (const g of GROUPS) {
    const i = g.rounds.findIndex((r) => r.slug === slug);
    if (i === -1) continue;
    const next = g.rounds[i + 1];
    return next ? { ...next, groupCode: g.code, groupLabel: g.label } : null;
  }
  return null;
}

/** Which round a slug is, for wording like "Round 1 of 2". */
function roundOf(slug) {
  for (const g of GROUPS) {
    const r = g.rounds.find((x) => x.slug === slug);
    if (r) return { ...r, groupCode: g.code, groupLabel: g.label, total: g.rounds.length };
  }
  return null;
}

/** Lookup by URL segment — accepts 'a', 'A', or 'group-a'. */
function findGroup(code) {
  if (!code) return null;
  const wanted = String(code).trim().toLowerCase().replace(/^group-?/, '');
  return GROUPS.find((g) => g.code.toLowerCase() === wanted) || null;
}

module.exports = { EVENT, EVENT_INFO, GROUPS, ROUNDS, findGroup, allRounds, nextRound, roundOf };
