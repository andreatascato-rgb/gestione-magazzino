# Script per liberare le porte 3000 e 3001

Write-Host "🔍 Cercando processi sulle porte 3000 e 3001..." -ForegroundColor Yellow

# Funzione per trovare e terminare processi su una porta
function Kill-Port {
    param([int]$Port)
    
    $connections = netstat -ano | findstr ":$Port"
    
    if ($connections) {
        $pids = $connections | ForEach-Object {
            $parts = $_ -split '\s+'
            if ($parts.Length -gt 4) {
                $parts[-1]
            }
        } | Where-Object { $_ -ne '0' } | Select-Object -Unique
        
        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  ⚠️  Terminando processo $pid ($($process.ProcessName)) sulla porta $Port" -ForegroundColor Red
                    taskkill /PID $pid /F | Out-Null
                    Start-Sleep -Milliseconds 500
                }
            } catch {
                # Processo già terminato o non accessibile
            }
        }
    } else {
        Write-Host "  ✅ Porta $Port già libera" -ForegroundColor Green
    }
}

# Libera le porte
Kill-Port -Port 3000
Kill-Port -Port 3001

Write-Host "✅ Porte liberate!" -ForegroundColor Green
Start-Sleep -Seconds 1

