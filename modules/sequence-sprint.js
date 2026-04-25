const difficultyEl = document.getElementById("sequenceDifficulty");
const startBtn = document.getElementById("startSequenceBtn");
const nextBtn = document.getElementById("nextSequenceBtn");
const timeEl = document.getElementById("sequenceTime");
const scoreEl = document.getElementById("sequenceScore");
const indexEl = document.getElementById("sequenceIndex");
const streakEl = document.getElementById("sequenceStreak");
const promptEl = document.getElementById("sequencePrompt");
const answersEl = document.getElementById("sequenceAnswers");
const statusEl = document.getElementById("sequenceStatus");

const SEQUENCE_STATS_KEY = "mmensa-sequence-stats";
const questionCount = 8;

const configByDifficulty = {
  novice: { time: 90, generators: ["arithmetic", "squareOffset"] },
  medium: { time: 75, generators: ["arithmetic", "squareOffset", "geometric"] },
  hard: { time: 65, generators: ["arithmetic", "geometric", "fibonacci", "alternating"] },
  mensa: { time: 50, generators: ["geometric", "fibonacci", "alternating", "primeDrift"] }
};

let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = 75;
let timerId = null;
let answered = false;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function primes(limit) {
  const values = [];
  for (let n = 2; values.length < limit; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) {
      values.push(n);
    }
  }
  return values;
}

function buildOptions(answer) {
  const deltas = [
    randInt(2, 5),
    randInt(6, 11),
    randInt(12, 20)
  ];

  const options = new Set([answer]);
  deltas.forEach((delta, index) => {
    const sign = index % 2 === 0 ? 1 : -1;
    options.add(answer + sign * delta);
  });

  const list = Array.from(options).filter((value) => Number.isFinite(value));
  while (list.length < 4) {
    list.push(answer + randInt(-25, 25));
  }

  return shuffle(list.slice(0, 4));
}

function generateArithmetic() {
  const start = randInt(2, 20);
  const step = randInt(2, 9);
  const sequence = Array.from({ length: 5 }, (_, idx) => start + idx * step);
  const answer = start + 5 * step;
  return { sequence, answer, label: "Arithmetic step" };
}

function generateGeometric() {
  const start = randInt(2, 7);
  const ratio = randInt(2, 3);
  const sequence = Array.from({ length: 5 }, (_, idx) => start * ratio ** idx);
  const answer = start * ratio ** 5;
  return { sequence, answer, label: "Geometric ratio" };
}

function generateSquareOffset() {
  const offset = randInt(1, 12);
  const sequence = Array.from({ length: 5 }, (_, idx) => (idx + 1) ** 2 + offset);
  const answer = 6 ** 2 + offset;
  return { sequence, answer, label: "Square offset" };
}

function generateFibonacci() {
  const a = randInt(1, 6);
  const b = randInt(2, 8);
  const sequence = [a, b];
  while (sequence.length < 6) {
    sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
  }
  return { sequence: sequence.slice(0, 5), answer: sequence[5], label: "Fibonacci-style" };
}

function generateAlternating() {
  const startA = randInt(2, 12);
  const startB = randInt(3, 13);
  const stepA = randInt(2, 5);
  const stepB = randInt(2, 6);

  const sequence = [
    startA,
    startB,
    startA + stepA,
    startB + stepB,
    startA + stepA * 2
  ];

  const answer = startB + stepB * 2;
  return { sequence, answer, label: "Alternating pair" };
}

function generatePrimeDrift() {
  const basePrimes = primes(7);
  const drift = randInt(1, 7);
  const sequence = basePrimes.slice(0, 5).map((value) => value + drift);
  const answer = basePrimes[5] + drift;
  return { sequence, answer, label: "Prime drift" };
}

const generatorMap = {
  arithmetic: generateArithmetic,
  geometric: generateGeometric,
  squareOffset: generateSquareOffset,
  fibonacci: generateFibonacci,
  alternating: generateAlternating,
  primeDrift: generatePrimeDrift
};

function generateQuestion(difficulty) {
  const cfg = configByDifficulty[difficulty] || configByDifficulty.novice;
  const type = cfg.generators[randInt(0, cfg.generators.length - 1)];
  const generated = generatorMap[type]();
  return {
    ...generated,
    options: buildOptions(generated.answer)
  };
}

