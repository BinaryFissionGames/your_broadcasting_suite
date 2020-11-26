$BasePath = [System.IO.Path]::GetFullPath((Join-Path "$($PSScriptRoot)" '..'))
Write-Host "BasePath = $BasePath"
ksync create --local-read-only --reload=false --selector=app=YourBroadcastingSuiteAPIServer "$(Join-Path $BasePath 'backend\src-node')" /app/src-node
Start-Sleep -Seconds 15
ksync create --local-read-only --reload=false --selector=app=YourBroadcastingSuiteClientServer "$(Join-Path $BasePath 'frontend\src')" /app/src
Start-Sleep -Seconds 15
ksync create --local-read-only --reload=false --selector=app=YourBroadcastingSuiteAPIServer "$(Join-Path $BasePath 'shared\src')" /shared/src
Start-Sleep -Seconds 15
ksync create --local-read-only --reload=false --selector=app=YourBroadcastingSuiteClientServer "$(Join-Path $BasePath 'shared\src')" /shared/src
Write-Host "Created specs for frontend, backend, and shared source folders."