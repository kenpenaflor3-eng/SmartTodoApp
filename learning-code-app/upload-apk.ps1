param(
  [string]$FilePath = "C:\ITE109\learning-code-app\android\app\build\outputs\apk\release\app-release.apk"
)

if (-not (Test-Path $FilePath)) {
  Write-Error "File not found: $FilePath"
  exit 1
}

$filename = Split-Path $FilePath -Leaf

function Try-Upload {
  param($Args)
  $out = & 'curl.exe' @Args 2>&1
  $code = $LASTEXITCODE
  return @{ ExitCode = $code; Output = $out -join "`n" }
}

Write-Output "Uploading $FilePath ..."

# 1) transfer.sh (PUT)
$res = Try-Upload @("--silent","--show-error","--fail","--upload-file",$FilePath,"https://transfer.sh/$filename")
if ($res.ExitCode -eq 0 -and $res.Output) {
  Write-Output "Uploaded to transfer.sh:`n$res.Output"
  exit 0
}

# 2) file.io (multipart form)
$res = Try-Upload @("--silent","--show-error","--fail","-F",("file=@{0}" -f $FilePath),"https://file.io")
if ($res.ExitCode -eq 0 -and $res.Output) {
  Write-Output "Uploaded to file.io:`n$res.Output"
  exit 0
}

# 3) anonfiles
$res = Try-Upload @("--silent","--show-error","--fail","-F",("file=@{0}" -f $FilePath),"https://api.anonfiles.com/upload")
if ($res.ExitCode -eq 0 -and $res.Output) {
  Write-Output "Uploaded to anonfiles:`n$res.Output"
  exit 0
}

Write-Error "All uploads failed. Last output:`n$res.Output"
exit 1
