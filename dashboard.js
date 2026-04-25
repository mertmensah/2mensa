function formatBestTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--:--";
  }
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function readJSON(key, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = String(value);
  }
}

function renderDashboard() {
  const sudokuStats = readJSON("mmensa-sudoku-stats", { wins: 0, bestTimes: {}, plays: 0 });
  const triviaStats = readJSON("mmensa-trivia-stats", { bestScore: 0, rounds: 0 });
  const logicStats = readJSON("mmensa-logic-grid-stats", { wins: 0, plays: 0 });
  const sequenceStats = readJSON("mmensa-sequence-stats", { bestScore: 0, plays: 0 });
  const ravenStats = readJSON("mmensa-raven-stats", { bestScore: 0, plays: 0 });
  const spatialStats = readJSON("mmensa-spatial-stats", { bestScore: 0, plays: 0 });
  const activity = readJSON("mmensa-activity", { streak: 0, maxStreak: 0 });

  const mensaBest = Number(sudokuStats.bestTimes?.mensa || 0);
  const totalPlays = Number(sudokuStats.plays || 0)
    + Number(triviaStats.rounds || 0)
    + Number(logicStats.plays || 0)
    + Number(sequenceStats.plays || 0)
    + Number(ravenStats.plays || 0)
    + Number(spatialStats.plays || 0);

  const achievements = [
    { name: "First Solve", unlocked: Number(sudokuStats.wins || 0) >= 1 },
    { name: "Trivia Ace", unlocked: Number(triviaStats.bestScore || 0) >= 80 },
    { name: "Logic Detective", unlocked: Number(logicStats.wins || 0) >= 3 },
    { name: "Pattern Hunter", unlocked: Number(sequenceStats.bestScore || 0) >= 70 },
    { name: "Matrix Master", unlocked: Number(ravenStats.bestScore || 0) >= 70 },
    { name: "Rotation Expert", unlocked: Number(spatialStats.bestScore || 0) >= 70 },
    { name: "Consistency", unlocked: totalPlays >= 10 },
    { name: "Mensa Speedrun", unlocked: mensaBest > 0 && mensaBest <= 900 }
  ];

  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  setText("dashSudokuWins", sudokuStats.wins || 0);
  setText("dashSudokuBest", formatBestTime(mensaBest));
  setText("dashTriviaBest", triviaStats.bestScore || 0);
  setText("dashLogicWins", logicStats.wins || 0);
  setText("dashSequenceBest", sequenceStats.bestScore || 0);
  setText("dashRavenBest", ravenStats.bestScore || 0);
  setText("dashSpatialBest", spatialStats.bestScore || 0);
  setText("dashStreak", activity.streak || 0);
  setText("dashAchievements", `${unlockedCount}/${achievements.length}`);

  const achievementList = document.getElementById("achievementList");
  if (achievementList) {
    achievementList.innerHTML = "";
    achievements.forEach((achievement) => {
      const chip = document.createElement("span");
      chip.className = `achievement-badge ${achievement.unlocked ? "unlocked" : ""}`;
      chip.textContent = achievement.name;
      achievementList.appendChild(chip);
    });
  }
}

renderDashboard();
