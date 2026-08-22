/**
 * Mulberry32 seeded PRNG — fast and good quality.
 * Produces the same sequence for the same seed every time.
 */
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a string to a 32-bit integer seed.
 */
function strToSeed(str) {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0; // FNV prime
  }
  return hash;
}

/**
 * Fisher-Yates shuffle using a seeded PRNG.
 * Always returns the same order for the same arr + seed combo.
 */
function shuffleWithSeed(arr, seed) {
  const rand = mulberry32(typeof seed === 'string' ? strToSeed(seed) : seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = { shuffleWithSeed, optionIndexList };

/**
 * The list of option indices to shuffle, for one question.
 *
 * Both the quiz start and the answer-review replay need to agree exactly on
 * this, so it lives in one place. Blank entries are dropped: a question stored
 * as ["True","False","",""] should present two options, not two real ones and
 * two empty boxes a child can tap and get marked wrong for.
 *
 * Returns indices into the ORIGINAL options array, so the stored correct_index
 * keeps pointing at the right answer without remapping.
 */
function optionIndexList(options) {
  if (!Array.isArray(options)) return [0, 1, 2, 3];
  const usable = options
    .map((opt, i) => (String(opt ?? '').trim() === '' ? -1 : i))
    .filter((i) => i !== -1);
  return usable.length ? usable : [0, 1, 2, 3];
}
