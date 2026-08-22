/**
 * Utkarsh 2026 — Vedic Quiz — Group C (Class 8-10) — Round 1
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
    question: 'Arjuna refused to fight at the start of the Bhagavad-gita. What was his main reason?',
    options: [
      'He was afraid of Karna',
      'He did not want to kill his own relatives and teachers',
      'He had no weapons left',
      'He wanted to rule Hastinapura in peace',
    ],
    correct: 1, // He did not want to kill his own relatives and teachers
  },
  {
    id: 2,
    question: 'Assertion: Krishna tells Arjuna that the soul can never be killed.\nReason: The soul is eternal, and only the body is destroyed.',
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
    question: 'Which is the correct order of events in the Ramayana?',
    options: [
      'Sita is taken - the exile - Ravana is defeated - the bridge is built',
      'The exile - Sita is taken - the bridge is built - Ravana is defeated',
      'The bridge is built - the exile - Sita is taken - Ravana is defeated',
      'The exile - the bridge is built - Sita is taken - Ravana is defeated',
    ],
    correct: 1, // The exile - Sita is taken - the bridge is built - Ravana is 
  },
  {
    id: 4,
    question: 'Why did Vibhishana leave Ravana and join Lord Rama?',
    options: [
      'He wanted the throne of Lanka for himself',
      'He was afraid of Hanuman',
      'He advised Ravana to return Sita and was insulted for saying so',
      'Rama had promised him a kingdom',
    ],
    correct: 2, // He advised Ravana to return Sita and was insulted for saying
  },
  {
    id: 5,
    question: '\'You have a right to your work, but never to its results.\' A student who truly followed this would:',
    options: [
      'Study only if a good result was guaranteed',
      'Study sincerely, without being paralysed by worry about marks',
      'Stop studying, since the results do not matter',
      'Study only the subjects they enjoy',
    ],
    correct: 1, // Study sincerely, without being paralysed by worry about mark
  },
  {
    id: 6,
    question: 'At what point in the Mahabharata is the Bhagavad-gita spoken?',
    options: [
      'After the war, in Hastinapura',
      'During the Pandavas\' exile in the forest',
      'On the battlefield, just before the war begins',
      'At Draupadi\'s swayamvara',
    ],
    correct: 2, // On the battlefield, just before the war begins
  },
  {
    id: 7,
    question: 'Assertion: Prahlada kept worshipping Lord Vishnu although his father forbade it.\nReason: Prahlada wanted to take his father\'s kingdom.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 2, // The assertion is true, but the reason is false
  },
  {
    id: 8,
    question: 'Which is the correct order of the first four incarnations of Lord Vishnu?',
    options: [
      'Kurma - Matsya - Narasimha - Varaha',
      'Varaha - Matsya - Kurma - Narasimha',
      'Narasimha - Varaha - Kurma - Matsya',
      'Matsya - Kurma - Varaha - Narasimha',
    ],
    correct: 3, // Matsya - Kurma - Varaha - Narasimha
  },
  {
    id: 9,
    question: 'Why did Krishna act as Arjuna\'s charioteer instead of fighting in the war Himself?',
    options: [
      'He had vowed not to take up weapons in the war',
      'He was not a skilled warrior',
      'He was considered too old to fight',
      'Arjuna asked Him to stay out of the fighting',
    ],
    correct: 0, // He had vowed not to take up weapons in the war
  },
  {
    id: 10,
    question: 'Which of these is NOT one of the four Vedas?',
    options: [
      'Rig Veda',
      'Sama Veda',
      'Ayur Veda',
      'Atharva Veda',
    ],
    correct: 2, // Ayur Veda
  },
  {
    id: 11,
    question: 'King Parikshit was cursed to die in seven days. How did he choose to spend them?',
    options: [
      'Searching for a cure',
      'Hearing the Srimad Bhagavatam from Sukadeva Goswami',
      'Going to war against the sage who cursed him',
      'Giving away his kingdom and going into hiding',
    ],
    correct: 1, // Hearing the Srimad Bhagavatam from Sukadeva Goswami
  },
  {
    id: 12,
    question: 'Assertion: Hanuman was able to leap across the ocean to Lanka.\nReason: Jambavan reminded him of the strength he already had.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 0, // Both are true, and the reason explains the assertion
  },
  {
    id: 13,
    question: 'Bhishma is remembered for a vow that shaped his whole life. What was it?',
    options: [
      'Never to fight in any war',
      'Never to leave Hastinapura',
      'Never to marry, so that his father could marry Satyavati',
      'Never to speak to the Pandavas',
    ],
    correct: 2, // Never to marry, so that his father could marry Satyavati
  },
  {
    id: 14,
    question: 'Which is the correct order of Krishna\'s early life?',
    options: [
      'Born in Gokul - moved to Mathura - returned to Gokul',
      'Born in Mathura - raised in Gokul - returned to Mathura and killed Kamsa',
      'Born in Dwaraka - raised in Mathura - went to Gokul',
      'Born in Vrindavan - raised in Dwaraka - killed Kamsa',
    ],
    correct: 1, // Born in Mathura - raised in Gokul - returned to Mathura and 
  },
  {
    id: 15,
    question: 'Why is Diwali connected with the Ramayana?',
    options: [
      'It marks the day Rama was born',
      'It marks Rama\'s wedding to Sita',
      'It marks the beginning of Rama\'s exile',
      'It marks Rama\'s return to Ayodhya after fourteen years',
    ],
    correct: 3, // It marks Rama's return to Ayodhya after fourteen years
  },
];
