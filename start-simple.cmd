@echo off
echo Starting PrimeRoseFarms Development Environment...

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy "env.example" ".env"
    echo Environment file created.
)

echo.
echo Starting Backend Server in new window...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server in new window...
start "Frontend Server" cmd /k "cd client && npm start"

echo.
echo Development Environment Started!
echo.
echo Services Information:
echo    Backend API:  http://localhost:3000
echo    Frontend App: http://localhost:3001
echo.
echo MongoDB Status:
echo    Database:     mongodb://localhost:27017/primerosefarms
echo.
echo Useful Commands:
echo    Create Demo Users: scripts\create-demo-users.ps1
echo    Stop All Services: stop-dev.ps1
echo.
echo Tip: Close the individual command windows to stop services
echo      or run stop-dev.ps1 to stop all services at once

pause
