const statusEl = document.getElementById("logicStatus");
const checkBtn = document.getElementById("checkLogicBtn");
const resetBtn = document.getElementById("resetLogicBtn");
const newBtn = document.getElementById("newLogicBtn");
const difficultyEl = document.getElementById("logicDifficulty");
const clueListEl = document.getElementById("clueList");
const logicTableEl = document.getElementById("logicTable");

const LOGIC_STATS_KEY = "mmensa-logic-grid-stats";

const puzzleBank = {
  novice: [
    {
      persons: ["Ada", "Ben", "Cora"],
      categories: [
        { key: "drink", label: "Drink", options: ["Tea", "Coffee", "Juice"] },
        { key: "pet", label: "Pet", options: ["Cat", "Dog", "Bird"] }
      ],
      clues: [
        "Ada does not drink coffee.",
        "The dog owner drinks tea.",
        "Ben owns the bird.",
        "Cora does not own the cat.",
        "The juice drinker owns the cat."
      ],
      solution: {
        Ada: { drink: "Juice", pet: "Cat" },
        Ben: { drink: "Coffee", pet: "Bird" },
        Cora: { drink: "Tea", pet: "Dog" }
      }
    },
    {
      persons: ["Lia", "Mert", "Nora"],
      categories: [
        { key: "snack", label: "Snack", options: ["Nuts", "Fruit", "Chips"] },
        { key: "tool", label: "Tool", options: ["Pen", "Tablet", "Notebook"] }
      ],
      clues: [
        "Mert does not use the pen.",
        "The chips fan uses the notebook.",
        "Lia uses the tablet.",
        "Nora does not pick fruit.",
        "The nuts fan uses the pen."
      ],
      solution: {
        Lia: { snack: "Fruit", tool: "Tablet" },
        Mert: { snack: "Chips", tool: "Notebook" },
        Nora: { snack: "Nuts", tool: "Pen" }
      }
    }
  ],
  medium: [
    {
      persons: ["Ari", "Bex", "Cem", "Dina"],
      categories: [
        { key: "city", label: "City", options: ["Oslo", "Lima", "Seoul", "Riga"] },
        { key: "color", label: "Color", options: ["Red", "Blue", "Green", "Gold"] }
      ],
      clues: [
        "Ari is not linked to Oslo.",
        "The person tied to Lima prefers Blue.",
        "Cem is tied to Green.",
        "Dina is not tied to Gold.",
        "The Riga person prefers Red.",
        "Bex is tied to Seoul."
      ],
      solution: {
        Ari: { city: "Riga", color: "Red" },
        Bex: { city: "Seoul", color: "Gold" },
        Cem: { city: "Oslo", color: "Green" },
        Dina: { city: "Lima", color: "Blue" }
      }
    },
    {
      persons: ["Eli", "Fia", "Gus", "Hale"],
      categories: [
        { key: "sport", label: "Sport", options: ["Tennis", "Chess", "Swim", "Run"] },
        { key: "day", label: "Day", options: ["Mon", "Tue", "Wed", "Thu"] }
      ],
      clues: [
        "Eli is not on Thursday.",
        "The swimmer is on Tuesday.",
        "Gus does chess.",
        "Hale is not on Monday.",
        "The runner is on Thursday.",
        "Fia is on Wednesday."
      ],
      solution: {
        Eli: { sport: "Tennis", day: "Mon" },
        Fia: { sport: "Chess", day: "Wed" },
        Gus: { sport: "Swim", day: "Tue" },
        Hale: { sport: "Run", day: "Thu" }
      }
    }
  ],
  hard: [
    {
      persons: ["Ira", "Jin", "Kora", "Lem"],
      categories: [
        { key: "role", label: "Role", options: ["Pilot", "Coder", "Analyst", "Designer"] },
        { key: "desk", label: "Desk", options: ["North", "South", "East", "West"] }
      ],
      clues: [
        "Ira is not the pilot.",
        "The coder sits at East.",
        "Jin sits at West.",
        "Kora is the analyst.",
        "The South desk belongs to the designer.",
        "Lem is not at North."
      ],
      solution: {
        Ira: { role: "Designer", desk: "South" },
        Jin: { role: "Pilot", desk: "West" },
        Kora: { role: "Analyst", desk: "North" },
        Lem: { role: "Coder", desk: "East" }
      }
    },
    {
      persons: ["Mia", "Noel", "Ozan", "Pia"],
      categories: [
        { key: "book", label: "Book", options: ["Atlas", "Dune", "Odyssey", "Hamlet"] },
        { key: "seat", label: "Seat", options: ["A1", "A2", "B1", "B2"] }
      ],
      clues: [
        "Mia is not in seat A1.",
        "The Atlas reader sits in B2.",
        "Noel reads Hamlet.",
        "Pia is in seat A2.",
        "The Odyssey reader sits in A1.",
        "Ozan does not read Dune."
      ],
      solution: {
        Mia: { book: "Dune", seat: "B1" },
        Noel: { book: "Hamlet", seat: "A1" },
        Ozan: { book: "Atlas", seat: "B2" },
        Pia: { book: "Odyssey", seat: "A2" }
      }
    }
  ],
  mensa: [
    {
      persons: ["Quin", "Rae", "Sven", "Tara"],
      categories: [
        { key: "code", label: "Code", options: ["Aquila", "Boreal", "Cypher", "Delta"] },
        { key: "time", label: "Time", options: ["09:00", "10:00", "11:00", "12:00"] }
      ],
      clues: [
        "Quin is not at 09:00.",
        "Boreal is scheduled at 10:00.",
        "Sven is assigned to Cypher.",
        "Tara is not at 12:00.",
        "Aquila is scheduled at 11:00.",
        "Rae is assigned to Delta."
      ],
      solution: {
        Quin: { code: "Aquila", time: "11:00" },
        Rae: { code: "Delta", time: "09:00" },
        Sven: { code: "Cypher", time: "12:00" },
        Tara: { code: "Boreal", time: "10:00" }
      }
    },
    {
      persons: ["Uma", "Vik", "Wren", "Yara"],
      categories: [
        { key: "project", label: "Project", options: ["Ion", "Nova", "Pulse", "Zen"] },
        { key: "zone", label: "Zone", options: ["North", "South", "East", "West"] }
      ],
      clues: [
        "Uma is not in West.",
        "The Nova project is in East.",
        "Wren is in North.",
        "Yara is not on Pulse.",
        "The Ion project is in South.",
        "Vik leads Zen."
      ],
      solution: {
        Uma: { project: "Pulse", zone: "West" },
        Vik: { project: "Zen", zone: "North" },
        Wren: { project: "Ion", zone: "South" },
        Yara: { project: "Nova", zone: "East" }
      }
    }
  ]
};

