@echo off
echo Stopping PrimeRoseFarms Development Environment...

echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im nodemon.exe >nul 2>&1

echo Stopping processes on development ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Development Environment Stopped!
echo All Node.js and development processes have been terminated.
echo.
echo To restart: start-simple.cmd or start-dev.ps1

pause
