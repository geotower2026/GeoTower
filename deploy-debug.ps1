<#
deploy-debug.ps1

Uso: execute este script na raiz do repositório (onde está a pasta backend).
Ele fará: detectar branch atual, adicionar/commit do arquivo alterado, dar push
para o remote e (opcional) disparar um deploy na Render se as variáveis de
ambiente RENDER_API_KEY e RENDER_SERVICE_ID estiverem definidas.

Windows PowerShell (padrão):
PS> .\deploy-debug.ps1

Ou no cmd:
> powershell -ExecutionPolicy Bypass -File deploy-debug.ps1

Observação: revise a mensagem de commit antes de confirmar.
#>

# Caminho do arquivo modificado
$targetFile = 'backend/src/routes/admin.js'

function ExecGit($cmd) {
    Write-Host "git $cmd" -ForegroundColor Cyan
    & git $cmd
}

# Verifica se estamos num diretório git
if (-not (Test-Path .git)) {
    Write-Host "Erro: este script deve ser executado na raiz do repositório (onde existe a pasta .git)." -ForegroundColor Red
    exit 1
}

# Branch atual
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Branch atual: $branch" -ForegroundColor Green

# Verifica se há mudanças no arquivo alvo
$changes = git status --porcelain $targetFile
if (-not $changes) {
    Write-Host "Nenhuma alteração detectada em $targetFile. Nada a commitar." -ForegroundColor Yellow
    $doPush = Read-Host "Deseja apenas forçar deploy no Render mesmo assim? (s/n)"
    if ($doPush -ne 's' -and $doPush -ne 'S') { Write-Host 'Abortando.'; exit 0 }
} else {
    Write-Host "Alterações detectadas em $targetFile:" -ForegroundColor Yellow
    git status --porcelain $targetFile | ForEach-Object { Write-Host "  $_" }

    # Staging
    ExecGit "add $targetFile"

    # Commit
    $msg = Read-Host "Mensagem de commit (default: debug: log delivery.documents and return triedPaths on download 404 (temporary))"
    if (-not $msg) { $msg = 'debug: log delivery.documents and return triedPaths on download 404 (temporary)' }
    ExecGit "commit -m `"$msg`""
}

# Push
ExecGit "push origin $branch"

# Opcional: disparar deploy via Render API
$renderKey = $env:RENDER_API_KEY
$renderService = $env:RENDER_SERVICE_ID
if ($renderKey -and $renderService) {
    Write-Host "Disparando deploy na Render para service $renderService" -ForegroundColor Green
    $escapedKey = $renderKey
    $url = "https://api.render.com/v1/services/$renderService/deploys"
    $resp = & curl -s -X POST $url -H "Authorization: Bearer $escapedKey" -H "Content-Type: application/json" -d '{}' 
    Write-Host "Render API response:" -ForegroundColor Cyan
    Write-Host $resp
    Write-Host "Aguarde o deploy completar no painel do Render." -ForegroundColor Green
} else {
    Write-Host "Variáveis RENDER_API_KEY e/ou RENDER_SERVICE_ID não encontradas. Pulando disparo de deploy automático." -ForegroundColor Yellow
    Write-Host "Se quiser disparar um deploy manual via API, defina as variáveis de ambiente e rode o script novamente." -ForegroundColor Yellow
    Write-Host "Comando exemplo (PowerShell):`n$env:RENDER_API_KEY='YOUR_KEY'; $env:RENDER_SERVICE_ID='YOUR_SERVICE_ID'; .\\deploy-debug.ps1" -ForegroundColor Gray
}

Write-Host "Pronto. Verifique o painel do Render (Deploys/Logs) após o push." -ForegroundColor Green
