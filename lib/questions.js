// SPL - Quiz 1

const questions = [
  {
    id: 1,
    question:
      "What was the specific prophecy made by the astrologer about Abhay Charan De at his birth?",
    options: [
      "He would become a wealthy cloth merchant and expand his father's business.",
      "He would marry into the wealthy Mullik family and gain social prestige.",
      "He would cross the ocean at age seventy, become a great religious teacher, and open 108 temples.",
      "He would become a prominent leader in India's struggle for independence."
    ],
    correct: 2
  },
  {
    id: 2,
    question:
      "According to the chapter's depiction, what is the profound spiritual parenting lesson learned from Gour Mohan and Rajani's contrasting styles?",
    options: [
      "Strict discipline and punishment are essential to crush a child's material tendencies.",
      "Unconditional leniency must always be given so the child never feels burdened by rules.",
      "A spiritual atmosphere requires balancing leniency (to encourage devotional inclinations) with firm protective boundaries (to ensure safety and structure).",
      "Parents should completely avoid interfering with a child's natural inclinations, whether good or bad."
    ],
    correct: 2
  },
  {
    id: 3,
    question:
      "Rajani's extreme acts of devotion (offering blood from her breast to a demigod, vowing to eat left-handed) primarily demonstrate what?",
    options: [
      "Superstitious and outdated practices common in 19th-century rural Bengal.",
      "A desperate attempt to gain social prestige and recognition in her community.",
      "A fierce, tangible, and unwavering faith in spiritual protection, channeling deep maternal love into extraordinary vows for her child's welfare.",
      "A clear sign that she did not trust her husband Gour Mohan's devotional practices."
    ],
    correct: 2
  },
  {
    id: 4,
    question:
      'Why was Abhay given the affectionate nickname "Nandulal" by his uncle?',
    options: [
      "Because his father Gour Mohan was also known as Nandu.",
      "Because he loved playing with cows just like Nanda Mahārāja.",
      "Because he was born on Nandotsava, the day after Janmāṣṭamī, aligning him with the ecstatic mood of Nanda Mahārāja.",
      "Because he threw a tantrum requesting that specific name from his playmates."
    ],
    correct: 2
  },
  {
    id: 5,
    question:
      'Gour Mohan treated Deity worship (pūjā) as his "real business" and cloth trading as secondary. Which core philosophical principle does this establish for Śrīla Prabhupāda\'s later teachings?',
    options: [
      "One must completely renounce all material occupations and become a full-time monk to be spiritual.",
      "Kṛṣṇa consciousness must be the absolute center of life, while material necessities are maintained only as a supportive periphery.",
      "Deity worship is only possible for wealthy merchants who can afford it.",
      "Spiritual life is only meant for retired people, not for householders with jobs."
    ],
    correct: 1
  },

  {
    id: 6,
    question: "What was the name of the college Abhay Charan De attended in Calcutta?",
    options: [
      "Presidency College",
      "The University of Calcutta",
      "Scottish Churches' College",
      "The General Assembly Institution"
    ],
    correct: 2
  },
  {
    id: 7,
    question: "What significant personal event happened to Abhay in 1918?",
    options: [
      "He graduated from college with a B.A. degree.",
      "He joined Mahatma Gandhi's non-cooperation movement.",
      "His father passed away.",
      "He was married to Radharani Datta."
    ],
    correct: 3
  },
  {
    id: 8,
    question:
      "What was the primary reason Abhay initially felt reluctant about his arranged marriage?",
    options: [
      "He did not want to marry at such a young age.",
      "He had thought of marrying another girl.",
      "He was in love with a British woman.",
      "He wanted to remain a brahmacārī (celibate student)."
    ],
    correct: 1
  },
  {
    id: 9,
    question:
      "What did the Deity of Kṛṣṇa do in a dream that deeply affected Abhay during his college years?",
    options: [
      "Instructed him to go to Vṛndāvana immediately.",
      "Blessed him with a vision of the universal form.",
      "Complained that he had put Them away in a box and asked him to resume Their worship.",
      "Told him to give up his studies and become a sannyāsī."
    ],
    correct: 2
  },
  {
    id: 10,
    question:
      "Abhay's father, Gour Mohan, chose Radharani Datta as his wife from which community?",
    options: [
      "A family of prominent British civil servants.",
      "A suvarṇa-vaṇik (merchant) family associated with the Mulliks.",
      "A family of renowned Vedic scholars and priests.",
      "A family of wealthy zamindars (landlords)."
    ],
    correct: 1
  },

  {
    id: 11,
    question:
      "In which year did Abhay have his first, life-changing meeting with Śrīla Bhaktisiddhānta Sarasvatī?",
    options: [
      "1918",
      "1920",
      "1922",
      "1923"
    ],
    correct: 2
  },
  {
    id: 12,
    question:
      "What was Abhay's initial argument in response to Bhaktisiddhānta's call to preach?",
    options: [
      "He was too young and inexperienced.",
      "He didn't believe in God.",
      "India was a dependent country and needed to become independent first.",
      "He was already committed to a career in medicine."
    ],
    correct: 2
  },
  {
    id: 13,
    question:
      "At a famous debate, what was the central point Bhaktisiddhānta Sarasvatī successfully proved against the smārta-brāhmaṇas?",
    options: [
      "That only those born in brāhmaṇa families could be spiritual masters.",
      "That Vaiṣṇavism was inferior to other religions.",
      "That a person's qualifications, not their birth, determine if they are a brāhmaṇa.",
      "That the Bhagavad-gītā was not a valid scripture."
    ],
    correct: 2
  },
  {
    id: 14,
    question:
      'What did Śrīla Bhaktisiddhānta Sarasvatī call the printing press, and why?',
    options: [
      'A "golden chariot" – to carry the message far.',
      'A "sacred bell" – to call people to worship.',
      'A "bṛhad-mṛdaṅga" or "big drum" – to spread the holy name worldwide.',
      'A "magic lamp" – to illuminate the darkness of ignorance.'
    ],
    correct: 2
  },
  {
    id: 15,
    question:
      "What was the original name of Śrīla Bhaktisiddhānta Sarasvatī before he accepted the sannyāsa order in 1918?",
    options: [
      "Narendranath Thakur",
      "Jagannath Misra",
      "Bimala Prasada",
      "Gaur Kishora"
    ],
    correct: 2
  },

  {
    id: 16,
    question:
      "What was the primary reason Abhay could not join the full Vṛndāvana pilgrimage in October 1932?",
    options: [
      "He was in Bombay at the time, struggling to establish his pharmacy business.",
      "He was in Allahabad and could not leave his work obligations for the entire month.",
      "His wife Radharani was seriously ill and required his presence at home.",
      "He had not yet received formal initiation and was not permitted to join."
    ],
    correct: 1
  },
  {
    id: 17,
    question:
      "When a venomous snake appeared before Abhay at the Māyāpur Caitanya Maṭha, what was Śrīla Bhaktisiddhānta's immediate command?",
    options: [
      "He warned Abhay to stand still and then personally chanted mantras to charm the snake away.",
      "He ordered a young boy to pick up a large stick and kill it.",
      "He told everyone to ignore it because a devotee is always protected by Kṛṣṇa.",
      "He scolded Abhay for disturbing the peaceful atmosphere of the āśrama."
    ],
    correct: 1
  },
  {
    id: 18,
    question:
      "In his letter to his guru in December 1936, what was Abhay's primary inner conflict?",
    options: [
      "He feared his English was not good enough to ever become an effective preacher.",
      "He was frustrated with internal politics within the Gauḍīya Maṭha and wanted to leave.",
      "He felt neglected and wanted more personal attention from his guru.",
      "As a householder, he could not offer direct, personal service like his sannyāsī godbrothers could."
    ],
    correct: 3
  },
  {
    id: 19,
    question:
      "Where was Śrīla Bhaktisiddhānta Sarasvatī staying during his final illness in December 1936, when Abhay wrote his pleading letter?",
    options: [
      "At the Bagh Bazar temple in Calcutta.",
      "At the Caitanya Maṭha in Māyāpur.",
      "At the Jagannātha temple area in Purī.",
      "At Vṛndāvana, near the Kesi Ghāṭa."
    ],
    correct: 2
  },
  {
    id: 20,
    question:
      "What were Śrīla Bhaktisiddhānta Sarasvatī's last recorded words or instructions before his disappearance on January 1, 1937?",
    options: [
      '"Just chant Hare Kṛṣṇa—that is enough. Why are you disturbing me in this way?"',
      '"Build a temple in every village in India."',
      '"Appoint my eldest sannyāsī disciple as the next ācārya."',
      '"Take me to the Ganges; I must leave my body in sacred waters."'
    ],
    correct: 0
  }
];

module.exports = questions;