let currentPuzzle = null;
let currentDifficulty = "novice";

function readStats() {
  try {
    return JSON.parse(localStorage.getItem(LOGIC_STATS_KEY)) || {
      wins: 0,
      plays: 0,
      solvedByDifficulty: {}
    };
  } catch {
    return { wins: 0, plays: 0, solvedByDifficulty: {} };
  }
}

function writeStats(stats) {
  localStorage.setItem(LOGIC_STATS_KEY, JSON.stringify(stats));
}

function buildSelect(person, category) {
  const select = document.createElement("select");
  select.dataset.person = person;
  select.dataset.kind = category.key;
  select.setAttribute("aria-label", `${person} ${category.label}`);

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Choose";
  select.appendChild(empty);

  category.options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    select.classList.remove("invalid");
    statusEl.textContent = "Good. Keep narrowing combinations.";
    window.mmensaPlay?.("tick");
  });

  return select;
}

function renderPuzzle() {
  clueListEl.innerHTML = "";
  logicTableEl.innerHTML = "";

  currentPuzzle.clues.forEach((clue) => {
    const item = document.createElement("li");
    item.textContent = clue;
    clueListEl.appendChild(item);
  });

  const header = document.createElement("div");
  header.className = "logic-header";
  header.setAttribute("role", "row");

  const personHead = document.createElement("span");
  personHead.textContent = "Person";
  personHead.setAttribute("role", "columnheader");
  header.appendChild(personHead);

  currentPuzzle.categories.forEach((category) => {
    const col = document.createElement("span");
    col.textContent = category.label;
    col.setAttribute("role", "columnheader");
    header.appendChild(col);
  });

  logicTableEl.appendChild(header);

  currentPuzzle.persons.forEach((person) => {
    const row = document.createElement("div");
    row.className = "logic-row";
    row.setAttribute("role", "row");

    const label = document.createElement("span");
    label.textContent = person;
    label.setAttribute("role", "rowheader");
    row.appendChild(label);

    currentPuzzle.categories.forEach((category) => {
      row.appendChild(buildSelect(person, category));
    });

    logicTableEl.appendChild(row);
  });

  statusEl.textContent = `New ${currentDifficulty} puzzle loaded.`;
}

