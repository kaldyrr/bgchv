$ErrorActionPreference = 'SilentlyContinue'

# Kill listeners on common dev ports
$ports = 3030,3000,5173
$cons = Get-NetTCPConnection -State Listen | Where-Object { $ports -contains $_.LocalPort }
if ($cons) {
  $pids = $cons | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) { try { Stop-Process -Id ([int]$pid) -Force } catch {} }
}

# Ensure Prisma client is generated
Push-Location apps/server
try { npx.cmd prisma generate | Out-Null } catch {}
Pop-Location

# Start backend on 3030
Start-Process -FilePath cmd.exe -ArgumentList '/c','set PORT=3030&&npm run dev' -WorkingDirectory 'apps/server'

# Start web dev on 5173
Start-Process -FilePath cmd.exe -ArgumentList '/c','npm run dev' -WorkingDirectory 'apps/web'

Start-Sleep -Seconds 4
try { (Invoke-WebRequest -UseBasicParsing http://localhost:3030/healthz).Content | Write-Output } catch {}
try { (Invoke-WebRequest -UseBasicParsing http://localhost:5173).StatusCode | Write-Output } catch {}

Write-Output "Started backend on 3030 and web on 5173."

