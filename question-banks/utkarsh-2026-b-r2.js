/**
 * Utkarsh 2026 — Vedic Quiz — Group B (Class 5-7) — Round 2
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
    question: 'Who was the brother of Ravana who joined Lord Rama?',
    options: [
      'Kumbhakarna',
      'Indrajit',
      'Vibhishana',
      'Sugriva',
    ],
    correct: 2, // Vibhishana
  },
  {
    id: 2,
    question: 'Which hill did Lord Krishna lift on His finger?',
    options: [
      'Govardhan',
      'Kailash',
      'Meru',
      'Himalaya',
    ],
    correct: 0, // Hanuman was named by two later questions, giving this away
  },
  {
    id: 3,
    question: 'Who was the sister of Lord Krishna?',
    options: [
      'Satyabhama',
      'Subhadra',
      'Devaki',
      'Kunti',
    ],
    correct: 1, // Subhadra
  },
  {
    id: 4,
    question: 'Who was the eldest of the five Pandavas?',
    options: [
      'Bhima',
      'Arjuna',
      'Yudhishthira',
      'Nakula',
    ],
    correct: 2, // Yudhishthira
  },
  {
    id: 5,
    question: 'Why did Hanuman carry an entire mountain to Lanka?',
    options: [
      'To block Ravana\'s army',
      'Because he could not tell which of the herbs was the right one',
      'To build the bridge across the sea',
      'Because Rama had asked for the mountain itself',
    ],
    correct: 1, // Because he could not tell which of the herbs was the right
  },
  {
    id: 6,
    question: 'Which son of Devaki killed Kamsa?', // reframe it please 
    options: [
      'first',
      'eighth',
      'fourth',
      'nineth',
    ],
    correct: 1, // eighth
  },
  {
    id: 7,
    question: 'How many steps of land Lord Vamana asked for?',
    options: [
      'two steps of land',
      'three steps of land',
      'four steps of land',
      'five steps of land',
    ],
    correct: 1, // three steps of land
  },
  {
    id: 8,
    question: 'What was the name of Ravana\'s sister?',
    options: [
      'Shurpanakha',
      'Kaikeyi',
      'Mandodari',
      'Sumitra',
    ],
    correct: 0, // Surpanakha
  },
  {
    id: 9,
    question: 'Who raised Lord Krsna in Gokul?',
    options: [
      'Nanda - Yashoda',
      'Vasudev - Devaki',
      'Damodar - Kunti',
      'Jadubharata - Sumitra',
    ],
    correct: 0, // Dhruva
  },
  {
    id: 10,
    question: 'Where was Lord Krishna born ?',
    options: [
      'Mathura',
      'Vrindavan',
      'Ayodhya',
      'Gokul',
    ],
    correct: 1, // To reclaim the three worlds from King Bali
  },
  {
    id: 11,
    question: 'Which of these was NOT a demon defeated by Lord Krishna?',
    options: [
      'Putana',
      'Bakasura',
      'Kumbhakarna',
      'Aghasura',
    ],
    correct: 2, // Ravana replaced: Q1 named him, handing this one over
  },
  {
    id: 12,
    question: 'In which form did Lord Vishnu appear as a beautiful woman to distribute the nectar?',
    options: [
      'Mohini',
      'Narasimha',
      'Vamana',
      'Varaha',
    ],
    correct: 0, // Mohini
  },
  {
    id: 13,
    question: 'Which childhood friend visited Dwaraka to meet Krishna?',
    options: [
      'Sudama',
      'Madhumangal',
      'Arjuna',
      'Bhima',
    ],
    correct: 0, // Sudama
  },
  {
    id: 14,
    question: 'What was the name of Prahlada\'s father?',
    options: [
      'Hiranyaksha',
      'Hiranyakashipu',
      'Kumbhakarna',
      'Ravana',
    ],
    correct: 1, // Hiranyakashipu
  },
  {
    id: 15,
    question: 'What is the meaning of \'Krishna\'?',
    options: [
      'All attractive',
      'Dark and Beautiful',
      'Golden one',
      'All of the above',
    ],
    correct: 0, // All of the above
  },
];
