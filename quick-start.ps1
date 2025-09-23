# PrimeRoseFarms Quick Start Script
# This script sets up and starts the complete development environment

Write-Host "PrimeRoseFarms Quick Start Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($CommandName)
    $command = Get-Command $CommandName -ErrorAction SilentlyContinue
    return $command -ne $null
}

# Function to check if MongoDB is running
function Test-MongoDB {
    try {
        $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
        return $mongoProcess -ne $null
    } catch {
        return $false
    }
}

Write-Host "Checking system requirements..." -ForegroundColor Cyan

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "npm is not available!" -ForegroundColor Red
    exit 1
}

# Check MongoDB
if (Test-MongoDB) {
    Write-Host "MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "MongoDB is not running" -ForegroundColor Yellow
    Write-Host "Please start MongoDB or use Docker:" -ForegroundColor Yellow
    Write-Host "docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor White
try {
    npm install --silent
    Write-Host "Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Check if client directory exists and install frontend dependencies
if (Test-Path "client") {
    Write-Host "Installing frontend dependencies..." -ForegroundColor White
    try {
        Set-Location "client"
        npm install --silent
        Set-Location ".."
        Write-Host "Frontend dependencies installed" -ForegroundColor Green
    } catch {
        Set-Location ".."
        Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Frontend client directory not found" -ForegroundColor Yellow
    Write-Host "Only backend will be started" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting up environment..." -ForegroundColor Cyan

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor White
    Copy-Item "env.example" ".env"
    Write-Host "Environment file created" -ForegroundColor Green
} else {
    Write-Host "Environment file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Cyan

# Start the development environment
& ".\start-dev.ps1"

Write-Host ""
Write-Host "Waiting for servers to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Creating demo users..." -ForegroundColor Cyan
& ".\scripts\create-demo-users.ps1"

Write-Host ""
Write-Host "Quick Start Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is ready:" -ForegroundColor White
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Login Credentials:" -ForegroundColor White
Write-Host "Email: admin@primerose.com" -ForegroundColor Yellow
Write-Host "Password: demo123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor White
Write-Host "Stop servers:     .\stop-dev.ps1" -ForegroundColor Magenta
Write-Host "Restart servers:  .\start-dev.ps1" -ForegroundColor Magenta
Write-Host "Create more users: .\scripts\create-demo-users.ps1" -ForegroundColor Magenta
Write-Host ""
Write-Host "Happy farming!" -ForegroundColor Green