# PartnerHub 一键启动脚本
# 使用方法：在 PartnerHub 根目录打开 PowerShell，运行 .\start.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PartnerHub - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 启动 PostgreSQL
Write-Host "[1/3] Starting PostgreSQL..." -ForegroundColor Yellow
if (Get-Process -Name postgres -ErrorAction SilentlyContinue) {
    Write-Host "  PostgreSQL already running" -ForegroundColor Green
} else {
    Push-Location "$PSScriptRoot\.postgres\pgsql\bin"
    cmd /c "pg_ctl.exe start -D `"$PSScriptRoot\.postgres\data`" -l `"$PSScriptRoot\.postgres\pg.log`""
    Pop-Location
    Start-Sleep -Seconds 2
    Write-Host "  PostgreSQL started on port 5432" -ForegroundColor Green
}

# 2. 启动后端（热重载模式）
Write-Host "[2/3] Starting Backend (Nest.js)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c cd /d `"$PSScriptRoot\backend`" && npm run start:dev" -WindowStyle Hidden
Write-Host "  Backend starting on http://localhost:3001" -ForegroundColor Green

# 3. 启动前端（热重载模式）
Write-Host "[3/3] Starting Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c cd /d `"$PSScriptRoot\frontend`" && npm run dev" -WindowStyle Hidden
Write-Host "  Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "  Health:    http://localhost:3001/api/health" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
