param(
  [string]$FilePath = "C:\ITE109\learning-code-app\android\app\build\outputs\apk\release\app-release.apk",
  [int]$Port = 8000
)

if (-not (Test-Path $FilePath)) {
  Write-Error "File not found: $FilePath"
  exit 1
}

$folder = Split-Path $FilePath -Parent
$filename = Split-Path $FilePath -Leaf

# Get a suitable IPv4 address (exclude loopback and APIPA)
$ip = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
  Select-Object -First 1 -ExpandProperty IPAddress -ErrorAction SilentlyContinue

if (-not $ip) {
  $ip = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.*' } |
    Select-Object -First 1 -ExpandProperty IPAddress -ErrorAction SilentlyContinue
}

if (-not $ip) {
  Write-Warning "Could not determine LAN IP address. Use http://localhost:$Port/$filename on this machine or specify IP manually."
}

# Start the Python HTTP server in a new background process
$python = "python"
$startInfo = @{
  FilePath = $python
  ArgumentList = "-m","http.server","$Port","--bind","0.0.0.0"
  WorkingDirectory = $folder
  WindowStyle = 'Hidden'
}

try {
  $proc = Start-Process @startInfo -PassThru
} catch {
  Write-Error "Failed to start Python HTTP server. Ensure Python is installed and on PATH. Error: $_"
  exit 1
}

Write-Output "Serving folder: $folder"
if ($ip) {
  $url = "http://$($ip):$Port/$filename"
  Write-Output "Download URL (LAN): $url"
  Write-Output "Open this on your phone's browser (same Wi-Fi) to download & install."
} else {
  Write-Output "Local URL: http://localhost:$Port/$filename"
}

Write-Output "To stop the server, run: Stop-Process -Id $($proc.Id)"
Write-Output "If your phone cannot reach the URL, check Windows Firewall or run: netsh advfirewall firewall add rule name=\"Python HTTP\" dir=in action=allow protocol=TCP localport=$Port"
