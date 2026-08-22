/**
 * Utkarsh 2026 — Vedic Quiz — Group C (Class 8-10) — Round 1
 *
 * Weighted toward Krishna-leela and Rama-leela rather than abstract
 * philosophy, and pitched at the harder end: the pastimes themselves are
 * the subject, with a few from the Mahabharata.
 *
 * The formats are the ones a Class 8-10 student already meets at school —
 * reasoning, sequence, assertion and reason, application, odd-one-out — so
 * a question is hard because the answer is worth knowing, not because it
 * turns on a name a student either happens to have memorised or has not.
 *
 * Assertion-and-reason items hold the two statements on separate lines and
 * always offer the same four judgements, so the format is never the puzzle.
 * The platform shuffles their order per student.
 *
 * `correct` is the 0-based index into `options` AS LISTED HERE.
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
    question: 'Assertion: However many ropes Mother Yashoda joined together, she could not bind Krishna.\nReason: Krishna is bound by love, never by force.',
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
    correct: 1, // The exile - Sita is taken - the bridge is built - Ravana i
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
    correct: 2, // He advised Ravana to return Sita and was insulted for sayi
  },
  {
    id: 5,
    question: 'Why did Bharata place Lord Rama\'s sandals upon the throne of Ayodhya?',
    options: [
      'To remind the people daily of Rama\'s exile',
      'Because Kaikeyi instructed him to do so',
      'To rule as Rama\'s servant rather than as king in his own right',
      'Because sage Vasishtha crowned the sandals',
    ],
    correct: 2, // To rule as Rama's servant rather than as king in his own r
  },
  {
    id: 6,
    question: 'Why did Krishna spare Kaliya and send him away rather than kill him?',
    options: [
      'Kaliya\'s wives begged for his life, and Krishna showed mercy',
      'Kaliya proved stronger than Krishna in the fight',
      'Garuda had already promised Kaliya protection',
      'Kaliya agreed to become a servant of Indra',
    ],
    correct: 0, // Kaliya's wives begged for his life, and Krishna showed mer
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
    question: 'Which of these did NOT take part in the search for Sita?',
    options: [
      'Hanuman',
      'Angada',
      'Jambavan',
      'Vibhishana',
    ],
    correct: 3, // Vibhishana
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
    question: 'Assertion: Lord Rama spent fourteen years in the forest.\nReason: Rama was the eldest son of King Dasaratha.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 1, // Both true, but being the eldest is not why he was exiled
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
    correct: 1, // Born in Mathura - raised in Gokul - returned to Mathura an
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
