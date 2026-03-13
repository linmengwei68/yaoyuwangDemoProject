# PartnerHub 一键启动脚本
# 使用方法：在 PartnerHub 根目录打开 PowerShell，运行 .\start.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PartnerHub - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pgBin = "$PSScriptRoot\.postgres\pgsql\bin"
$pgData = "$PSScriptRoot\.postgres\data"
$pgLog = "$PSScriptRoot\.postgres\pg.log"

# 1. 启动 PostgreSQL
Write-Host "[1/3] Starting PostgreSQL..." -ForegroundColor Yellow
$pgStatus = & "$pgBin\pg_ctl.exe" -D $pgData status 2>&1
if ($pgStatus -match "server is running") {
    Write-Host "  PostgreSQL already running" -ForegroundColor Green
} else {
    & "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog start 2>&1 | Out-Null
    Write-Host "  PostgreSQL started on port 5432" -ForegroundColor Green
}

# 2. 启动后端
Write-Host "[2/3] Starting Backend (Nest.js)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$PSScriptRoot\backend`" && npm run start:dev" -PassThru | Out-Null
Write-Host "  Backend starting on http://localhost:3001" -ForegroundColor Green

# 3. 启动前端
Write-Host "[3/3] Starting Frontend (Next.js)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$PSScriptRoot\frontend`" && npm run dev" -PassThru | Out-Null
Write-Host "  Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services started!" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "  Health:    http://localhost:3001/api/health" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor DarkGray

# 等待用户按 Ctrl+C
try { while ($true) { Start-Sleep -Seconds 60 } }
finally {
    Write-Host "`nStopping PostgreSQL..." -ForegroundColor Yellow
    & "$pgBin\pg_ctl.exe" -D $pgData stop 2>&1 | Out-Null
    Write-Host "All services stopped." -ForegroundColor Green
}
