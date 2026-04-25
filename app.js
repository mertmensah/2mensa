const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const modulesToggle = document.getElementById("modulesToggle");
const modulesMenu = document.getElementById("modulesMenu");
const audioToggle = document.getElementById("audioToggle");

const SIDEBAR_STORAGE_KEY = "mmensa-sidebar-collapsed";
const AUDIO_MUTE_KEY = "mmensa-audio-muted";
const PREFS_KEY = "mmensa-prefs";
const ACTIVITY_KEY = "mmensa-activity";

let mobileNavTrigger = null;
let navBackdrop = null;

function isMobileViewport() {
  return window.matchMedia("(max-width: 860px)").matches;
}

function getLocalDateStamp() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

function getPrevDateStamp(dateStamp) {
  const date = new Date(`${dateStamp}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA").format(date);
}

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {
      reducedMotion: false,
      highContrast: false,
      largeText: false
    };
  } catch {
    return { reducedMotion: false, highContrast: false, largeText: false };
  }
}

function applyPrefs() {
  const prefs = readPrefs();
  document.body.classList.toggle("reduced-motion", Boolean(prefs.reducedMotion));
  document.body.classList.toggle("high-contrast", Boolean(prefs.highContrast));
  document.body.classList.toggle("large-text", Boolean(prefs.largeText));
}

function updateActivityStreak() {
  const today = getLocalDateStamp();
  let activity;

  try {
    activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || {
      lastDate: "",
      streak: 0,
      maxStreak: 0
    };
  } catch {
    activity = { lastDate: "", streak: 0, maxStreak: 0 };
  }

  if (activity.lastDate !== today) {
    const isYesterday = activity.lastDate === getPrevDateStamp(today);
    activity.streak = isYesterday ? activity.streak + 1 : 1;
    activity.lastDate = today;
    activity.maxStreak = Math.max(activity.maxStreak || 0, activity.streak || 0);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  }

  return activity;
}

function getMutedState() {
  return localStorage.getItem(AUDIO_MUTE_KEY) === "true";
}

function setAudioIcon() {
  if (!audioToggle) {
    return;
  }

  const muted = getMutedState();
  audioToggle.textContent = muted ? "🔇" : "🔊";
  audioToggle.setAttribute("aria-pressed", String(!muted));
}

function setSidebarToggleState() {
  if (!toggleSidebar || !sidebar) {
    return;
  }

  if (isMobileViewport()) {
    toggleSidebar.textContent = "×";
    toggleSidebar.setAttribute("aria-label", "Close navigation");
    toggleSidebar.setAttribute("title", "Close navigation");
    return;
  }

  toggleSidebar.textContent = "◂";
  toggleSidebar.setAttribute("aria-label", "Navigation visible");
  toggleSidebar.setAttribute("title", "Navigation visible");
}

function ensureMobileNavChrome() {
  if (mobileNavTrigger || !sidebar) {
    return;
  }

  mobileNavTrigger = document.createElement("button");
  mobileNavTrigger.type = "button";
  mobileNavTrigger.className = "mobile-nav-trigger";
  mobileNavTrigger.setAttribute("aria-label", "Open navigation");
  mobileNavTrigger.setAttribute("title", "Open navigation");
  mobileNavTrigger.textContent = "☰";
  mobileNavTrigger.addEventListener("click", () => openMobileNav());

  navBackdrop = document.createElement("div");
  navBackdrop.className = "nav-backdrop";
  navBackdrop.addEventListener("click", () => closeMobileNav());

  document.body.appendChild(mobileNavTrigger);
  document.body.appendChild(navBackdrop);
}

function openMobileNav() {
  if (!sidebar || !isMobileViewport()) {
    return;
  }

  sidebar.classList.add("mobile-open");
  document.body.classList.add("nav-open");
}

function closeMobileNav() {
  if (!sidebar) {
    return;
  }

  sidebar.classList.remove("mobile-open");
  document.body.classList.remove("nav-open");
}

function syncNavigationMode() {
  if (!sidebar) {
    return;
  }

  ensureMobileNavChrome();
  sidebar.classList.remove("collapsed");

  if (!isMobileViewport()) {
    closeMobileNav();
  }

  setSidebarToggleState();
}

function playTone(frequency, duration = 0.08, type = "sine", gainValue = 0.035) {
  const AudioContextRef = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextRef || getMutedState()) {
    return;
  }

  const context = window.mmensaAudioContext || new AudioContextRef();
  window.mmensaAudioContext = context;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

window.mmensaPlay = (name) => {
  if (name === "success") {
    playTone(660, 0.08, "triangle");
    setTimeout(() => playTone(880, 0.1, "triangle"), 70);
  } else if (name === "error") {
    playTone(220, 0.14, "sawtooth", 0.03);
  } else if (name === "tick") {
    playTone(420, 0.04, "square", 0.02);
  }
};

window.mmensaReadPrefs = readPrefs;
window.mmensaApplyPrefs = applyPrefs;
window.mmensaSetPrefs = (nextPrefs) => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(nextPrefs));
  applyPrefs();
};
window.mmensaGetActivity = () => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || { streak: 0, maxStreak: 0, lastDate: "" };
  } catch {
    return { streak: 0, maxStreak: 0, lastDate: "" };
  }
};

applyPrefs();
updateActivityStreak();

if (toggleSidebar && sidebar) {
  sidebar.classList.remove("collapsed");
  localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
  setSidebarToggleState();

  toggleSidebar.addEventListener("click", () => {
    if (isMobileViewport()) {
      closeMobileNav();
    }
  });
}

if (modulesToggle && modulesMenu) {
  modulesToggle.addEventListener("click", () => {
    const isExpanded = modulesToggle.getAttribute("aria-expanded") === "true";
    modulesToggle.setAttribute("aria-expanded", String(!isExpanded));
    modulesToggle.textContent = !isExpanded ? "Modules ▸" : "Modules ▾";
    modulesMenu.classList.toggle("hidden");
  });
}

if (sidebar) {
  sidebar.querySelectorAll("a.menu-item, a.submenu-item").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileViewport()) {
        closeMobileNav();
      }
    });
  });
}

if (audioToggle) {
  setAudioIcon();
  audioToggle.addEventListener("click", () => {
    localStorage.setItem(AUDIO_MUTE_KEY, String(!getMutedState()));
    setAudioIcon();
  });
}

syncNavigationMode();
window.addEventListener("resize", syncNavigationMode);