function getSelects() {
  return Array.from(logicTableEl.querySelectorAll("select[data-person]"));
}

function readAssignments() {
  const table = {};
  currentPuzzle.persons.forEach((person) => {
    table[person] = {};
  });

  getSelects().forEach((select) => {
    const person = select.dataset.person;
    const kind = select.dataset.kind;
    table[person][kind] = select.value;
  });

  return table;
}

function markInvalidState(invalid) {
  getSelects().forEach((select) => {
    select.classList.toggle("invalid", invalid);
  });
}

function isAllFilled(assignments) {
  return currentPuzzle.persons.every((person) => {
    return currentPuzzle.categories.every((category) => Boolean(assignments[person][category.key]));
  });
}

function isUniqueByCategory(assignments, categoryKey) {
  const values = currentPuzzle.persons.map((person) => assignments[person][categoryKey]);
  return new Set(values).size === values.length;
}

function updateStatsOnWin() {
  const stats = readStats();
  stats.wins += 1;
  stats.solvedByDifficulty[currentDifficulty] = Number(stats.solvedByDifficulty[currentDifficulty] || 0) + 1;
  writeStats(stats);
}

function updateStatsOnPlay() {
  const stats = readStats();
  stats.plays += 1;
  writeStats(stats);
}

function checkSolution() {
  const assignments = readAssignments();

  if (!isAllFilled(assignments)) {
    markInvalidState(true);
    statusEl.textContent = "Complete every selection before checking.";
    window.mmensaPlay?.("error");
    return;
  }

  for (const category of currentPuzzle.categories) {
    if (!isUniqueByCategory(assignments, category.key)) {
      markInvalidState(true);
      statusEl.textContent = `Each ${category.label.toLowerCase()} can only be used once.`;
      window.mmensaPlay?.("error");
      return;
    }
  }

  const solved = currentPuzzle.persons.every((person) => {
    return currentPuzzle.categories.every((category) => {
      return assignments[person][category.key] === currentPuzzle.solution[person][category.key];
    });
  });

  if (solved) {
    markInvalidState(false);
    updateStatsOnWin();
    statusEl.textContent = "Solved. Every clue is satisfied.";
    window.mmensaPlay?.("success");
  } else {
    markInvalidState(true);
    statusEl.textContent = "Not solved yet. Re-check the clue interactions.";
    window.mmensaPlay?.("error");
  }
}

function resetBoard() {
  getSelects().forEach((select) => {
    select.value = "";
    select.classList.remove("invalid");
  });
  statusEl.textContent = "Board reset. Start deduction from the clues.";
}

function randomPuzzleForDifficulty(difficulty) {
  const pool = puzzleBank[difficulty] || puzzleBank.novice;
  return pool[Math.floor(Math.random() * pool.length)];
}

function newPuzzle() {
  currentDifficulty = difficultyEl.value;
  currentPuzzle = randomPuzzleForDifficulty(currentDifficulty);
  renderPuzzle();
  updateStatsOnPlay();
}

checkBtn.addEventListener("click", checkSolution);
resetBtn.addEventListener("click", resetBoard);
newBtn.addEventListener("click", newPuzzle);
difficultyEl.addEventListener("change", newPuzzle);

newPuzzle();
