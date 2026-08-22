/**
 * Utkarsh 2026 — Vedic Quiz — Group A (Class 1-4) — Round 2
 *
 * The simplest paper of the three, and deliberately so: Group A spans ages
 * six to ten, and for the youngest, reading the question is most of the
 * work. Short words, short sentences, one idea per question.
 *
 * Every question is Rama-leela or Krishna-leela — the stories a small child
 * has actually heard at home and at festivals. No Mahabharata: a six-year-old
 * has not formed a view on which Pandava was the strongest, and asking makes
 * the paper feel closed to them rather than difficult in a useful way.
 *
 * Wrong answers are plainly wrong. Nothing here turns on telling apart two
 * brothers, two wives or two demons.
 *
 * `correct` is the 0-based index into `options` AS LISTED HERE. The platform
 * shuffles options per student and maps the answer across.
 */

module.exports = [
  {
    id: 1,
    question: 'Who helped Lord Rama to find Sita?',
    options: [
      'Hanuman',
      'Lakshmana',
      'Sugriva',
      'Angada',
    ],
    correct: 0, // Hanuman
  },
  {
    id: 2,
    question: 'Who is Lord Krishna\'s elder brother?',
    options: [
      'Balarama',
      'Arjuna',
      'Lakshmana',
      'Hanuman',
    ],
    correct: 0, // Balarama
  },
  {
    id: 3,
    question: 'Who set Lanka on fire with his tail?',
    options: [
      'Rama',
      'Lakshmana',
      'Hanuman',
      'Sugriva',
    ],
    correct: 2, // Hanuman
  },
  {
    id: 4,
    question: 'What was brought from the mountain to save Lakshmana?',
    options: [
      'A healing herb',
      'Gold',
      'Water',
      'Fruit',
    ],
    correct: 0, // A healing herb
  },
  {
    id: 5,
    question: 'Who took Sita away to Lanka?',
    options: [
      'Ravana',
      'Sugriva',
      'Vibhishana',
      'Jatayu',
    ],
    correct: 0, // Ravana
  },
  {
    id: 6,
    question: 'How many years did Lord Rama stay in the forest?',
    options: [
      'Two',
      'Five',
      'Fourteen',
      'Twenty',
    ],
    correct: 2, // Fourteen
  },
  {
    id: 7,
    question: 'Which river flows beside Vrindavan?',
    options: [
      'Ganga',
      'Yamuna',
      'Kaveri',
      'Godavari',
    ],
    correct: 1, // Yamuna
  },
  {
    id: 8,
    question: 'Who became the king of Lanka after Ravana was defeated?',
    options: [
      'Vibhishana',
      'Sugriva',
      'Hanuman',
      'Jatayu',
    ],
    correct: 0, // Vibhishana
  },
  {
    id: 9,
    question: 'Who was Sita\'s father?',
    options: [
      'Janaka',
      'Janardana',
      'Dasharatha',
      'Vasudeva',
    ],
    correct: 0, // Janaka
  },
  {
    id: 10,
    question: 'Which demoness came to feed baby Krishna poison?',
    options: [
      'Putana',
      'Surpanakha',
      'Tataka',
      'Holika',
    ],
    correct: 0, // Putana
  },
  {
    id: 11,
    question: 'What did Krishna do to the serpent Kaliya in the river?',
    options: [
      'He ran away from him',
      'He danced on his heads',
      'He became his friend',
      'He hid under water',
    ],
    correct: 1, // He danced on his heads
  },
  {
    id: 12,
    question: 'Who was Lord Rama\'s father?',
    options: [
      'Janaka',
      'Nanda',
      'Dasaratha',
      'Vasudeva',
    ],
    correct: 2, // Dasaratha
  },
  {
    id: 13,
    question: 'Which bird fought with Ravana?',
    options: [
      'Sampati',
      'Garuda',
      'Suka',
      'Jatayu',
    ],
    correct: 3,
  },
  {
    id: 14,
    question: 'What is the story of Lord Rama called?',
    options: [
      'The Mahabharata',
      'The Ramayana',
      'The Gita',
      'The Puranas',
    ],
    correct: 1, // The Ramayana
  },
  {
    id: 15,
    question: 'Which festival celebrates the birth of Lord Krishna?',
    options: [
      'Diwali',
      'Holi',
      'Janmashtami',
      'Navaratri',
    ],
    correct: 2, // Janmashtami
  },
];
