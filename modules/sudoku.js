const boardEl = document.getElementById("sudokuBoard");
const numberPadEl = document.getElementById("numberPad");
const difficultyEl = document.getElementById("difficulty");
const newGameBtn = document.getElementById("newGameBtn");
const notesBtn = document.getElementById("notesBtn");
const checkBtn = document.getElementById("checkBtn");
const clearBtn = document.getElementById("clearBtn");
const solveBtn = document.getElementById("solveBtn");
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");
const mistakesEl = document.getElementById("mistakes");
const completionEl = document.getElementById("completion");

const difficultyMap = {
  novice: 46,
  medium: 36,
  hard: 30,
  mensa: 24
};

const STORAGE_KEY = "mmensa-sudoku-v3";
const STATS_KEY = "mmensa-sudoku-stats";

let puzzle = [];
let solution = [];
let notesMode = false;
let selectedCell = null;
let elapsedSeconds = 0;
let mistakes = 0;
let gameTimer = null;
let initialEmptyCells = 0;

function deepCopyBoard(board) {
  return board.map((row) => row.slice());
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i += 1) {
    if (board[row][i] === num || board[i][col] === num) {
      return false;
    }
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (board[startRow + r][startCol + c] === num) {
        return false;
      }
    }
  }

  return true;
}

function fillBoard(board) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) {
        for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function findEmpty(board) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

function countSolutions(board, limit) {
  let count = 0;

  function solve() {
    if (count >= limit) {
      return;
    }

    const empty = findEmpty(board);
    if (!empty) {
      count += 1;
      return;
    }

    const [row, col] = empty;
    for (let num = 1; num <= 9; num += 1) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        solve();
        board[row][col] = 0;
      }
      if (count >= limit) {
        return;
      }
    }
  }

  solve();
  return count;
}

function generateSolvedBoard() {
  const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(empty);
  return empty;
}

function generatePuzzle(solvedBoard, clueCount) {
  const puzzleBoard = deepCopyBoard(solvedBoard);
  const cells = shuffle(Array.from({ length: 81 }, (_, idx) => [Math.floor(idx / 9), idx % 9]));
  let removed = 0;
  const targetRemovals = 81 - clueCount;

  for (const [row, col] of cells) {
    if (removed >= targetRemovals) {
      break;
    }

    const backup = puzzleBoard[row][col];
    puzzleBoard[row][col] = 0;
    const candidate = deepCopyBoard(puzzleBoard);

    if (countSolutions(candidate, 2) !== 1) {
      puzzleBoard[row][col] = backup;
    } else {
      removed += 1;
    }
  }

  return puzzleBoard;
}

function formatTime(totalSeconds) {
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function startTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
  }

  gameTimer = setInterval(() => {
    elapsedSeconds += 1;
    timerEl.textContent = formatTime(elapsedSeconds);
    saveProgress();
  }, 1000);
}

function stopTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function clearValidationMarks() {
  boardEl.querySelectorAll(".cell").forEach((cell) => cell.classList.remove("invalid"));
}

function setCellDisplay(cell, value, isNote) {
  cell.dataset.value = value;
  cell.textContent = value;
  cell.classList.toggle("notes", isNote && value.length > 1);
}

function selectCell(cell) {
  if (!cell || cell.disabled) {
    return;
  }

  if (selectedCell) {
    selectedCell.classList.remove("selected");
  }

  selectedCell = cell;
  selectedCell.classList.add("selected");
  statusEl.textContent = notesMode
    ? "Notes mode active. Tap digits to add or remove notes."
    : "Cell selected. Tap a digit below to place it.";
}

function renderBoard() {
  boardEl.innerHTML = "";
  selectedCell = null;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.value = "";

      if ((col + 1) % 3 === 0 && col !== 8) {
        cell.classList.add("border-right");
      }
      if ((row + 1) % 3 === 0 && row !== 8) {
        cell.classList.add("border-bottom");
      }

      if (puzzle[row][col] !== 0) {
        cell.textContent = String(puzzle[row][col]);
        cell.dataset.value = String(puzzle[row][col]);
        cell.disabled = true;
        cell.classList.add("fixed");
      } else {
        cell.addEventListener("click", () => selectCell(cell));
      }

      boardEl.appendChild(cell);
    }
  }
}

