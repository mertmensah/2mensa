const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const timeLeftEl = document.getElementById("timeLeft");
const scoreEl = document.getElementById("score");
const questionIndexEl = document.getElementById("questionIndex");
const statusEl = document.getElementById("triviaStatus");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const TRIVIA_STATS_KEY = "mmensa-trivia-stats";

const questions = [
  {
    prompt: "Which planet has the most moons currently known?",
    options: ["Earth", "Saturn", "Mars", "Jupiter"],
    answer: "Saturn"
  },
  {
    prompt: "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    answer: "42"
  },
  {
    prompt: "Which word is an anagram of LISTEN?",
    options: ["SILENT", "ENLISTED", "TINSELLE", "SENLIT"],
    answer: "SILENT"
  },
  {
    prompt: "In binary, what is decimal 10?",
    options: ["1001", "1010", "1110", "1100"],
    answer: "1010"
  },
  {
    prompt: "Which shape has the most sides?",
    options: ["Hexagon", "Octagon", "Decagon", "Nonagon"],
    answer: "Decagon"
  },
  {
    prompt: "What is 15% of 240?",
    options: ["30", "32", "36", "42"],
    answer: "36"
  },
  {
    prompt: "Which is a prime number?",
    options: ["51", "57", "61", "63"],
    answer: "61"
  },
  {
    prompt: "If all Bloops are Razzies and all Razzies are Lazzies, Bloops are:",
    options: ["Always Lazzies", "Never Lazzies", "Sometimes Lazzies", "None of these"],
    answer: "Always Lazzies"
  },
  {
    prompt: "What is the capital of Canada?",
    options: ["Toronto", "Ottawa", "Vancouver", "Montreal"],
    answer: "Ottawa"
  },
  {
    prompt: "Which number does not belong: 3, 5, 11, 14, 17?",
    options: ["3", "5", "11", "14"],
    answer: "14"
  }
];

let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let timeLeft = 60;
let timerId = null;
let answered = false;

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderQuestion() {
  const current = roundQuestions[currentIndex];
  if (!current) {
    return finishRound();
  }

  questionEl.textContent = current.prompt;
  questionIndexEl.textContent = `${currentIndex + 1}/${roundQuestions.length}`;
  answersEl.innerHTML = "";
  answered = false;
  nextBtn.disabled = true;

  current.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.type = "button";
    btn.textContent = option;
    btn.addEventListener("click", () => selectAnswer(btn, option));
    answersEl.appendChild(btn);
  });
}

function selectAnswer(button, chosen) {
  if (answered) {
    return;
  }

  answered = true;
  const current = roundQuestions[currentIndex];
  const buttons = answersEl.querySelectorAll(".answer-btn");

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === current.answer) {
      btn.classList.add("correct");
    }
  });

  if (chosen === current.answer) {
    score += 10;
    scoreEl.textContent = String(score);
    statusEl.textContent = "Correct. Keep momentum.";
    window.mmensaPlay?.("success");
  } else {
    button.classList.add("wrong");
    statusEl.textContent = `Not quite. Correct answer: ${current.answer}.`;
    window.mmensaPlay?.("error");
  }

  nextBtn.disabled = false;
}

function finishRound() {
  clearInterval(timerId);
  timerId = null;
  saveTriviaStats();
  questionEl.textContent = `Round complete. Final score: ${score}`;
  answersEl.innerHTML = "";
  statusEl.textContent = score >= 70 ? "Sharp round. Mensa energy." : "Solid attempt. Run another round.";
  nextBtn.disabled = true;
  startBtn.disabled = false;
  window.mmensaPlay?.(score >= 70 ? "success" : "tick");
}

function tick() {
  timeLeft -= 1;
  timeLeftEl.textContent = String(timeLeft);

  if (timeLeft <= 0) {
    statusEl.textContent = "Time is up.";
    finishRound();
  }
}

function startRound() {
  roundQuestions = shuffle(questions).slice(0, 10);
  currentIndex = 0;
  score = 0;
  timeLeft = 60;
  scoreEl.textContent = "0";
  timeLeftEl.textContent = "60";
  startBtn.disabled = true;
  statusEl.textContent = "Round started. Answer quickly.";

  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
  renderQuestion();
}

function saveTriviaStats() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(TRIVIA_STATS_KEY)) || {
      rounds: 0,
      bestScore: 0,
      totalScore: 0
    };
  } catch {
    stats = { rounds: 0, bestScore: 0, totalScore: 0 };
  }

  stats.rounds += 1;
  stats.totalScore += score;
  if (score > Number(stats.bestScore || 0)) {
    stats.bestScore = score;
  }
  localStorage.setItem(TRIVIA_STATS_KEY, JSON.stringify(stats));
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= roundQuestions.length) {
    finishRound();
    return;
  }

  renderQuestion();
}

startBtn.addEventListener("click", startRound);
nextBtn.addEventListener("click", nextQuestion);
