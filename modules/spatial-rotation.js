const difficultyEl = document.getElementById("rotationDifficulty");
const startBtn = document.getElementById("startRotationBtn");
const nextBtn = document.getElementById("nextRotationBtn");
const timeEl = document.getElementById("rotationTime");
const scoreEl = document.getElementById("rotationScore");
const indexEl = document.getElementById("rotationIndex");
const streakEl = document.getElementById("rotationStreak");
const targetEl = document.getElementById("rotationTarget");
const optionsEl = document.getElementById("rotationOptions");
const statusEl = document.getElementById("rotationStatus");

const SPATIAL_STATS_KEY = "mmensa-spatial-stats";
const questionCount = 8;
const shapes = [
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]]
];

const difficultyConfig = {
  novice: { time: 80, allowMirror: false, baseOptions: 4 },
  medium: { time: 70, allowMirror: true, baseOptions: 4 },
  hard: { time: 60, allowMirror: true, baseOptions: 6 },
  mensa: { time: 50, allowMirror: true, baseOptions: 6 }
};

let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = 70;
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

function rotatePoint([x, y], turns) {
  let px = x;
  let py = y;
  for (let i = 0; i < turns; i += 1) {
    [px, py] = [py, -px];
  }
  return [px, py];
}

function mirrorPoint([x, y]) {
  return [-x, y];
}

function normalize(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return points
    .map(([x, y]) => [x - minX, y - minY])
    .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
}

function transformShape(shape, turns, mirrored = false) {
  let points = shape.map((point) => rotatePoint(point, turns));
  if (mirrored) {
    points = points.map(mirrorPoint);
  }
  return normalize(points);
}

function signature(points) {
  return JSON.stringify(points);
}

function renderShape(container, points, rotationDeg = 0) {
  container.innerHTML = "";
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("class", "rotation-canvas");
  svg.style.transform = `rotate(${rotationDeg}deg)`;

  points.forEach(([x, y]) => {
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(18 + x * 26));
    rect.setAttribute("y", String(18 + y * 26));
    rect.setAttribute("width", "22");
    rect.setAttribute("height", "22");
    rect.setAttribute("rx", "5");
    rect.setAttribute("fill", "#0aa6a6");
    rect.setAttribute("stroke", "#1f2522");
    rect.setAttribute("stroke-width", "2");
    svg.appendChild(rect);
  });

  container.appendChild(svg);
}

function generateQuestion(difficulty) {
  const cfg = difficultyConfig[difficulty] || difficultyConfig.novice;
  const baseShape = shapes[randInt(0, shapes.length - 1)];
  const targetRotation = randInt(0, 3);
  const targetShape = transformShape(baseShape, targetRotation, false);
  const correctRotationDisplay = randInt(0, 3) * 90;

  const options = [
    { shape: targetShape, mirrored: false, rotationDisplay: correctRotationDisplay, correct: true }
  ];
  const seen = new Set([`${signature(targetShape)}|${correctRotationDisplay}`]);

  while (options.length < cfg.baseOptions) {
    const distractorTurns = randInt(0, 3);
    const distractorMirror = cfg.allowMirror ? randInt(0, 1) === 1 : false;
    const distractorShape = transformShape(baseShape, distractorTurns, distractorMirror);
    const rotationDisplay = randInt(0, 3) * 90;
    const key = `${signature(distractorShape)}|${rotationDisplay}`;
    if (seen.has(key)) {
      continue;
    }
    if (!distractorMirror && signature(distractorShape) === signature(targetShape)) {
      continue;
    }
    seen.add(key);
    options.push({ shape: distractorShape, mirrored: distractorMirror, rotationDisplay, correct: false });
  }

  return {
    targetShape,
    targetRotationDisplay: correctRotationDisplay,
    options: shuffle(options)
  };
}

function readStats() {
  try {
    return JSON.parse(localStorage.getItem(SPATIAL_STATS_KEY)) || {
      plays: 0,
      roundsWon: 0,
      bestScore: 0,
      bestStreak: 0,
      bestByDifficulty: {}
    };
  } catch {
    return { plays: 0, roundsWon: 0, bestScore: 0, bestStreak: 0, bestByDifficulty: {} };
  }
}

function writeStats(stats) {
  localStorage.setItem(SPATIAL_STATS_KEY, JSON.stringify(stats));
}

function incrementPlayCount() {
  const stats = readStats();
  stats.plays = Number(stats.plays || 0) + 1;
  writeStats(stats);
}

function saveStatsOnRoundEnd() {
  const stats = readStats();
  const difficulty = difficultyEl.value;
  stats.bestScore = Math.max(Number(stats.bestScore || 0), score);
  stats.bestStreak = Math.max(Number(stats.bestStreak || 0), streak);
  stats.bestByDifficulty[difficulty] = Math.max(Number(stats.bestByDifficulty[difficulty] || 0), score);
  if (score >= Math.round(questionCount * 10 * 0.7)) {
    stats.roundsWon = Number(stats.roundsWon || 0) + 1;
  }
  writeStats(stats);
}

function renderQuestion() {
  const question = roundQuestions[currentIndex];
  if (!question) {
    finishRound();
    return;
  }

  answered = false;
  nextBtn.disabled = true;
  indexEl.textContent = `${currentIndex + 1}/${questionCount}`;
  renderShape(targetEl, question.targetShape, question.targetRotationDisplay);
  optionsEl.innerHTML = "";

  question.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rotation-option";
    renderShape(btn, option.shape, option.rotationDisplay);
    btn.addEventListener("click", () => selectOption(btn, option));
    optionsEl.appendChild(btn);
  });

  statusEl.textContent = "Select the identical shape under rotation only.";
}

function selectOption(button, option) {
  if (answered) {
    return;
  }

  answered = true;
  const buttons = optionsEl.querySelectorAll(".rotation-option");
  const question = roundQuestions[currentIndex];

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (question.options[idx].correct) {
      btn.classList.add("correct");
    }
  });

  if (option.correct) {
    score += 10;
    streak += 1;
    statusEl.textContent = "Correct rotation match.";
    window.mmensaPlay?.("success");
  } else {
    button.classList.add("wrong");
    streak = 0;
    statusEl.textContent = "Not the same object. Watch for mirrored impostors.";
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
  statusEl.textContent = score >= 56 ? `Strong spatial round. Score ${score}/80.` : `Round complete. Score ${score}/80.`;
  window.mmensaPlay?.(score >= 56 ? "success" : "tick");
}

function startRound() {
  const difficulty = difficultyEl.value;
  const cfg = difficultyConfig[difficulty] || difficultyConfig.novice;
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
  const cfg = difficultyConfig[difficultyEl.value] || difficultyConfig.novice;
  timeEl.textContent = String(cfg.time);
});