function renderNumberPad() {
  numberPadEl.innerHTML = "";

  for (let num = 1; num <= 9; num += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pad-btn";
    btn.textContent = String(num);
    btn.addEventListener("click", () => applyPadValue(String(num)));
    numberPadEl.appendChild(btn);
  }

  const eraseBtn = document.createElement("button");
  eraseBtn.type = "button";
  eraseBtn.className = "pad-btn wide";
  eraseBtn.textContent = "Erase";
  eraseBtn.addEventListener("click", clearSelectedCell);
  numberPadEl.appendChild(eraseBtn);
}

function readBoardFromCells() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  boardEl.querySelectorAll(".cell").forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = cell.dataset.value || "";
    board[row][col] = value.length === 1 ? Number(value) : 0;
  });
  return board;
}

function updateMeta() {
  mistakesEl.textContent = String(mistakes);
  timerEl.textContent = formatTime(elapsedSeconds);

  const board = readBoardFromCells();
  let filled = 0;
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (puzzle[row][col] === 0 && board[row][col] !== 0) {
        filled += 1;
      }
    }
  }

  const ratio = initialEmptyCells === 0 ? 100 : Math.round((filled / initialEmptyCells) * 100);
  completionEl.textContent = `${ratio}%`;
}

function applyPadValue(value) {
  if (!selectedCell || selectedCell.disabled) {
    statusEl.textContent = "Select an empty cell first.";
    window.mmensaPlay?.("tick");
    return;
  }

  if (notesMode) {
    const current = selectedCell.dataset.value || "";
    let digits = current.split("").filter(Boolean);
    if (digits.includes(value)) {
      digits = digits.filter((digit) => digit !== value);
    } else {
      digits.push(value);
    }
    digits = [...new Set(digits)].sort();
    setCellDisplay(selectedCell, digits.join(""), true);
  } else {
    setCellDisplay(selectedCell, value, false);
  }

  clearValidationMarks();
  updateMeta();
  saveProgress();
  window.mmensaPlay?.("tick");
}

function markInvalidCells(invalidSet) {
  boardEl.querySelectorAll(".cell").forEach((cell) => {
    const key = `${cell.dataset.row}-${cell.dataset.col}`;
    if (invalidSet.has(key)) {
      cell.classList.add("invalid");
    }
  });
}

function validateCurrentBoard() {
  const board = readBoardFromCells();
  const invalid = new Set();

  clearValidationMarks();

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      if (value === 0) {
        continue;
      }

      board[row][col] = 0;
      if (!isValid(board, row, col, value)) {
        invalid.add(`${row}-${col}`);
      }
      board[row][col] = value;
    }
  }

  if (invalid.size > 0) {
    markInvalidCells(invalid);
    mistakes += 1;
    updateMeta();
    saveProgress();
    statusEl.textContent = "There are conflicts in the highlighted cells.";
    window.mmensaPlay?.("error");
    return false;
  }

  const isComplete = board.every((row) => row.every((cell) => cell !== 0));
  if (isComplete) {
    const solved = JSON.stringify(board) === JSON.stringify(solution);
    if (solved) {
      stopTimer();
      saveStatsOnWin();
      statusEl.textContent = "Perfect solve. Mensa mindset unlocked.";
      clearSavedProgress();
      window.mmensaPlay?.("success");
    } else {
      statusEl.textContent = "Board is filled but not solved correctly yet.";
      window.mmensaPlay?.("error");
    }
    return solved;
  }

  statusEl.textContent = "No conflicts detected. Keep going.";
  window.mmensaPlay?.("tick");
  return true;
}

function revealSolution() {
  boardEl.querySelectorAll(".cell").forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    setCellDisplay(cell, String(solution[row][col]), false);
    cell.classList.remove("invalid");
  });
  stopTimer();
  updateMeta();
  clearSavedProgress();
  statusEl.textContent = "Solution revealed. Start a new puzzle for another round.";
}

