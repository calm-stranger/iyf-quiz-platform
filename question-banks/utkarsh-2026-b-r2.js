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
    question: 'Which is the correct order of Krishna\'s childhood pastimes?',
    options: [
      'Lifting Govardhan Hill - killing Putana - killing Kamsa',
      'Killing Putana - lifting Govardhan Hill - killing Kamsa',
      'Killing Kamsa - killing Putana - lifting Govardhan Hill',
      'Killing Putana - killing Kamsa - lifting Govardhan Hill',
    ],
    correct: 1, // Killing Putana - lifting Govardhan Hill - killing Kamsa
  },
  {
    id: 7,
    question: 'How many days did King Parikshit have left to live when he heard the Srimad Bhagavatam?',
    options: [
      'Three days',
      'Five days',
      'Seven days',
      'Ten days',
    ],
    correct: 2, // Seven days
  },
  {
    id: 8,
    question: 'Who narrated the Srimad Bhagavatam to King Parikshit?',
    options: [
      'Vyasadeva',
      'Narada Muni',
      'Sukadeva Goswami',
      'Sanjaya',
    ],
    correct: 2, // Sukadeva Goswami
  },
  {
    id: 9,
    question: 'Which child devotee went to the forest to meditate upon Lord Vishnu?',
    options: [
      'Prahlada',
      'Dhruva',
      'Parikshit',
      'Bharata',
    ],
    correct: 1, // Dhruva
  },
  {
    id: 10,
    question: 'What did Lord Vamana ask King Bali for?',
    options: [
      'Three steps of land',
      'Three villages',
      'Three treasures',
      'Three wishes',
    ],
    correct: 0, // Three steps of land
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
    question: 'What did Hanuman bring back to Lord Rama to prove that he had found Sita?',
    options: [
      'Her ring',
      'Her hair ornament',
      'A letter from Sita',
      'A branch from Ashoka grove',
    ],
    correct: 1, // Her hair ornament
  },
  {
    id: 14,
    question: 'Why did Prahlada keep worshipping Lord Vishnu even though his father forbade it?',
    options: [
      'He wanted to become a king',
      'He was a devoted follower of Lord Vishnu',
      'He wanted to defeat his father',
      'The royal soldiers had taught him to',
    ],
    correct: 1, // He was a devoted follower of Lord Vishnu
  },
  {
    id: 15,
    question: 'How did Lord Krishna protect the unborn Parikshit from the Brahmastra?',
    options: [
      'He entered the womb and shielded him',
      'He sent Garuda to protect him',
      'He created a shield around the palace',
      'He asked Arjuna to guard him',
    ],
    correct: 0, // He entered the womb and shielded him
  },
];
