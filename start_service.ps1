$port = 3000
$connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $connection) {
    Start-Process node -ArgumentList "server.js" -WorkingDirectory "C:\Users\kc.chen\agent-office-dashboard" -WindowStyle Hidden
}