function saveStatsOnWin() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY)) || { wins: 0, bestTimes: {}, plays: 0 };
  } catch {
    stats = { wins: 0, bestTimes: {}, plays: 0 };
  }

  const difficulty = difficultyEl.value;
  const currentBest = Number(stats.bestTimes[difficulty] || 0);
  stats.wins += 1;
  if (currentBest === 0 || elapsedSeconds < currentBest) {
    stats.bestTimes[difficulty] = elapsedSeconds;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function incrementPlayCount() {
  let stats;
  try {
    stats = JSON.parse(localStorage.getItem(STATS_KEY)) || { wins: 0, bestTimes: {}, plays: 0 };
  } catch {
    stats = { wins: 0, bestTimes: {}, plays: 0 };
  }

  stats.plays = Number(stats.plays || 0) + 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function clearSelectedCell() {
  if (!selectedCell || selectedCell.disabled) {
    statusEl.textContent = "Select an editable cell to clear it.";
    return;
  }

  setCellDisplay(selectedCell, "", false);
  updateMeta();
  saveProgress();
}

function saveProgress() {
  if (!puzzle.length || !solution.length) {
    return;
  }

  const inputs = Array.from(boardEl.querySelectorAll(".cell")).map((cell) => ({
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col),
    value: cell.dataset.value || "",
    notes: cell.classList.contains("notes")
  }));

  const payload = {
    difficulty: difficultyEl.value,
    puzzle,
    solution,
    inputs,
    elapsedSeconds,
    mistakes,
    notesMode
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearSavedProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function restoreSavedProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return false;
  }

  try {
    const state = JSON.parse(raw);
    if (!state.puzzle || !state.solution || !Array.isArray(state.inputs)) {
      return false;
    }

    difficultyEl.value = state.difficulty || "novice";
    puzzle = state.puzzle;
    solution = state.solution;
    elapsedSeconds = Number(state.elapsedSeconds || 0);
    mistakes = Number(state.mistakes || 0);
    notesMode = Boolean(state.notesMode);
    initialEmptyCells = puzzle.flat().filter((value) => value === 0).length;

    renderBoard();
    renderNumberPad();

    state.inputs.forEach((item) => {
      const cell = boardEl.querySelector(`.cell[data-row="${item.row}"][data-col="${item.col}"]`);
      if (!cell || cell.disabled) {
        return;
      }
      setCellDisplay(cell, item.value || "", Boolean(item.notes));
    });

    notesBtn.classList.toggle("active", notesMode);
    notesBtn.textContent = notesMode ? "Notes: On" : "Notes: Off";
    updateMeta();
    startTimer();
    statusEl.textContent = `Resumed ${difficultyEl.value} puzzle.`;
    return true;
  } catch {
    return false;
  }
}

function toggleNotesMode() {
  notesMode = !notesMode;
  notesBtn.classList.toggle("active", notesMode);
  notesBtn.textContent = notesMode ? "Notes: On" : "Notes: Off";
  statusEl.textContent = notesMode
    ? "Notes mode active. Select a cell and tap digits to add notes."
    : "Notes mode off. Select a cell and tap a digit to place it.";
  saveProgress();
}

function newGame() {
  const selectedDifficulty = difficultyEl.value;
  const clueCount = difficultyMap[selectedDifficulty] || difficultyMap.novice;
  solution = generateSolvedBoard();
  puzzle = generatePuzzle(solution, clueCount);
  elapsedSeconds = 0;
  mistakes = 0;
  notesMode = false;
  notesBtn.classList.remove("active");
  notesBtn.textContent = "Notes: Off";
  initialEmptyCells = puzzle.flat().filter((value) => value === 0).length;
  renderBoard();
  renderNumberPad();
  incrementPlayCount();
  updateMeta();
  startTimer();
  saveProgress();
  statusEl.textContent = `New ${selectedDifficulty} puzzle ready. Tap a cell, then tap a number.`;
}

newGameBtn.addEventListener("click", newGame);
notesBtn.addEventListener("click", toggleNotesMode);
checkBtn.addEventListener("click", validateCurrentBoard);
clearBtn.addEventListener("click", clearSelectedCell);
solveBtn.addEventListener("click", revealSolution);
difficultyEl.addEventListener("change", newGame);

if (!restoreSavedProgress()) {
  renderNumberPad();
  newGame();
}
