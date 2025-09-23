# PrimeRoseFarms Development Stop Script
# This script stops both backend and frontend processes

Write-Host "Stopping PrimeRoseFarms Development Environment..." -ForegroundColor Red

# Function to kill processes by name
function Stop-ProcessByName {
    param($ProcessName)
    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($processes) {
            $processes | Stop-Process -Force
            Write-Host "Stopped $ProcessName processes" -ForegroundColor Green
        } else {
            Write-Host "No $ProcessName processes found" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Error stopping $ProcessName processes: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Stop Node.js processes (backend and frontend)
Write-Host "Stopping Node.js processes..." -ForegroundColor Cyan
Stop-ProcessByName "node"

# Stop nodemon processes
Write-Host "Stopping nodemon processes..." -ForegroundColor Cyan
Stop-ProcessByName "nodemon"

# Stop any ts-node processes
Write-Host "Stopping ts-node processes..." -ForegroundColor Cyan
Stop-ProcessByName "ts-node"

# Alternative method - kill processes on specific ports
Write-Host "Checking for processes on development ports..." -ForegroundColor Cyan

try {
    # Kill process on port 3000 (backend)
    $port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
    if ($port3000) {
        $pid = ($port3000 -split '\s+')[-1]
        taskkill /PID $pid /F 2>$null
        Write-Host "Stopped process on port 3000 (Backend)" -ForegroundColor Green
    }
} catch {
    Write-Host "No process found on port 3000" -ForegroundColor Gray
}

try {
    # Kill process on port 3001 (frontend)
    $port3001 = netstat -ano | findstr ":3001" | findstr "LISTENING"
    if ($port3001) {
        $pid = ($port3001 -split '\s+')[-1]
        taskkill /PID $pid /F 2>$null
        Write-Host "Stopped process on port 3001 (Frontend)" -ForegroundColor Green
    }
} catch {
    Write-Host "No process found on port 3001" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Development Environment Stopped!" -ForegroundColor Red
Write-Host "All Node.js and development processes have been terminated." -ForegroundColor Gray
Write-Host ""
Write-Host "To restart: .\start-dev.ps1" -ForegroundColor Yellow