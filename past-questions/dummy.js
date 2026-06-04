const questions = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "High Transfer Markup Language",
      "HyperText Management Language",
      "Home Tool Markup Language"
    ],
    correct: 0
  },
  {
    id: 2,
    question: "Which data structure follows the LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correct: 1
  },
  {
    id: 3,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
    correct: 2
  },
  {
    id: 4,
    question: "Which of the following is NOT a primitive data type in JavaScript?",
    options: ["String", "Boolean", "Array", "Number"],
    correct: 2
  },
  {
    id: 5,
    question: "In SQL, which command is used to retrieve data from a table?",
    options: ["GET", "FETCH", "SELECT", "PULL"],
    correct: 2
  },
  {
    id: 6,
    question: "Which HTTP method is used to update an existing resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correct: 2
  },
  {
    id: 7,
    question: "What does CSS stand for?",
    options: [
      "Creative Style Sheets",
      "Cascading Style Sheets",
      "Computer Style Sheets",
      "Colorful Style Sheets"
    ],
    correct: 1
  },
  {
    id: 8,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
    correct: 2
  },
  {
    id: 9,
    question: "What is the default port for HTTPS?",
    options: ["80", "8080", "443", "3000"],
    correct: 2
  },
  {
    id: 10,
    question: "In object-oriented programming, what is encapsulation?",
    options: [
      "Inheriting properties from a parent class",
      "Bundling data and methods that operate on the data within one unit",
      "The ability of an object to take many forms",
      "Hiding the implementation details from the user"
    ],
    correct: 1
  },
  {
    id: 11,
    question: "Which of the following is a NoSQL database?",
    options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
    correct: 2
  },
  {
    id: 12,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Automated Program Interaction",
      "Application Process Integration",
      "Advanced Programming Index"
    ],
    correct: 0
  },
  {
    id: 13,
    question: "Which operator is used for strict equality in JavaScript?",
    options: ["==", "=", "===", "!="],
    correct: 2
  },
  {
    id: 14,
    question: "What is a primary key in a relational database?",
    options: [
      "A key that encrypts the database",
      "A unique identifier for each record in a table",
      "The first column in any table",
      "A foreign key reference"
    ],
    correct: 1
  },
  {
    id: 15,
    question: "Which protocol is used for sending emails?",
    options: ["FTP", "HTTP", "SMTP", "SSH"],
    correct: 2
  },
  {
    id: 16,
    question: "In version control, what does 'git merge' do?",
    options: [
      "Deletes a branch",
      "Combines two branches together",
      "Creates a new branch",
      "Reverts the last commit"
    ],
    correct: 1
  },
  {
    id: 17,
    question: "What is a RESTful API?",
    options: [
      "An API that uses only GET requests",
      "An API built using Python",
      "An API that follows REST architectural constraints using HTTP methods",
      "An API that requires authentication"
    ],
    correct: 2
  },
  {
    id: 18,
    question: "Which of the following best describes 'recursion'?",
    options: [
      "A loop that runs forever",
      "A function that calls itself",
      "A method of sorting data",
      "An error handling technique"
    ],
    correct: 1
  },
  {
    id: 19,
    question: "What is the purpose of a foreign key in a database?",
    options: [
      "To encrypt data between tables",
      "To create a primary key automatically",
      "To establish a link between two tables",
      "To speed up query performance"
    ],
    correct: 2
  },
  {
    id: 20,
    question: "Which of the following is an example of polymorphism?",
    options: [
      "A class inheriting from another class",
      "A function that behaves differently based on the object it acts on",
      "Hiding the internal state of an object",
      "Creating multiple instances of a class"
    ],
    correct: 1
  }
];

module.exports = questions;
