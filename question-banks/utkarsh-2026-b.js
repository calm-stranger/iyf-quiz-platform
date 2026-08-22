/**
 * Utkarsh 2026 — Vedic Quiz — Group B (Class 5-7) — Round 1
 *
 * Mostly plain single-answer recall, with four questions in other formats:
 * two that ask WHY, one sequence, one odd-one-out. Deliberately fewer than
 * Group C, and no assertion-and-reason at all — that format is not usually
 * met before Class 9, and a question should never be hard because of its
 * shape.
 *
 * Weighted toward Krishna-leela and Rama-leela, and away from the obscure
 * recall this paper used to lean on (the name of Prahlada's mother, of the
 * sage who cursed Parikshit) — those test whether a child happened to
 * memorise a name, not whether they know the story.
 *
 * `correct` is the 0-based index into `options` AS LISTED HERE. The platform
 * shuffles options per student and maps the answer across.
 */

module.exports = [
  {
    id: 1,
    question: 'Where was the Bhagavad-gita spoken?',
    options: [
      'Dwaraka',
      'Kurukshetra',
      'Mathura',
      'Hastinapura',
    ],
    correct: 1, // Kurukshetra
  },
  {
    id: 2,
    question: 'To whom was the Bhagavad-gita spoken?',
    options: [
      'Yudhishthira',
      'Sanjaya',
      'Arjuna',
      'Bhishma',
    ],
    correct: 2, // Arjuna
  },
  {
    id: 3,
    question: 'The Bhagavad-gita is part of which epic?',
    options: [
      'Ramayana',
      'Mahabharata',
      'Srimad Bhagavatam',
      'Vishnu Purana',
    ],
    correct: 1, // Mahabharata
  },
  {
    id: 4,
    question: 'Which demoness came to kill baby Krishna when he was a small child?',
    options: [
      'Putana',
      'Surpanakha',
      'Tataka',
      'Holika',
    ],
    correct: 0, // Putana
  },
  {
    id: 5,
    question: 'Why did the king of Mathura try to kill baby Krishna?',
    options: [
      'Krishna had stolen butter from his palace',
      'A prophecy said the eighth son of Devaki would kill him',
      'He wanted Vasudeva\'s kingdom',
      'The people of Mathura had asked him to',
    ],
    correct: 1, // 'Kamsa' dropped from the wording, it answered Q8
  },
  {
    id: 6,
    question: 'Which river flows through Vrindavan?',
    options: [
      'Ganga',
      'Yamuna',
      'Saraswati',
      'Narmada',
    ],
    correct: 1, // Yamuna
  },
  {
    id: 7,
    question: 'Which incarnation of Lord Vishnu appeared in the form of a boar?',
    options: [
      'Kurma',
      'Vamana',
      'Varaha',
      'Narasimha',
    ],
    correct: 2, // Varaha
  },
  {
    id: 8,
    question: 'How many months Kumbhakarana used to sleep?',
    options: [
      'Four',
      'Six',
      'Eight',
      'Twelve',
    ],
    correct: 1, // Six
  },
  {
    id: 9,
    question: 'Which of these was NOT a brother of Lord Rama?',
    options: [
      'Lakshmana',
      'Bharata',
      'Sugriva',
      'Shatrughna',
    ],
    correct: 2, // Sugriva
  },
  {
    id: 10,
    question: 'How many Vedas are there?',
    options: [
      'Three',
      'Four',
      'Five',
      'Six',
    ],
    correct: 1, // Four
  },
  {
    id: 11,
    question: 'What does the name \'Bhagavad-gita\' mean?',
    options: [
      'Song of God',
      'Story of God',
      'Song of the Warriors',
      'Divine Story',
    ],
    correct: 0, // Song of God
  },
  {
    id: 12,
    question: 'What food was Lord Krishna famous for loving as a child?',
    options: [
      'Kheer',
      'Laddoo',
      'Butter',
      'Halwa',
    ],
    correct: 2, // Butter
  },
  {
    id: 13,
    question: 'Why did Lord Rama go to the forest for fourteen years?',
    options: [
      'He wanted to meet the sages',
      'His father Dasaratha had promised Kaikeyi a boon',
      'Ravana had challenged him',
      'He was searching for Sita',
    ],
    correct: 1, // His father Dasaratha had promised Kaikeyi a boon
  },
  {
    id: 14,
    question: 'Which is the correct order of events in the Ramayana?',
    options: [
      'Rama breaks the bow - the exile - Sita is taken - Ravana is defeated',
      'The exile - Rama breaks the bow - Sita is taken - Ravana is defeated',
      'Sita is taken - Rama breaks the bow - the exile - Ravana is defeated',
      'Rama breaks the bow - Sita is taken - the exile - Ravana is defeated',
    ],
    correct: 0, // Rama breaks the bow - the exile - Sita is taken - Ravana i
  },
  {
    id: 15,
    question: 'Bali was killed by Rama?',
    options: [
      'True',
      'False',
    ],
    correct: 0, // True
  },
];
