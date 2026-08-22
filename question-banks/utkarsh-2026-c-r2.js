/**
 * Utkarsh 2026 — Vedic Quiz — Group C (Class 8-10) — Round 2
 *
 * Rewritten to test understanding rather than recall of obscure detail.
 * The mix is deliberate: reasoning ("why did X do Y"), sequence, assertion
 * and reason, application of a teaching to an ordinary situation, and
 * odd-one-out — the formats a Class 8-10 student already meets at school.
 *
 * Assertion-and-reason items put the two statements on separate lines. The
 * four options are the same four judgements every time, so the format is
 * never the puzzle — though the platform shuffles their order per student,
 * so a student cannot pass on "the answer is B".
 *
 * `correct` is the 0-based index into `options` AS LISTED HERE. The platform
 * shuffles options per student and maps the answer across.
 */

module.exports = [
  {
    id: 1,
    question: 'How did Yudhishthira lose the kingdom to the Kauravas?',
    options: [
      'He was defeated in open battle',
      'He staked more and more in a game of dice, including himself and Draupadi',
      'He gave the kingdom away willingly',
      'His father exiled him',
    ],
    correct: 1, // He staked more and more in a game of dice, including himself
  },
  {
    id: 2,
    question: 'Assertion: Karna fought on the side of the Kauravas.\nReason: Duryodhana made him king of Anga and stood by him when others mocked his birth.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 0, // Both are true, and the reason explains the assertion
  },
  {
    id: 3,
    question: 'Which is the correct order of the four yugas?',
    options: [
      'Kali - Dvapara - Treta - Satya',
      'Treta - Satya - Kali - Dvapara',
      'Satya - Treta - Dvapara - Kali',
      'Dvapara - Treta - Satya - Kali',
    ],
    correct: 2, // Satya - Treta - Dvapara - Kali
  },
  {
    id: 4,
    question: 'Why did Lord Vishnu appear as Narasimha, who was neither fully man nor fully animal?',
    options: [
      'To frighten all the demons at once',
      'Because Hiranyakashipu\'s boon protected him from man and animal, by day and by night, indoors and outdoors',
      'Because He wished to test Prahlada',
      'Because Brahma requested that particular form',
    ],
    correct: 1, // Because Hiranyakashipu's boon protected him from man and ani
  },
  {
    id: 5,
    question: 'Someone does their duty well but is constantly anxious about praise and blame. According to the Gita, what are they missing?',
    options: [
      'Knowledge of the scriptures',
      'Physical strength',
      'Steadiness of mind in success and failure',
      'A qualified teacher',
    ],
    correct: 2, // Steadiness of mind in success and failure
  },
  {
    id: 6,
    question: 'Which of these is NOT one of the five Pandavas?',
    options: [
      'Nakula',
      'Sahadeva',
      'Ashwatthama',
      'Yudhishthira',
    ],
    correct: 2, // Ashwatthama
  },
  {
    id: 7,
    question: 'Why did Sita undergo the test of fire after the war?',
    options: [
      'To prove her purity before the people',
      'To obtain a boon',
      'To punish Ravana',
      'To become immortal',
    ],
    correct: 0, // To prove her purity before the people
  },
  {
    id: 8,
    question: 'Assertion: The Bhagavad-gita has eighteen chapters.\nReason: The Kurukshetra war lasted eighteen days.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 1, // Both are true, but the reason does not explain the assertion
  },
  {
    id: 9,
    question: 'Which is the correct order of events in the Mahabharata?',
    options: [
      'The game of dice - the exile - the Kurukshetra war - the Pandavas rule',
      'The Kurukshetra war - the game of dice - the exile - the Pandavas rule',
      'The exile - the game of dice - the Pandavas rule - the Kurukshetra war',
      'The game of dice - the Kurukshetra war - the exile - the Pandavas rule',
    ],
    correct: 0, // The game of dice - the exile - the Kurukshetra war - the Pan
  },
  {
    id: 10,
    question: 'Why is it significant that the Bhagavad-gita was spoken on a battlefield rather than in a temple?',
    options: [
      'Because there was no temple nearby',
      'Because it shows that spiritual knowledge applies in the middle of real duty and difficulty',
      'Because Arjuna refused to enter a temple',
      'Because battlefields were considered sacred places',
    ],
    correct: 1, // Because it shows that spiritual knowledge applies in the mid
  },
  {
    id: 11,
    question: 'The Bhagavad-gita describes three gunas, or qualities of material nature. Which are they?',
    options: [
      'Dharma, artha and kama',
      'Karma, jnana and bhakti',
      'Sattva, rajas and tamas',
      'Brahma, Vishnu and Shiva',
    ],
    correct: 2, // Sattva, rajas and tamas
  },
  {
    id: 12,
    question: 'How did Lanka come to be burnt by Hanuman?',
    options: [
      'Rama commanded him to burn it',
      'Ravana had his tail set alight, and Hanuman used it on the city',
      'He set it alight hoping to kill Ravana',
      'Vibhishana asked him to',
    ],
    correct: 1, // Ravana had his tail set alight, and Hanuman used it on the c
  },
  {
    id: 13,
    question: '\'Whatever you do, whatever you eat, do it as an offering to Me.\' Which practice most directly reflects this teaching?',
    options: [
      'Reading aloud every morning',
      'Fasting on every festival day',
      'Travelling to holy places',
      'Offering food to the Lord before eating it',
    ],
    correct: 3, // Offering food to the Lord before eating it
  },
  {
    id: 14,
    question: 'Assertion: Arjuna was able to see Krishna\'s universal form.\nReason: Arjuna had unusually sharp eyesight.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 2, // The assertion is true, but the reason is false
  },
  {
    id: 15,
    question: 'Why is the Mahabharata considered far more than the story of a war?',
    options: [
      'It is the longest poem ever composed',
      'It carries teachings on duty, ethics and devotion, including the Bhagavad-gita',
      'It was written by many different authors',
      'It describes a large number of kingdoms',
    ],
    correct: 1, // It carries teachings on duty, ethics and devotion, including
  },
];
