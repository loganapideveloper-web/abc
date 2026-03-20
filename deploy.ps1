# deploy.ps1 - Deploy all changes to GitHub + Vercel
# Usage:
#   .\deploy.ps1 "your commit message"
#   Set $env:GITHUB_TOKEN once per session to skip the token prompt.

param(
    [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "=== AMOHA Deploy Script ===" -ForegroundColor Cyan

# --- Commit message: param > prompt ---
if (-not $CommitMessage) {
    $CommitMessage = Read-Host "Enter commit message (leave blank to skip commit)"
}
$commitMsg = $CommitMessage

# --- Token: env var > prompt ---
$token = $env:GITHUB_TOKEN
if (-not $token) {
    $token = Read-Host "Enter whatapi00-max GitHub token (or set `$env:GITHUB_TOKEN to skip)"
}
if (-not $token) { Write-Host "Token is required." -ForegroundColor Red; exit 1 }

Set-Location $root

# --- Step 1: Commit & push to loganapideveloper-web/abc ---
if ($commitMsg) {
    Write-Host ""
    Write-Host "[1/4] Committing changes..." -ForegroundColor Yellow
    git add -A
    git commit -m $commitMsg
}

Write-Host ""
Write-Host "[2/4] Pushing to loganapideveloper-web/abc..." -ForegroundColor Yellow
git push origin main
Write-Host "Done." -ForegroundColor Green

# --- Step 2: Push frontend/ to whatapi00-max/frontend-demo-1 ---
Write-Host ""
Write-Host "[3/4] Pushing frontend to Vercel repo..." -ForegroundColor Yellow
git branch -D frontend-split 2>$null
git subtree split --prefix=frontend -b frontend-split | Out-Null
git push "https://whatapi00-max:$token@github.com/whatapi00-max/frontend-demo-1.git" frontend-split:main --force
git branch -D frontend-split | Out-Null
Write-Host "Frontend deployed." -ForegroundColor Green

# --- Step 3: Push admin/ to whatapi00-max/admin ---
Write-Host ""
Write-Host "[4/4] Pushing admin to Vercel repo..." -ForegroundColor Yellow
git branch -D admin-split 2>$null
git subtree split --prefix=admin -b admin-split | Out-Null
git push "https://whatapi00-max:$token@github.com/whatapi00-max/admin.git" admin-split:main --force
git branch -D admin-split | Out-Null
Write-Host "Admin deployed." -ForegroundColor Green

Write-Host ""
Write-Host "=== All done! Vercel will auto-deploy in ~2 minutes ===" -ForegroundColor Cyan
Write-Host "  Frontend: https://frontend-demo-1-ashy.vercel.app"
Write-Host "  Admin:    https://admin-olive-delta.vercel.app"
Write-Host ""
