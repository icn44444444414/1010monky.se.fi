@echo off
REM ── Run the 1010monky.se.fi binary-monkey prototype locally ──
REM Double-click this file. When it prints a "Local: http://localhost:5173/"
REM line, open that URL in your browser. Close this window to stop the server.
cd /d "%~dp0"

set "NODE=C:\Users\matia\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.18.0-win-x64\node.exe"

echo.
echo Starting the binary-monkey dev server...
echo Open the http://localhost:5173/ URL shown below in your browser.
echo (Close this window to stop.)
echo.

"%NODE%" "node_modules\vite\bin\vite.js" --host
pause
