# PrimeRoseFarms Demo Users Creation Script
# This script creates demo users for testing the application

Write-Host "Creating Demo Users for PrimeRoseFarms..." -ForegroundColor Green

$baseUrl = "http://localhost:3000/api/v1/auth/register"

# Demo users data
$users = @(
    @{
        email = "admin@primerose.com"
        password = "demo1234"
        firstName = "Sarah"
        lastName = "Administrator"
        role = "admin"
        phoneNumber = "+1234567890"
        address = "123 Farm Admin Street"
    },
    @{
        email = "manager@primerose.com"
        password = "demo1234"
        firstName = "John"
        lastName = "Manager"
        role = "manager"
        phoneNumber = "+1234567891"
        address = "456 Management Avenue"
    },
    @{
        email = "agronomist@primerose.com"
        password = "demo1234"
        firstName = "Dr. Emily"
        lastName = "Greenfield"
        role = "agronomist"
        phoneNumber = "+1234567892"
        address = "789 Science Center Drive"
    },
    @{
        email = "farmer@primerose.com"
        password = "demo1234"
        firstName = "Michael"
        lastName = "Farmer"
        role = "farmer"
        phoneNumber = "+1234567893"
        address = "321 Field Operations Road"
    },
    @{
        email = "worker@primerose.com"
        password = "demo1234"
        firstName = "Maria"
        lastName = "Worker"
        role = "worker"
        phoneNumber = "+1234567894"
        address = "654 Worker Village Lane"
    },
    @{
        email = "hr@primerose.com"
        password = "demo1234"
        firstName = "David"
        lastName = "Human"
        role = "hr"
        phoneNumber = "+1234567895"
        address = "987 HR Department Building"
    },
    @{
        email = "sales@primerose.com"
        password = "demo1234"
        firstName = "Lisa"
        lastName = "Sales"
        role = "sales"
        phoneNumber = "+1234567896"
        address = "147 Sales Center Plaza"
    },
    @{
        email = "demo@primerose.com"
        password = "demo1234"
        firstName = "Demo"
        lastName = "Account"
        role = "demo"
        phoneNumber = "+1234567897"
        address = "258 Demo Testing Center"
    }
)

Write-Host "Checking if backend server is running..." -ForegroundColor Cyan

# Test if backend is accessible
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "Backend server is not accessible!" -ForegroundColor Red
    Write-Host "Please start the backend server first with: npm run dev" -ForegroundColor Yellow
    Write-Host "Or run: .\start-dev.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Creating demo users..." -ForegroundColor Cyan

$successCount = 0
$errorCount = 0

foreach ($user in $users) {
    try {
        $jsonBody = $user | ConvertTo-Json -Depth 3
        
        Write-Host "Creating: $($user.firstName) $($user.lastName) ($($user.role))" -ForegroundColor White
        
        $response = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $jsonBody -TimeoutSec 10
        
        if ($response.success) {
            Write-Host "$($user.email) - Success" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "$($user.email) - Error: $($response.message)" -ForegroundColor Red
            $errorCount++
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*already exists*" -or $errorMessage -like "*duplicate*") {
            Write-Host "$($user.email) - User already exists" -ForegroundColor Yellow
        } else {
            Write-Host "$($user.email) - Error: $errorMessage" -ForegroundColor Red
            $errorCount++
        }
    }
    
    # Small delay between requests
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Demo User Creation Results:" -ForegroundColor White
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Errors: $errorCount" -ForegroundColor Red
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "Demo users created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Yellow
    Write-Host "All demo users use password: demo1234" -ForegroundColor White
    Write-Host ""
    Write-Host "Available Demo Accounts:" -ForegroundColor Yellow
    foreach ($user in $users) {
        Write-Host "$($user.role): $($user.email)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Frontend URL: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "No new users were created. Check if users already exist or if there are connection issues." -ForegroundColor Yellow
}