function saveStatsOnRoundEnd() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(SEQUENCE_STATS_KEY)) || {
      plays: 0,
      roundsWon: 0,
      bestScore: 0,
      bestStreak: 0,
      bestByDifficulty: {}
    };
  } catch {
    stats = { plays: 0, roundsWon: 0, bestScore: 0, bestStreak: 0, bestByDifficulty: {} };
  }

  if (score > Number(stats.bestScore || 0)) {
    stats.bestScore = score;
  }
  if (streak > Number(stats.bestStreak || 0)) {
    stats.bestStreak = streak;
  }

  const difficulty = difficultyEl.value;
  const currentBestDifficulty = Number(stats.bestByDifficulty[difficulty] || 0);
  if (score > currentBestDifficulty) {
    stats.bestByDifficulty[difficulty] = score;
  }

  const maxPossible = questionCount * 10;
  if (score >= Math.round(maxPossible * 0.7)) {
    stats.roundsWon = Number(stats.roundsWon || 0) + 1;
  }

  localStorage.setItem(SEQUENCE_STATS_KEY, JSON.stringify(stats));
}

function incrementPlayCount() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(SEQUENCE_STATS_KEY)) || {
      plays: 0,
      roundsWon: 0,
      bestScore: 0,
      bestStreak: 0,
      bestByDifficulty: {}
    };
  } catch {
    stats = { plays: 0, roundsWon: 0, bestScore: 0, bestStreak: 0, bestByDifficulty: {} };
  }

  stats.plays = Number(stats.plays || 0) + 1;
  localStorage.setItem(SEQUENCE_STATS_KEY, JSON.stringify(stats));
}

function renderQuestion() {
  const item = roundQuestions[currentIndex];
  if (!item) {
    finishRound();
    return;
  }

  answered = false;
  nextBtn.disabled = true;
  indexEl.textContent = `${currentIndex + 1}/${questionCount}`;
  promptEl.textContent = `${item.sequence.join(", ")}, ?`;
  answersEl.innerHTML = "";
  statusEl.textContent = `${item.label} pattern.`;

  item.options.forEach((value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sequence-answer";
    btn.textContent = String(value);
    btn.addEventListener("click", () => selectAnswer(btn, value));
    answersEl.appendChild(btn);
  });
}

function selectAnswer(button, value) {
  if (answered) {
    return;
  }

  answered = true;
  const item = roundQuestions[currentIndex];
  const buttons = answersEl.querySelectorAll(".sequence-answer");
  const correct = value === item.answer;

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (Number(btn.textContent) === item.answer) {
      btn.classList.add("correct");
    }
  });

  if (correct) {
    score += 10;
    streak += 1;
    statusEl.textContent = "Correct. Pattern locked.";
    window.mmensaPlay?.("success");
  } else {
    button.classList.add("wrong");
    streak = 0;
    statusEl.textContent = `Not this one. Correct answer: ${item.answer}.`;
    window.mmensaPlay?.("error");
  }

  scoreEl.textContent = String(score);
  streakEl.textContent = String(streak);
  nextBtn.disabled = false;
}

function tick() {
  timeLeft -= 1;
  timeEl.textContent = String(Math.max(0, timeLeft));
  if (timeLeft <= 0) {
    finishRound();
  }
}

function finishRound() {
  clearInterval(timerId);
  timerId = null;
  nextBtn.disabled = true;
  saveStatsOnRoundEnd();

  const maxScore = questionCount * 10;
  promptEl.textContent = `Round complete. Score ${score}/${maxScore}.`;
  statusEl.textContent = score >= 56 ? "Strong pattern work." : "Good run. Try another round.";
  window.mmensaPlay?.(score >= 56 ? "success" : "tick");
}

function startRound() {
  const difficulty = difficultyEl.value;
  const cfg = configByDifficulty[difficulty] || configByDifficulty.novice;
  roundQuestions = Array.from({ length: questionCount }, () => generateQuestion(difficulty));
  currentIndex = 0;
  score = 0;
  streak = 0;
  timeLeft = cfg.time;

  incrementPlayCount();

  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  timeEl.textContent = String(timeLeft);

  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
  renderQuestion();
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

difficultyEl.addEventListener("change", () => {
  const cfg = configByDifficulty[difficultyEl.value] || configByDifficulty.novice;
  timeEl.textContent = String(cfg.time);
});
