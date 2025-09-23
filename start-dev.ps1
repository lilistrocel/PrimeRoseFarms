# PrimeRoseFarms Development Startup Script
# This script starts both backend and frontend in parallel

Write-Host "Starting PrimeRoseFarms Development Environment..." -ForegroundColor Green

# Check if .env file exists for backend
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "Environment file created. Please review and update if needed." -ForegroundColor Green
}

# Start backend server in background
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
$currentPath = (Get-Location).Path
Start-Process PowerShell -ArgumentList "-Command", "Set-Location '$currentPath'; npm run dev" -WindowStyle Normal

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start frontend in background
Write-Host "Starting Frontend Development Server..." -ForegroundColor Cyan
$clientPath = Join-Path $currentPath "client"
Start-Process PowerShell -ArgumentList "-Command", "Set-Location '$clientPath'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Development Environment Started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services Information:" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Frontend App: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "MongoDB Status:" -ForegroundColor White
Write-Host "   Database:     mongodb://localhost:27017/primerosefarms" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor White
Write-Host "   Create Demo Users: .\scripts\create-demo-users.ps1" -ForegroundColor Magenta
Write-Host "   Stop All Services: .\stop-dev.ps1" -ForegroundColor Magenta
Write-Host ""
Write-Host "Tip: Use Ctrl+C in the individual PowerShell windows to stop services" -ForegroundColor Gray
Write-Host "     or run .\stop-dev.ps1 to stop all services at once" -ForegroundColor Gray