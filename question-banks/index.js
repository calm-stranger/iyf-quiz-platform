/**
 * Every question bank the admin can import from, in one list.
 *
 * Before V2 the admin could only import lib/questions.js — a single hardcoded
 * file — which does not work when three groups need three different sets on
 * the same morning. Banks live in the repo rather than in a paste box so they
 * are version-controlled and reviewable while several people write them.
 */

const banks = {
  'utkarsh-2026-a': {
    label: 'Utkarsh 2026 — Group A — Round 1',
    questions: require('./utkarsh-2026-a'),
  },
  'utkarsh-2026-a-r2': {
    label: 'Utkarsh 2026 — Group A — Round 2',
    questions: require('./utkarsh-2026-a-r2'),
  },
  'utkarsh-2026-b': {
    label: 'Utkarsh 2026 — Group B — Round 1',
    questions: require('./utkarsh-2026-b'),
  },
  'utkarsh-2026-b-r2': {
    label: 'Utkarsh 2026 — Group B — Round 2',
    questions: require('./utkarsh-2026-b-r2'),
  },
  'utkarsh-2026-c': {
    label: 'Utkarsh 2026 — Group C — Round 1',
    questions: require('./utkarsh-2026-c'),
  },
  'utkarsh-2026-c-r2': {
    label: 'Utkarsh 2026 — Group C — Round 2',
    questions: require('./utkarsh-2026-c-r2'),
  },
  'legacy-questions-js': {
    label: 'lib/questions.js (the original bank)',
    questions: require('../lib/questions'),
  },
};

function listBanks() {
  return Object.entries(banks).map(([key, b]) => ({
    key,
    label: b.label,
    count: Array.isArray(b.questions) ? b.questions.length : 0,
  }));
}

function getBank(key) {
  const bank = banks[key];
  return bank && Array.isArray(bank.questions) ? bank.questions : null;
}

module.exports = { banks, listBanks, getBank };
