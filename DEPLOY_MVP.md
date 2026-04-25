# Deploy 2mensa MVP

## Current Status

The app is ready for GitHub Pages deployment as a static site.

Included already:
- `mmensa/.nojekyll`
- `.github/workflows/mmensa-pages.yml`
- local launcher scripts for testing

## What is blocking direct deployment right now

This workspace is not currently a Git repository, and no GitHub remote is configured.
GitHub Pages deployment requires the project to live in a GitHub repository.

## Fastest path to publish

### Option 1: Make `mmensa` its own repository

1. Create a new GitHub repository named `2mensa`.
2. Upload the full contents of the `mmensa` folder into that repository root.
3. Also copy `.github/workflows/mmensa-pages.yml` into that repository under `.github/workflows/`.
4. In GitHub, open `Settings > Pages`.
5. Set source to `GitHub Actions`.
6. Push to `main` and GitHub will publish automatically.

### Option 2: Keep it inside a larger repo

1. Put the full `mmensa` folder in the repository root.
2. Put `.github/workflows/mmensa-pages.yml` in `.github/workflows/`.
3. Push to `main`.
4. In GitHub Pages settings, choose `GitHub Actions`.
5. The workflow will deploy `./mmensa`.

## MVP Contents

Live modules:
- Sudoku
- Speed Trivia
- Logic Grid
- Sequence Sprint
- Raven Matrix
- Spatial Rotation Drill

Other included pages:
- Home dashboard
- Settings page
- Click-only interaction model audit
- Mensa roadmap inventory

## Local Test

Double-click:
- `LAUNCH_2MENSA.bat`

Then stop with:
- `STOP_2MENSA.bat`
