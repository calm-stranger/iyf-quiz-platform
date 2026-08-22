/**
 * Utkarsh 2026 — Vedic Quiz — Group A (Class 1-4) — Round 1
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
    question: 'What colour is Lord Krishna shown in pictures?',
    options: [
      'Blue',
      'Green',
      'Red',
      'Yellow',
    ],
    correct: 0, // Blue
  },
  {
    id: 2,
    question: 'Which instrument does Lord Krishna play?',
    options: [
      'Drum',
      'Flute',
      'Guitar',
      'Bell',
    ],
    correct: 1, // Flute
  },
  {
    id: 3,
    question: 'What does Lord Krishna wear on His head?',
    options: [
      'A peacock feather',
      'A gold crown',
      'A cap',
      'A flower',
    ],
    correct: 0, // A peacock feather
  },
  {
    id: 4,
    question: 'Which animals did Krishna look after in Vrindavan?',
    options: [
      'Horses',
      'Elephants',
      'Cows',
      'Camels',
    ],
    correct: 2, // Cows
  },
  {
    id: 5,
    question: 'What food did baby Krishna love to steal?',
    options: [
      'Butter',
      'Rice',
      'Fruit',
      'Bread',
    ],
    correct: 0, // Butter
  },
  {
    id: 6,
    question: 'Who was Krishna\'s mother in Gokul?',
    options: [
      'Sita',
      'Radha',
      'Kunti',
      'Yashoda',
    ],
    correct: 3, // Yashoda
  },
  {
    id: 7,
    question: 'Who is the wife of Lord Rama?',
    options: [
      'Sita',
      'Radha',
      'Yashoda',
      'Draupadi',
    ],
    correct: 0, // Sita
  },
  {
    id: 8,
    question: 'Who is Krishna\'s dearest friend in Vrindavan?',
    options: [
      'Radha',
      'Sita',
      'Kunti',
      'Draupadi',
    ],
    correct: 0, // Radha
  },
  {
    id: 9,
    question: 'How many heads did Ravana have?',
    options: [
      'Two',
      'Five',
      'Ten',
      'Twenty',
    ],
    correct: 2, // Ten
  },
  {
    id: 10,
    question: 'Ravana was the king of which land?',
    options: [
      'Lanka',
      'Ayodhya',
      'Mathura',
      'Gokul',
    ],
    correct: 0, // Lanka
  },
  {
    id: 11,
    question: 'What weapon does Lord Rama carry?',
    options: [
      'A sword',
      'A mace',
      'A spear',
      'A bow and arrow',
    ],
    correct: 3, // A bow and arrow
  },
  {
    id: 12,
    question: 'Which brother went with Lord Rama to the forest?',
    options: [
      'Lakshmana',
      'Bharata',
      'Shatrughna',
      'Hanuman',
    ],
    correct: 0, // Lakshmana
  },
  {
    id: 13,
    question: 'Who helped Lord Rama build a bridge across the sea?',
    options: [
      'Elephants',
      'Monkeys',
      'Birds',
      'Fish',
    ],
    correct: 1, // Monkeys
  },
  {
    id: 14,
    question: 'Which festival celebrates Lord Rama coming home to Ayodhya?',
    options: [
      'Holi',
      'Janmashtami',
      'Diwali',
      'Raksha Bandhan',
    ],
    correct: 2, // Diwali
  },
  {
    id: 15,
    question: 'What did Krishna lift to save the people of Vrindavan?',
    options: [
      'A hill',
      'A tree',
      'A house',
      'A boat',
    ],
    correct: 0, // A hill
  },
];
