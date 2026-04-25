@echo off
setlocal

echo Stopping 2mensa local server...
taskkill /FI "WINDOWTITLE eq 2MENSA_SERVER*" /T /F >nul 2>nul

if %errorlevel%==0 (
  echo Server stopped.
) else (
  echo No running 2mensa server window was found.
)

timeout /t 1 /nobreak >nul
exit /b 0
