const difficultyEl = document.getElementById("ravenDifficulty");
const startBtn = document.getElementById("startRavenBtn");
const nextBtn = document.getElementById("nextRavenBtn");
const timeEl = document.getElementById("ravenTime");
const scoreEl = document.getElementById("ravenScore");
const indexEl = document.getElementById("ravenIndex");
const streakEl = document.getElementById("ravenStreak");
const matrixEl = document.getElementById("ravenMatrix");
const optionsEl = document.getElementById("ravenOptions");
const statusEl = document.getElementById("ravenStatus");

const RAVEN_STATS_KEY = "mmensa-raven-stats";
const questionCount = 8;

const shapes = ["●", "■", "▲", "◆"];

const difficultyConfig = {
  novice: { time: 80, activeDims: ["shape"] },
  medium: { time: 70, activeDims: ["shape", "color"] },
  hard: { time: 60, activeDims: ["shape", "color", "count"] },
  mensa: { time: 50, activeDims: ["shape", "color", "count", "rotation"] }
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

function buildAttr(cfg, row, col) {
  const attr = {
    shape: 0,
    color: 0,
    count: 1,
    rotation: 0
  };

  const state = cfg.state;
  if (cfg.activeDims.includes("shape")) {
    attr.shape = (state.shapeBase + row * state.shapeRowStep + col * state.shapeColStep) % shapes.length;
  }
  if (cfg.activeDims.includes("color")) {
    attr.color = (state.colorBase + row * state.colorRowStep + col * state.colorColStep) % 4;
  }
  if (cfg.activeDims.includes("count")) {
    attr.count = 1 + ((state.countBase + row * state.countRowStep + col * state.countColStep) % 3);
  }
  if (cfg.activeDims.includes("rotation")) {
    attr.rotation = ((state.rotationBase + row * state.rotationRowStep + col * state.rotationColStep) % 4) * 90;
  }

  return attr;
}

function attrsEqual(a, b) {
  return a.shape === b.shape
    && a.color === b.color
    && a.count === b.count
    && a.rotation === b.rotation;
}

function glyphForAttr(attr) {
  const glyph = document.createElement("span");
  glyph.className = `raven-glyph color-${attr.color}`;
  glyph.textContent = shapes[attr.shape];
  glyph.style.transform = `rotate(${attr.rotation}deg)`;
  return glyph;
}

function renderAttrInContainer(container, attr) {
  container.innerHTML = "";
  for (let i = 0; i < attr.count; i += 1) {
    container.appendChild(glyphForAttr(attr));
  }
}

function generateState() {
  return {
    shapeBase: randInt(0, 3),
    shapeRowStep: randInt(1, 3),
    shapeColStep: randInt(1, 3),
    colorBase: randInt(0, 3),
    colorRowStep: randInt(1, 3),
    colorColStep: randInt(1, 3),
    countBase: randInt(0, 2),
    countRowStep: randInt(1, 2),
    countColStep: randInt(1, 2),
    rotationBase: randInt(0, 3),
    rotationRowStep: randInt(1, 3),
    rotationColStep: randInt(1, 3)
  };
}

function mutateAttr(attr, activeDims) {
  const clone = { ...attr };
  const dim = activeDims[randInt(0, activeDims.length - 1)];

  if (dim === "shape") {
    clone.shape = (clone.shape + randInt(1, 3)) % shapes.length;
  } else if (dim === "color") {
    clone.color = (clone.color + randInt(1, 3)) % 4;
  } else if (dim === "count") {
    clone.count = ((clone.count + randInt(1, 2) - 1) % 3) + 1;
  } else if (dim === "rotation") {
    clone.rotation = (clone.rotation + randInt(1, 3) * 90) % 360;
  }

  return clone;
}

function generateQuestion(difficulty) {
  const cfg = difficultyConfig[difficulty] || difficultyConfig.novice;
  const state = generateState();
  const context = { activeDims: cfg.activeDims, state };

  const matrix = [];
  for (let row = 0; row < 3; row += 1) {
    const rowData = [];
    for (let col = 0; col < 3; col += 1) {
      rowData.push(buildAttr(context, row, col));
    }
    matrix.push(rowData);
  }

  const answer = matrix[2][2];
  const options = [answer];

  while (options.length < 6) {
    const candidate = mutateAttr(answer, cfg.activeDims);
    if (!options.some((item) => attrsEqual(item, candidate))) {
      options.push(candidate);
    }
  }

  return {
    matrix,
    answer,
    options: shuffle(options)
  };
}

function saveStatsOnRoundEnd() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(RAVEN_STATS_KEY)) || {
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

  localStorage.setItem(RAVEN_STATS_KEY, JSON.stringify(stats));
}

function incrementPlayCount() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(RAVEN_STATS_KEY)) || {
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
  localStorage.setItem(RAVEN_STATS_KEY, JSON.stringify(stats));
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

  matrixEl.innerHTML = "";
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const cell = document.createElement("div");
      cell.className = "matrix-cell";
      if (row === 2 && col === 2) {
        cell.classList.add("missing");
        cell.textContent = "?";
      } else {
        renderAttrInContainer(cell, question.matrix[row][col]);
      }
      matrixEl.appendChild(cell);
    }
  }

  optionsEl.innerHTML = "";
  question.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "raven-option";
    renderAttrInContainer(btn, option);
    btn.addEventListener("click", () => selectOption(btn, option));
    optionsEl.appendChild(btn);
  });

  statusEl.textContent = "Find the tile that completes the rule pattern.";
}

function selectOption(button, option) {
  if (answered) {
    return;
  }

  answered = true;
  const question = roundQuestions[currentIndex];
  const buttons = optionsEl.querySelectorAll(".raven-option");
  const correct = attrsEqual(option, question.answer);

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (attrsEqual(question.options[idx], question.answer)) {
      btn.classList.add("correct");
    }
  });

  if (correct) {
    score += 10;
    streak += 1;
    statusEl.textContent = "Correct. Matrix logic confirmed.";
    window.mmensaPlay?.("success");
  } else {
    button.classList.add("wrong");
    streak = 0;
    statusEl.textContent = "Not this tile. Track the transformation across rows and columns.";
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
  statusEl.textContent = score >= 56
    ? `Strong abstract reasoning. Score ${score}/${maxScore}.`
    : `Round complete. Score ${score}/${maxScore}.`;
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
