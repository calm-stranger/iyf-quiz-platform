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
 * The three groups. `slug` is the stable identifier a student's entry carries
 * through to /api/start, and the value to set on the quiz row in the admin.
 */
const GROUPS = [
  {
    code: 'A',
    label: 'Group A',
    classes: 'Class 1 to 4',
    minClass: 1,
    maxClass: 4,
    slug: 'utkarsh-2026-a',
    title: 'Utkarsh 2026 — Vedic Quiz — Group A (Class 1–4)',
    bank: 'utkarsh-2026-a',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    code: 'B',
    label: 'Group B',
    classes: 'Class 5 to 7',
    minClass: 5,
    maxClass: 7,
    slug: 'utkarsh-2026-b',
    title: 'Utkarsh 2026 — Vedic Quiz — Group B (Class 5–7)',
    bank: 'utkarsh-2026-b',
    accent: 'from-sky-400 to-blue-600',
  },
  {
    code: 'C',
    label: 'Group C',
    classes: 'Class 8 to 10',
    minClass: 8,
    maxClass: 10,
    slug: 'utkarsh-2026-c',
    title: 'Utkarsh 2026 — Vedic Quiz — Group C (Class 8–10)',
    bank: 'utkarsh-2026-c',
    accent: 'from-fuchsia-500 to-rose-600',
  },
];

/** Lookup by URL segment — accepts 'a', 'A', or 'group-a'. */
function findGroup(code) {
  if (!code) return null;
  const wanted = String(code).trim().toLowerCase().replace(/^group-?/, '');
  return GROUPS.find((g) => g.code.toLowerCase() === wanted) || null;
}

module.exports = { EVENT, EVENT_INFO, GROUPS, findGroup };
