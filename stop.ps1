# PartnerHub 一键停止脚本
Write-Host ""
Write-Host "Stopping all PartnerHub services..." -ForegroundColor Yellow

Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "  Node.js (Frontend + Backend) stopped" -ForegroundColor Green

$pgBin = "$PSScriptRoot\.postgres\pgsql\bin"
if (Get-Process -Name postgres -ErrorAction SilentlyContinue) {
    Push-Location $pgBin
    cmd /c "pg_ctl.exe stop -D `"$PSScriptRoot\.postgres\data`""
    Pop-Location
    Write-Host "  PostgreSQL stopped" -ForegroundColor Green
} else {
    Write-Host "  PostgreSQL was not running" -ForegroundColor DarkGray
}

Remove-Item -Force "$PSScriptRoot\frontend\.next\dev\lock" -ErrorAction SilentlyContinue
Write-Host ""
Write-Host "All services stopped." -ForegroundColor Cyan
