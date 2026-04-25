# 2mensa

2mensa is a GitHub Pages-ready frontend for brain teaser games.

## Current Modules

- Sudoku:
  - Four levels: Novice, Medium, Hard, Mensa
  - Unique-solution puzzle generation
  - Notes mode, timer, mistakes, completion tracking
  - Keyboard navigation and auto save/resume
- Speed Trivia:
  - 60-second rounds
  - Mixed category questions
  - Score tracking per round
- Logic Grid:
  - Multi-difficulty clue-based deduction puzzles
  - Rotating puzzle sets per difficulty
  - Constraint and uniqueness validation
  - Solve and play tracking
- Sequence Sprint:
  - Multi-difficulty numeric pattern rounds
  - Timed 8-question sessions
  - Best score and streak tracking
- Raven Matrix:
  - Multi-difficulty visual matrix reasoning rounds
  - Timed 8-question sessions
  - Best score and streak tracking
- Spatial Rotation Drill:
  - Multi-difficulty rotation matching rounds
  - Click-only visual choice gameplay
  - Best score and streak tracking

## Platform Features

- Landing dashboard with persistent cross-module stats
- Achievement chips and daily streak tracking
- Expandable left navigation
- Optional sound feedback toggle
- Dedicated settings page for accessibility preferences
- Mobile-friendly controls and focus visibility improvements

## Roadmap Inventory

- See `MENSA_GAME_INVENTORY.md` for missing mensa-style game categories and build priority.

## Local Preview

Open `index.html` directly in a browser, or use a static server.

No-terminal option (Windows):

1. Double-click `LAUNCH_2MENSA.bat`
2. Your browser will open automatically at `http://localhost:5500`
3. When finished, double-click `STOP_2MENSA.bat`

PowerShell quick start:

```powershell
Set-Location mmensa
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Deploy To GitHub Pages

This repository includes an automatic deployment workflow:

- `.github/workflows/mmensa-pages.yml`
- `DEPLOY_MVP.md`

Steps:

1. Push to `main`.
2. In GitHub, open **Settings > Pages**.
3. Set source to `GitHub Actions`.
4. The workflow deploys the `mmensa` directory to Pages.

Your site will be available at:

`https://<your-username>.github.io/<your-repo>/`
