/**
 * Utkarsh 2026 — Vedic Quiz — Group C (Class 8-10) — Round 2
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
    question: 'How did Yudhishthira lose the kingdom to the Kauravas?',
    options: [
      'He was defeated in open battle',
      'He staked more and more in a game of dice, including himself and Draupadi',
      'He gave the kingdom away willingly',
      'His father exiled him',
    ],
    correct: 1, // He staked more and more in a game of dice, including himse
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
    question: 'Which is the correct order of Krishna\'s Vrindavan pastimes?',
    options: [
      'Lifting Govardhan - killing Putana - killing Aghasura - leaving for Mathura',
      'Killing Putana - killing Aghasura - lifting Govardhan - leaving for Mathura',
      'Killing Aghasura - lifting Govardhan - killing Putana - leaving for Mathura',
      'Leaving for Mathura - killing Putana - killing Aghasura - lifting Govardhan',
    ],
    correct: 1, // Killing Putana - killing Aghasura - lifting Govardhan - Mathura
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
    correct: 1, // Because Hiranyakashipu's boon protected him from man and a
  },
  {
    id: 5,
    question: 'Why did Indra send torrential rain upon Vrindavan?',
    options: [
      'To test Krishna\'s strength',
      'Because the residents had stopped his yearly sacrifice on Krishna\'s advice',
      'Because Kamsa had asked him to',
      'To wash away the demons hiding in the forest',
    ],
    correct: 1, // Because the residents had stopped his yearly sacrifice on 
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
    question: 'Assertion: Kumbhakarna slept for six months at a stretch.\nReason: When he asked Brahma for a boon, Saraswati changed the words on his tongue.',
    options: [
      'Both are true, and the reason explains the assertion',
      'Both are true, but the reason does not explain the assertion',
      'The assertion is true, but the reason is false',
      'The assertion is false, but the reason is true',
    ],
    correct: 0, // Both are true, and the reason explains the assertion
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
    correct: 0, // The game of dice - the exile - the Kurukshetra war - the P
  },
  {
    id: 10,
    question: 'Why was Abhimanyu unable to come out of the chakravyuha?',
    options: [
      'His chariot was destroyed at the entrance',
      'Arjuna had forbidden him to go in',
      'He had learnt how to enter the formation but not how to break out of it',
      'He chose to remain inside and fight',
    ],
    correct: 2, // He had learnt how to enter the formation but not how to br
  },
  {
    id: 11,
    question: 'Why did Krishna disappear in the middle of the rasa dance?',
    options: [
      'Because Kamsa\'s soldiers had arrived',
      'To curb the pride that had arisen among the gopis',
      'Because the night had come to an end',
      'Because Radha had asked Him to leave',
    ],
    correct: 1, // To curb the pride that had arisen among the gopis
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
    correct: 1, // Ravana had his tail set alight, and Hanuman used it on the
  },
  {
    id: 13,
    question: 'Who first told the searching monkeys where Sita was being held?',
    options: [
      'Jatayu',
      'Sampati',
      'Vibhishana',
      'Trijata',
    ],
    correct: 1, // Sampati
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
    correct: 1, // It carries teachings on duty, ethics and devotion, includi
  },
];
