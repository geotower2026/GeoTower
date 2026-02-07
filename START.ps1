Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   🚀 INICIANDO DELIVERY DOCS APP" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Matar qualquer processo node anterior
Write-Host "🔄 Limpando processos anteriores..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

Write-Host "✅ Processos antigos finalizados" -ForegroundColor Green
Write-Host ""

# Iniciar backend
Write-Host "🔵 Iniciando BACKEND na porta 5000..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "🎨 Iniciando FRONTEND na porta 3000..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ TUDO INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Endereços:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🔌 Backend:   http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "   📊 Health:    http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Credenciais de teste:" -ForegroundColor Yellow
Write-Host "   Motorista: motorista@example.com / senha123" -ForegroundColor Gray
Write-Host "   Admin:     admin@example.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Feche estas janelas para parar a aplicação!" -ForegroundColor Yellow
Write-Host ""
