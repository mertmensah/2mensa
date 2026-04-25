const reducedMotionEl = document.getElementById("prefReducedMotion");
const highContrastEl = document.getElementById("prefHighContrast");
const largeTextEl = document.getElementById("prefLargeText");
const saveBtn = document.getElementById("savePrefsBtn");
const resetStatsBtn = document.getElementById("resetStatsBtn");
const statusEl = document.getElementById("settingsStatus");

function loadPrefs() {
  const prefs = window.mmensaReadPrefs?.() || {
    reducedMotion: false,
    highContrast: false,
    largeText: false
  };

  reducedMotionEl.checked = Boolean(prefs.reducedMotion);
  highContrastEl.checked = Boolean(prefs.highContrast);
  largeTextEl.checked = Boolean(prefs.largeText);
}

function savePrefs() {
  const nextPrefs = {
    reducedMotion: reducedMotionEl.checked,
    highContrast: highContrastEl.checked,
    largeText: largeTextEl.checked
  };

  window.mmensaSetPrefs?.(nextPrefs);
  statusEl.textContent = "Preferences saved.";
  window.mmensaPlay?.("success");
}

function resetStats() {
  const keys = [
    "mmensa-sudoku-stats",
    "mmensa-trivia-stats",
    "mmensa-logic-grid-stats",
    "mmensa-sequence-stats",
    "mmensa-raven-stats",
    "mmensa-spatial-stats",
    "mmensa-activity"
  ];

  keys.forEach((key) => localStorage.removeItem(key));
  statusEl.textContent = "Game stats reset.";
  window.mmensaPlay?.("tick");
}

saveBtn.addEventListener("click", savePrefs);
resetStatsBtn.addEventListener("click", resetStats);

loadPrefs();
