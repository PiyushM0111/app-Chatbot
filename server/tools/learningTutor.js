// Adaptive Learning Tutor & Interactive Quiz Engine

const CURRICULUM = {
  python: [
    { id: 'vars', name: 'Variables & Data Types', level: 'Beginner' },
    { id: 'loops', name: 'Loops & Conditionals', level: 'Beginner' },
    { id: 'functions', name: 'Functions & Scope', level: 'Intermediate' },
    { id: 'oop', name: 'Object-Oriented Programming (OOP)', level: 'Intermediate' },
    { id: 'async', name: 'Asyncio & Concurrency', level: 'Advanced' }
  ],
  javascript: [
    { id: 'es6', name: 'Modern ES6+ Syntax', level: 'Beginner' },
    { id: 'dom', name: 'DOM Manipulation & Events', level: 'Beginner' },
    { id: 'promises', name: 'Promises & Async/Await', level: 'Intermediate' },
    { id: 'closures', name: 'Closures & Prototypes', level: 'Intermediate' },
    { id: 'performance', name: 'V8 Engine & Memory Optimization', level: 'Advanced' }
  ],
  system_design: [
    { id: 'rest', name: 'REST vs GraphQL vs gRPC', level: 'Beginner' },
    { id: 'caching', name: 'Caching Strategies (Redis/Memcached)', level: 'Intermediate' },
    { id: 'sharding', name: 'Database Sharding & Replication', level: 'Advanced' },
    { id: 'queues', name: 'Message Queues (Kafka/RabbitMQ)', level: 'Advanced' }
  ]
};

const QUIZ_BANKS = {
  python: [
    {
      question: 'What will be the output of `type(3 / 2)` in Python 3?',
      options: ['<class "int">', '<class "float">', '<class "double">', '<class "number">'],
      correctIndex: 1,
      explanation: 'In Python 3, the `/` operator performs true division and always returns a `float` (e.g. `1.5`).'
    },
    {
      question: 'Which of the following creates a dictionary in Python?',
      options: ['x = [1, 2, 3]', 'x = (1, 2, 3)', 'x = {"a": 1, "b": 2}', 'x = {1, 2, 3}'],
      correctIndex: 2,
      explanation: 'Key-value pairs enclosed in curly braces `{}` define a dictionary. `{1, 2, 3}` without keys defines a set.'
    },
    {
      question: 'What is the purpose of the `*args` parameter in a Python function definition?',
      options: ['Enforces type checking', 'Allows passing a variable number of positional arguments', 'Defines a pointer', 'Executes asynchronously'],
      correctIndex: 1,
      explanation: '`*args` allows a function to accept any number of positional arguments unpacked into a tuple.'
    }
  ],
  javascript: [
    {
      question: 'What is the result of `typeof null` in JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctIndex: 2,
      explanation: '`typeof null` returns `"object"` due to a legacy design quirk present since the inception of JavaScript.'
    },
    {
      question: 'Which array method returns a brand new array with transformed elements without mutating the original?',
      options: ['forEach()', 'map()', 'push()', 'splice()'],
      correctIndex: 1,
      explanation: '`Array.prototype.map()` creates and returns a new array with the results of calling a provided function on every element.'
    }
  ]
};

export const getCurriculumTopics = () => CURRICULUM;

export const generateQuiz = (topic = 'python') => {
  const t = topic.toLowerCase();
  const bank = QUIZ_BANKS[t] || QUIZ_BANKS.python;
  return {
    topic: t,
    questions: bank
  };
};

export const evaluateQuizAnswers = (topic, answers) => {
  const t = topic.toLowerCase();
  const bank = QUIZ_BANKS[t] || QUIZ_BANKS.python;
  let correctCount = 0;

  const results = bank.map((q, idx) => {
    const userAns = answers[idx];
    const isCorrect = userAns === q.correctIndex;
    if (isCorrect) correctCount++;

    return {
      question: q.question,
      userAnswer: userAns !== undefined ? q.options[userAns] : 'Not answered',
      correctAnswer: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation
    };
  });

  const percentage = Math.round((correctCount / bank.length) * 100);

  return {
    topic: t,
    totalQuestions: bank.length,
    correctCount,
    percentage,
    passed: percentage >= 60,
    results
  };
};
