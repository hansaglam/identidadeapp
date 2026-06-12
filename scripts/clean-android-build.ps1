# Android native build önbelleğini temizler (Windows dosya kilidi sorunları için)
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

if (Test-Path "android\gradlew.bat") {
  & .\android\gradlew.bat --stop 2>$null
}

Stop-Process -Name adb, java -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^(react-native|expo-)' } |
  ForEach-Object {
    $build = Join-Path $_.FullName "android\build"
    if (Test-Path $build) {
      cmd /c "rd /s /q `"$build`"" 2>$null
      Write-Host "cleared $build"
    }
  }

foreach ($dir in @("android\build", "android\.gradle")) {
  if (Test-Path $dir) {
    cmd /c "rd /s /q `"$dir`"" 2>$null
    Write-Host "cleared $dir"
  }
}

Write-Host "Android build cache temizlendi. Simdi: npx expo run:android"
