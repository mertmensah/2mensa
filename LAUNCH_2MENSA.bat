@echo off
setlocal

set "PORT=5500"
set "ROOT=%~dp0"
set "PYTHON_CMD="

where py >nul 2>nul
if %errorlevel%==0 (
  set "PYTHON_CMD=py"
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    set "PYTHON_CMD=python"
  )
)

if "%PYTHON_CMD%"=="" (
  echo Python is not installed or not available on PATH.
  echo.
  echo Install Python from https://www.python.org/downloads/
  echo Then run this launcher again.
  pause
  exit /b 1
)

echo Starting 2mensa local server on http://localhost:%PORT% ...
start "2MENSA_SERVER" /D "%ROOT%" cmd /k "%PYTHON_CMD% -m http.server %PORT%"

timeout /t 2 /nobreak >nul
start "" "http://localhost:%PORT%/"

echo.
 echo 2mensa is launching in your browser.
 echo Keep the server window open while playing.
 echo Use STOP_2MENSA.bat to stop the server.
 timeout /t 2 /nobreak >nul
exit /b 0
